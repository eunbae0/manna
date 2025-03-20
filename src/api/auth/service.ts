import { database, auth } from '@/firebase/config';
import {
	doc,
	getDoc,
	setDoc,
	updateDoc,
	serverTimestamp,
	type DocumentData,
	type FieldValue,
	Timestamp,
} from 'firebase/firestore';
import {
	isSignInWithEmailLink,
	sendSignInLinkToEmail,
	signInWithEmailLink,
	signOut,
	type UserCredential,
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
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
	 * Signs out the current user
	 */
	async signOut(): Promise<void> {
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

		if (user) {
			await this.updateLastLogin(userId);
			return { user, existUser: true };
		}

		// 새 사용자 생성
		const newUser = await this.createUser(userId, {
			email: userCredential.user.email || '',
			authType,
		});
		return { user: newUser, existUser: false };
	}
}
