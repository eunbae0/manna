import { auth } from '@/firebase/config';
import type { AuthType } from './types';
import { AppleAuthProvider } from './providers/apple';
import { EmailAuthProvider } from './providers/email';
import { FirestoreUserProfile } from './profile';
import { signOut } from '@/firebase/auth';
import type { User } from '@/types/user';
import type { UserCredential } from 'firebase/auth';
import { handleApiError } from '../errors';
import { serverTimestamp } from '@/firebase/firestore';

const emailAuthProvider = new EmailAuthProvider();
const appleAuthProvider = new AppleAuthProvider();
const userProfileService = new FirestoreUserProfile();

/**
 * 인증 서비스 메서드
 */
export async function signIn<T extends AuthType>(
	type: AuthType,
	data?: T extends 'EMAIL' ? { email: string } : undefined,
): Promise<void> {
	let userCredential: UserCredential;

	switch (type) {
		case 'EMAIL':
			if (!data?.email)
				throw handleApiError({ message: '이메일은 필수입니다.' });
			userCredential = await emailAuthProvider.signIn(data.email);
			break;
		case 'APPLE':
			userCredential = await appleAuthProvider.signIn();
			break;
		default:
			throw handleApiError({ message: '지원하지 않는 인증 타입입니다.' });
	}
	await handleUserProfile(userCredential, type);
}

/**
 * 이메일 링크로 로그인 링크 전송
 */
export async function sendEmailLink(email: string): Promise<void> {
	await emailAuthProvider.sendEmailLink(email);
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
	try {
		await signOut(auth);
	} catch (error) {
		throw handleApiError(error);
	}
}

/**
 * 사용자 프로필 처리
 */
async function handleUserProfile(
	userCredential: UserCredential,
	authType: AuthType,
): Promise<void> {
	const userId = userCredential.user.uid;

	try {
		// 기존 사용자 확인
		const user = await userProfileService.getUser(userId);

		if (user) {
			await userProfileService.updateUser(userId, {
				lastLogin: serverTimestamp(),
			});
			return;
		}

		await userProfileService.createUser(userId, {
			email: userCredential.user.email,
			authType,
		});
	} catch (error) {
		throw handleApiError(error);
	}
}

/**
 * 사용자 프로필 메서드 내보내기
 */
export const getFirestoreUser = (userId: string): Promise<User | null> =>
	userProfileService.getUser(userId);

export const createFirestoreUser = (
	userId: string,
	user: Partial<User>,
): Promise<void> => userProfileService.createUser(userId, user);

export const updateFirestoreUser = (
	userId: string,
	data: Partial<User>,
): Promise<void> => userProfileService.updateUser(userId, data);
