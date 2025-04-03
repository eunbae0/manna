import type { ClientUser } from '@/shared/types';

export type AuthType = 'EMAIL' | 'APPLE' | 'GOOGLE' | 'KAKAO';

/**
 * Authentication types
 */
export enum AuthTypeEnum {
	EMAIL = 'EMAIL',
	APPLE = 'APPLE',
	GOOGLE = 'GOOGLE',
	KAKAO = 'KAKAO',
}

/**
 * Input data for email sign-in
 */
export interface EmailSignInInput {
	email: string;
	password: string;
	// isIncomingLink?: boolean;
}

export interface SignInResponse {
	user: ClientUser;
	existUser: boolean;
}
