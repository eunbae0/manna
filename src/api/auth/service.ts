import { database, auth } from '@/firebase/config';
import {
	AppleAuthProvider,
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
} from '@react-native-firebase/auth';

import {
	doc,
	updateDoc,
	serverTimestamp,
} from '@react-native-firebase/firestore';
import {
	deleteUser,
	GoogleAuthProvider,
	reauthenticateWithCredential,
	signOut,
	signInWithCredential,
	type FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
	GoogleSignin,
	isSuccessResponse,
	statusCodes,
} from '@react-native-google-signin/google-signin';

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthType, EmailSignInInput, SignInResponse } from './types';
import { Alert } from 'react-native';
import { getUserService } from '../user/service';
import type { ClientUser, FirestoreUser } from '@/shared/types';
import { createUser } from '../user';
import { DELETED_MEMBER_DISPLAY_NAME } from '@/shared/constants';
import { ApiError, ErrorCode } from '../errors/types';

/**
 * Firestore service for user authentication and profile operations
 */
export class FirestoreAuthService {
	// 싱글톤 인스턴스를 저장할 정적 변수
	private static instance: FirestoreAuthService | null = null;

	// 싱글톤 인스턴스를 반환하는 정적 메서드
	public static getInstance(): FirestoreAuthService {
		if (!FirestoreAuthService.instance) {
			FirestoreAuthService.instance = new FirestoreAuthService();
		}
		return FirestoreAuthService.instance;
	}

	// 생성자를 private으로 설정하여 외부에서 인스턴스 생성을 방지
	private constructor() {}
	private readonly usersCollectionPath: string = 'users';

	async signUpWithEmail(
		data: EmailSignInInput,
	): Promise<FirebaseAuthTypes.UserCredential> {
		const { email, password } = data;
		return await createUserWithEmailAndPassword(auth, email, password);
	}

	/**
	 * Signs in with email and password or email link
	 * @param data Email sign-in data
	 * @returns User credential
	 */
	async signInWithEmail(
		data: EmailSignInInput,
	): Promise<FirebaseAuthTypes.UserCredential> {
		const { email, password } = data;
		return await signInWithEmailAndPassword(auth, email, password);

		// if (data.isIncomingLink) {
		// 	// Handle incoming email link
		// 	if (!isSignInWithEmailLink(auth, data.email)) {
		// 		throw new Error('Invalid sign in link');
		// 	}

		// 	const email = await this.retrieveEmailForSignIn();
		// 	const userCredential = await signInWithEmailLink(auth, email, data.email);

		// 	await AsyncStorage.removeItem('emailForSignIn');
		// 	return userCredential;
		// }

		// // Send email link
		// const actionCodeSettings = {
		// 	url: 'https://so-group.web.app/login',
		// 	handleCodeInApp: true,
		// 	iOS: {
		// 		bundleId: 'com.eunbae.sogroup',
		// 	},
		// 	android: {
		// 		packageName: 'com.eunbae.sogroup',
		// 		installApp: true,
		// 		minimumVersion: '12',
		// 	},
		// };

		// await sendSignInLinkToEmail(auth, data.email, actionCodeSettings);
		// await AsyncStorage.setItem('emailForSignIn', data.email);

		// // This is not a real user credential, but we return a mock for consistency
		// return {} as FirebaseAuthTypes.UserCredential;
	}

	/**
	 * Signs in with Apple
	 * @returns User credential
	 */
	async signInWithApple(): Promise<{
		userCredential: FirebaseAuthTypes.UserCredential;
		givenName: string | null;
	}> {
		// Apple 로그인 요청
		const appleAuthCredential = await AppleAuthentication.signInAsync({
			requestedScopes: [
				AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
				AppleAuthentication.AppleAuthenticationScope.EMAIL,
			],
		});

		// Firebase 인증 정보 생성
		const { identityToken, fullName } = appleAuthCredential;
		if (!identityToken) {
			throw new Error('Apple 로그인 실패: 인증 정보가 없습니다');
		}

		const credential = AppleAuthProvider.credential(identityToken);

		// Firebase로 로그인
		const userCredential = await signInWithCredential(auth, credential);
		return { userCredential, givenName: fullName?.givenName ?? null };
	}

	/**
	 * Signs in with Google
	 * @returns User credential
	 */
	async signInWithGoogle(): Promise<FirebaseAuthTypes.UserCredential> {
		// Google Sign-In configuration
		GoogleSignin.configure({
			webClientId:
				'892340902140-k8nh6l58cbfv5k9jotjk8v3ncc2k36cr.apps.googleusercontent.com',
		});
		// Google 로그인 요청
		await GoogleSignin.hasPlayServices({
			showPlayServicesUpdateDialog: true,
		});

		// allow time for play services to initialize
		await new Promise((resolve) => setTimeout(resolve, 100));

		const response = await GoogleSignin.signIn();
		if (!isSuccessResponse(response)) {
			const error = new Error(
				'Google 로그인 실패: 유저가 로그인을 취소했습니다.',
			);
			//@ts-expect-error

			error.code = statusCodes.SIGN_IN_CANCELLED;
			throw error;
		}
		const { idToken } = response.data;
		if (!idToken) {
			throw new Error('Google 로그인 실패: 인증 정보가 없습니다');
		}

		const credential = GoogleAuthProvider.credential(idToken);

		// Firebase로 로그인
		return await signInWithCredential(auth, credential);
	}

	async sendPasswordResetEmail(email: string): Promise<void> {
		return await sendPasswordResetEmail(auth, email);
	}

	/**
	 * Signs out the current user
	 */
	async signOut(authType: AuthType | null): Promise<void> {
		if (authType === 'GOOGLE') {
			GoogleSignin.configure({
				webClientId:
					'892340902140-k8nh6l58cbfv5k9jotjk8v3ncc2k36cr.apps.googleusercontent.com',
				scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
			});
			await GoogleSignin.signOut();
			await signOut(auth);
			return;
		}
		await signOut(auth);
	}

	/**
	 * Retrieves the email for sign-in from AsyncStorage
	 */
	private async retrieveEmailForSignIn(): Promise<string> {
		const email = await AsyncStorage.getItem('emailForSignIn');
		if (!email) {
			throw new Error('No email found for sign-in');
		}
		return email;
	}

	/**
	 * Deletes the current user account
	 * @returns Promise that resolves when the account is deleted
	 */
	async deleteAccount(): Promise<void> {
		const currentUser = auth.currentUser;
		if (!currentUser) {
			throw new Error('로그인된 사용자가 없어요.');
		}

		const userId = currentUser.uid;
		const userDocRef = doc(database, this.usersCollectionPath, userId);

		try {
			// 1. 재인증 실행
			// 인증 제공자에 따라 적절한 방법으로 재인증 실행
			const providerData = currentUser.providerData[0];
			if (providerData?.providerId === 'apple.com') {
				// Apple 인증의 경우
				try {
					// Apple 인증 정보 가져오기
					const { identityToken } = await AppleAuthentication.refreshAsync({
						user: userId,
					});

					const authCredential = AppleAuthProvider.credential(identityToken);

					await reauthenticateWithCredential(currentUser, authCredential);
				} catch (appleError) {
					throw new Error(`Apple 재인증 실패: ${appleError}`);
				}
			} else if (providerData?.providerId === 'google.com') {
				GoogleSignin.configure({
					webClientId:
						'892340902140-k8nh6l58cbfv5k9jotjk8v3ncc2k36cr.apps.googleusercontent.com',
					scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
				});
				// Google 인증의 경우
				try {
					// Google 인증 정보 가져오기
					await GoogleSignin.hasPlayServices({
						showPlayServicesUpdateDialog: true,
					});
					const response = await GoogleSignin.signIn();

					if (!isSuccessResponse(response)) {
						throw new Error('Google 재인증 실패: 유저가 로그인을 취소했어요.');
					}

					const { idToken } = response.data;
					if (!idToken) {
						throw new Error('Google 재인증 실패: 인증 정보가 없어요');
					}

					const authCredential = GoogleAuthProvider.credential(idToken);

					await reauthenticateWithCredential(currentUser, authCredential);
					await GoogleSignin.signOut();
					await GoogleSignin.revokeAccess();
				} catch (googleError) {
					console.error(`Google 재인증 오류: ${googleError}`);
					throw new Error('재인증에 실패했어요. 다시 시도해주세요.');
				}
			}

			// 2. Firebase Authentication에서 사용자 삭제
			await deleteUser(currentUser);

			// 3. Firestore에서 사용자 데이터 soft delete 처리
			await updateDoc(userDocRef, {
				displayName: DELETED_MEMBER_DISPLAY_NAME,
				isDeleted: true,
				deletedAt: serverTimestamp(),
			});
		} catch (error: unknown) {
			// 재인증 관련 에러 처리
			if (
				typeof error === 'object' &&
				error !== null &&
				'code' in error &&
				typeof error.code === 'string' &&
				error.code === 'auth/requires-recent-login'
			) {
				// 사용자에게 알림 표시
				Alert.alert(
					'다시 로그인해주세요',
					'보안을 위해 다시 로그인한 후 탈퇴해주세요.',
					[{ text: '확인' }],
				);
			}

			// 기타 모든 에러는 그대로 전파
			throw error;
		}
	}

	/**
	 * Creates a new user profile and returns the user data
	 * @param userCredential User credential from authentication
	 * @param authType Authentication type
	 * @param fcmTokens Optional FCM token for push notifications
	 * @returns New user data and existUser flag set to false
	 */
	async handleNewUserCreation(
		userCredential: FirebaseAuthTypes.UserCredential,
		authType: AuthType,
		fcmTokens?: string | null,
	): Promise<SignInResponse> {
		const userId = userCredential.user.uid;
		// 타입 오류를 피하기 위해 authType을 먼저 정의
		const userData = {
			email: userCredential.user.email || '',
			authType,
		} as Partial<FirestoreUser> & { authType: AuthType };

		// FCM 토큰이 있으면 추가
		if (fcmTokens) {
			userData.fcmTokens = [fcmTokens];
		}

		const newUser = await createUser(userId, userData);
		return { user: newUser, existUser: false };
	}

	/**
	 * Updates an existing user's last login time and FCM token if provided, then returns the user data
	 * @param userId User ID
	 * @param user Existing user data
	 * @param fcmTokens Optional FCM token for push notifications
	 * @returns Existing user data and existUser flag set to true
	 */
	async handleExistingUser(
		userId: string,
		user: ClientUser,
		fcmTokens?: string | null,
	): Promise<SignInResponse> {
		if (fcmTokens) {
			const isExist =
				user.fcmTokens?.findIndex((token) => token === fcmTokens) !== -1;
			const updateData = Object.assign(
				{
					lastLogin: serverTimestamp(),
				},
				isExist
					? {}
					: {
							fcmTokens: [...(user.fcmTokens || []), fcmTokens],
						},
			);
			await getUserService().updateUser(userId, updateData);
		} else {
			await getUserService().updateLastLogin(userId);
		}
		return { user, existUser: true };
	}

	/**
	 * Handles user profile after authentication
	 * @param userCredential User credential
	 * @param authType Authentication type
	 * @param fcmTokens Optional FCM token for push notifications
	 */
	async handleUserProfile(
		userCredential: FirebaseAuthTypes.UserCredential,
		authType: AuthType,
		fcmTokens?: string | null,
	): Promise<SignInResponse> {
		const userId = userCredential.user.uid;

		// 기존 사용자 확인
		const user = await getUserService().getUser(userId);
		// 사용자 존재 여부에 따라 적절한 핸들러 호출
		if (user) {
			return await this.handleExistingUser(userId, user, fcmTokens);
		}
		return this.handleNewUserCreation(userCredential, authType, fcmTokens);
	}
}

export const getAuthService = (): FirestoreAuthService => {
	return FirestoreAuthService.getInstance();
};
