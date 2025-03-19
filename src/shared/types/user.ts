import type { FieldValue } from 'firebase/firestore';

export type User = {
	id: string;
	email?: string | null;
	authType?: AuthType | null;
	displayName?: string | null;
	photoUrl?: string | null;
	joinedGroups?: Array<string> | null;
	createdAt?: FieldValue;
	lastLogin?: FieldValue;
	groups?: Array<Group> | null;
	// emailVerified?: boolean | null;
};

export type AuthType = 'EMAIL' | 'GOOGLE' | 'APPLE' | 'KAKAO';

export type Group = {
	id: string;
	users: Array<User> | null;
};
