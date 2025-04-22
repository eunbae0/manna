import { getAuthService } from './service';
import type {
	SignInResponse,
	AuthType,
	EmailSignInInput,
	AppleSignInResponse,
	GoogleSignInResponse,
} from './types';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';
import { requestNotificationPermission } from '../messaging';

export const signUpWithEmail = withApiLogging(
	async (data: EmailSignInInput): Promise<SignInResponse> => {
		try {
			const authService = getAuthService();
			const userCredential = await authService.signUpWithEmail(data);

			// 가입 성공 후 알림 권한 요청 및 토큰 가져오기
			const fcmTokens = await requestNotificationPermission();

			return await authService.handleUserProfile(
				userCredential,
				'EMAIL',
				fcmTokens,
			);
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
			const authService = getAuthService();
			const userCredential = await authService.signInWithEmail(data);

			// 로그인 성공 후 알림 권한 요청 및 토큰 가져오기
			const fcmTokens = await requestNotificationPermission();

			return await authService.handleUserProfile(
				userCredential,
				'EMAIL',
				fcmTokens,
			);
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
	async (): Promise<AppleSignInResponse> => {
		try {
			const authService = getAuthService();
			const { userCredential, givenName } = await authService.signInWithApple();

			// 로그인 성공 후 알림 권한 요청 및 토큰 가져오기
			const fcmTokens = await requestNotificationPermission();

			const signInResponse = await authService.handleUserProfile(
				userCredential,
				'APPLE',
				fcmTokens,
			);

			return { ...signInResponse, givenName };
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
	async (): Promise<GoogleSignInResponse> => {
		try {
			const authService = getAuthService();
			const { userCredential, profileImage } =
				await authService.signInWithGoogle();

			// 로그인 성공 후 알림 권한 요청 및 토큰 가져오기
			const fcmTokens = await requestNotificationPermission();

			const signInResponse = await authService.handleUserProfile(
				userCredential,
				'GOOGLE',
				fcmTokens,
			);

			return { ...signInResponse, profileImage };
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
			const authService = getAuthService();
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
			const authService = getAuthService();
			await authService.signOut(authType);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'logout',
	'auth',
);

/**
 * 회원 탈퇴하기
 */
export const deleteAccount = withApiLogging(
	async (): Promise<void> => {
		try {
			const authService = getAuthService();
			await authService.deleteAccount();
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'deleteAccount',
	'auth',
);
