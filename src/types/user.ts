import type { FieldValue } from 'firebase/firestore';

export type User = {
	email?: string | null;
	authType?: AuthType | null;
	displayName?: string | null;
	photoUrl?: string | null;
	joinedGroups?: Array<string> | null;
	createdAt?: FieldValue;
	lastLogin?: FieldValue;
	// emailVerified?: boolean | null;
};

export type AuthType = 'EMAIL' | 'GOOGLE' | 'APPLE' | 'KAKAO';
