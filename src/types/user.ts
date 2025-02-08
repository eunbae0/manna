export type User = {
	email?: string | null;
	authType?: AuthType | null;
	displayName?: string | null;
	photoUrl?: string | null;
	joinedGroups?: Array<string> | null;
	createdAt?: string;
	lastLogin?: string;
	// emailVerified?: boolean | null;
};

export type AuthType = 'EMAIL' | 'GOOGLE' | 'APPLE' | 'KAKAO';
