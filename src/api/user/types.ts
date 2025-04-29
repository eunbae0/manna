import type { FieldValue } from '@react-native-firebase/firestore';
import type { ClientGroup } from '../group/types';
import type { AuthType } from '../auth/types';

export type UserGroup = {
	groupId: ClientGroup['id'];
	notificationPreferences?: {
		fellowship: boolean;
		prayerRequest: boolean;
	};
	/**
	 * 대표 그룹 여부 (true = 대표 그룹)
	 */
	isMain?: boolean;
};

export type ManagedUserGroup = Pick<UserGroup, 'groupId'>;

/**
 * Server-side User with Firestore specific fields
 * Used for Firestore storage and retrieval
 */
export interface FirestoreUser {
	id: string;
	email?: string | null;
	displayName?: string | null;
	photoUrl?: string | null;
	authType: AuthType;
	authId?: string | null;
	statusMessage?: string | null;
	createdAt?: FieldValue;
	lastLogin?: FieldValue;
	isDeleted?: boolean;
	deletedAt?: FieldValue;
	fcmTokens?: string[] | null;
}

/**
 * Client-side User with JavaScript Date objects
 * Used for application logic and UI rendering
 */
export interface ClientUser
	extends Omit<FirestoreUser, 'createdAt' | 'lastLogin' | 'deletedAt'> {
	groups?: UserGroup[];
}

/**
 * Input data for updating user profile
 */
export type UpdateUserInput = Partial<Omit<ClientUser, 'id'>>;
