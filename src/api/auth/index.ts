import { FirestoreAuthService } from './service';
import type {
	SignInResponse,
	AuthType,
	ClientUser,
	EmailSignInInput,
	UpdateUserInput,
} from './types';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';
import { arrayUnion } from '@react-native-firebase/firestore';

// Create a single instance of the auth service
const authService = new FirestoreAuthService();

export const signUpWithEmail = withApiLogging(
	async (data: EmailSignInInput): Promise<SignInResponse> => {
		try {
			const userCredential = await authService.signUpWithEmail(data);
			return await authService.handleUserProfile(userCredential, 'EMAIL');
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'signUpWithEmail',
	'auth',
);

/**
 * 이메일로 인증하기
 */
export const signInWithEmail = withApiLogging(
	async (data: EmailSignInInput): Promise<SignInResponse> => {
		try {
			const userCredential = await authService.signInWithEmail(data);
			return await authService.handleUserProfile(userCredential, 'EMAIL');
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'signInWithEmail',
	'auth',
);

/**
 * Apple로 인증하기
 */
export const signInWithApple = withApiLogging(
	async (): Promise<SignInResponse> => {
		try {
			const userCredential = await authService.signInWithApple();
			return await authService.handleUserProfile(userCredential, 'APPLE');
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'signInWithApple',
	'auth',
);

/**
 * Google로 인증하기
 */
export const signInWithGoogle = withApiLogging(
	async (): Promise<SignInResponse> => {
		try {
			const userCredential = await authService.signInWithGoogle();
			return await authService.handleUserProfile(userCredential, 'GOOGLE');
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'signInWithGoogle',
	'auth',
);

export const sendPasswordResetEmail = withApiLogging(
	async (email: string): Promise<void> => {
		try {
			await authService.sendPasswordResetEmail(email);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'sendPasswordResetEmail',
	'auth',
);

/**
 * 이메일 링크로 로그인 링크 전송
 */
// export const sendEmailLink = withApiLogging(
// 	async (email: string): Promise<void> => {
// 		try {
// 			await authService.signInWithEmail({ email, isIncomingLink: false });
// 		} catch (error) {
// 			throw handleApiError(error);
// 		}
// 	},
// 	'sendEmailLink',
// 	'auth',
// );

/**
 * 로그아웃
 */
export const logout = withApiLogging(
	async (authType: AuthType | null): Promise<void> => {
		try {
			await authService.signOut(authType);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'logout',
	'auth',
);

/**
 * 사용자 프로필 조회
 */
export const getUser = withApiLogging(
	async (userId: string): Promise<ClientUser | null> => {
		try {
			return await authService.getUser(userId);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'getUser',
	'auth',
);

/**
 * 사용자 프로필 생성
 */
export const createUser = withApiLogging(
	async (
		userId: string,
		userData: Partial<ClientUser> & { authType: AuthType },
	): Promise<void> => {
		try {
			await authService.createUser(userId, userData);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'createUser',
	'auth',
);

/**
 * 사용자 프로필 업데이트
 */
export const updateUser = withApiLogging(
	async (userId: string, data: UpdateUserInput): Promise<void> => {
		try {
			const { groups, ...firestoreUserData } = data;

			await authService.updateUser(userId, {
				...firestoreUserData,
				groups: arrayUnion(...(data.groups || [])),
			});
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'updateUser',
	'auth',
);

/**
 * 사용자 마지막 로그인 시간 업데이트
 */
export const updateLastLogin = withApiLogging(
	async (userId: string): Promise<void> => {
		try {
			await authService.updateLastLogin(userId);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'updateLastLogin',
	'auth',
);

/**
 * 회원 탈퇴하기
 */
export const deleteAccount = withApiLogging(
	async (): Promise<void> => {
		try {
			await authService.deleteAccount();
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'deleteAccount',
	'auth',
);
