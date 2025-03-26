import { database, auth } from '@/firebase/config';
import {
	doc,
	getDoc,
	setDoc,
	updateDoc,
	serverTimestamp,
} from 'firebase/firestore';
import {
	deleteUser,
	GoogleAuthProvider,
	isSignInWithEmailLink,
	reauthenticateWithCredential,
	sendSignInLinkToEmail,
	signInWithEmailLink,
	signOut,
	type UserCredential,
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
	GoogleSignin,
	isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { OAuthProvider, signInWithCredential } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithServerTimestamp } from '@/shared/utils/auth';
import type {
	AuthType,
	ClientUser,
	FirestoreUser,
	EmailSignInInput,
	AppleSignInResponse,
} from './types';
import { Alert } from 'react-native';

/**
 * Firestore service for user authentication and profile operations
 */
export class FirestoreAuthService {
	private readonly usersCollectionPath: string = 'users';

	/**
	 * Converts a Firestore user to a client user
	 * @param data Firestore user data
	 * @returns Client user
	 */
	private convertToClientUser(data: FirestoreUser): ClientUser {
		return {
			id: data.id,
			email: data.email,
			displayName: data.displayName,
			photoUrl: data.photoUrl,
			authType: data.authType,
			authId: data.authId,
			groups: data.groups,
			isDeleted: data.isDeleted,
		};
	}

	/**
	 * Gets a user from Firestore by ID
	 * @param userId ID of the user
	 * @returns User data or null if not found
	 */
	async getUser(userId: string): Promise<ClientUser | null> {
		const userRef = doc(database, this.usersCollectionPath, userId);
		const userDoc = await getDoc(userRef);

		if (!userDoc.exists()) {
			return null;
		}

		const data = userDoc.data() as FirestoreUser;
		return this.convertToClientUser(data);
	}

	/**
	 * Creates a new user profile
	 * @param userId ID of the user
	 * @param userData User data to be saved
	 */
	async createUser(
		userId: string,
		userData: Partial<FirestoreUser> & { authType: AuthType },
	): Promise<ClientUser> {
		const userRef = doc(database, this.usersCollectionPath, userId);

		const userWithTimestamp = createUserWithServerTimestamp(
			Object.assign({ id: userId, authType: userData.authType }, userData),
		);

		await setDoc(userRef, userWithTimestamp);
		return { id: userId, ...userData };
	}

	/**
	 * Updates an existing user profile
	 * @param userId ID of the user to update
	 * @param userData Updated user data
	 */
	async updateUser(
		userId: string,
		userData: Partial<FirestoreUser>,
	): Promise<void> {
		const userRef = doc(database, this.usersCollectionPath, userId);

		await updateDoc(userRef, userData);
	}

	/**
	 * Updates a user's last login timestamp
	 * @param userId ID of the user
	 */
	async updateLastLogin(userId: string): Promise<void> {
		const userRef = doc(database, this.usersCollectionPath, userId);
		await updateDoc(userRef, {
			lastLogin: serverTimestamp(),
		});
	}

	/**
	 * Signs in with email link
	 * @param data Email sign-in data
	 * @returns User credential
	 */
	async signInWithEmail(data: EmailSignInInput): Promise<UserCredential> {
		if (data.isIncomingLink) {
			// Handle incoming email link
			if (!isSignInWithEmailLink(auth, data.email)) {
				throw new Error('Invalid sign in link');
			}

			const email = await this.retrieveEmailForSignIn();
			const userCredential = await signInWithEmailLink(auth, email, data.email);

			await AsyncStorage.removeItem('emailForSignIn');
			return userCredential;
		}

		// Send email link
		const actionCodeSettings = {
			url: 'https://so-group.web.app/login',
			handleCodeInApp: true,
			iOS: {
				bundleId: 'com.eunbae.sogroup',
			},
			android: {
				packageName: 'com.eunbae.sogroup',
				installApp: true,
				minimumVersion: '12',
			},
		};

		await sendSignInLinkToEmail(auth, data.email, actionCodeSettings);
		await AsyncStorage.setItem('emailForSignIn', data.email);

		// This is not a real user credential, but we return a mock for consistency
		return {} as UserCredential;
	}

	/**
	 * Signs in with Apple
	 * @returns User credential
	 */
	async signInWithApple(): Promise<UserCredential> {
		// Apple 로그인 요청
		const appleAuthCredential = await AppleAuthentication.signInAsync({
			requestedScopes: [
				AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
				AppleAuthentication.AppleAuthenticationScope.EMAIL,
			],
		});

		// Firebase 인증 정보 생성
		const { identityToken } = appleAuthCredential;
		if (!identityToken) {
			throw new Error('Apple 로그인 실패: 인증 정보가 없습니다');
		}

		const provider = new OAuthProvider('apple.com');
		const credential = provider.credential({
			idToken: identityToken,
		});

		// Firebase로 로그인
		return await signInWithCredential(auth, credential);
	}

	/**
	 * Signs in with Google
	 * @returns User credential
	 */
	async signInWithGoogle(): Promise<UserCredential> {
		// Google Sign-In configuration
		GoogleSignin.configure();

		// Google 로그인 요청
		await GoogleSignin.hasPlayServices();
		const response = await GoogleSignin.signIn();
		if (!isSuccessResponse(response)) {
			throw new Error('Google 로그인 실패: 유저가 로그인을 취소했습니다.');
		}

		// Firebase 인증 정보 생성
		const { idToken } = response.data;
		if (!idToken) {
			throw new Error('Google 로그인 실패: 인증 정보가 없습니다');
		}

		const credential = GoogleAuthProvider.credential(idToken);

		// Firebase로 로그인
		return await signInWithCredential(auth, credential);
	}

	/**
	 * Signs out the current user
	 */
	async signOut(authType: AuthType | null): Promise<void> {
		if (authType === 'GOOGLE') {
			await GoogleSignin.revokeAccess();
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
					const appleCredential = await AppleAuthentication.refreshAsync({
						user: userId,
					});

					const provider = new OAuthProvider('apple.com');
					const authCredential = provider.credential({
						idToken: appleCredential.identityToken || '',
						accessToken: appleCredential.authorizationCode || '',
					});

					await reauthenticateWithCredential(currentUser, authCredential);
				} catch (appleError) {
					throw new Error('재인증에 실패했어요. 다시 시도해주세요.');
				}
			} else if (providerData?.providerId === 'google.com') {
				// Google 인증의 경우
				try {
					// Google 인증 정보 가져오기
					await GoogleSignin.hasPlayServices();
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
				} catch (googleError) {
					console.error('Google 재인증 오류:', googleError);
					throw new Error('재인증에 실패했어요. 다시 시도해주세요.');
				}
			}

			// 2. Firebase Authentication에서 사용자 삭제
			await deleteUser(currentUser);

			// 3. Firestore에서 사용자 데이터 soft delete 처리
			await updateDoc(userDocRef, {
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
	 * Handles user profile after authentication
	 * @param userCredential User credential
	 * @param authType Authentication type
	 */
	async handleUserProfile(
		userCredential: UserCredential,
		authType: AuthType,
	): Promise<AppleSignInResponse> {
		const userId = userCredential.user.uid;

		// 기존 사용자 확인
		const user = await this.getUser(userId);

		if (!user) {
			// 새 사용자 생성
			const newUser = await this.createUser(userId, {
				email: userCredential.user.email || '',
				authType,
			});
			return { user: newUser, existUser: false };
		}

		await this.updateLastLogin(userId);
		return { user, existUser: true };
	}
}
