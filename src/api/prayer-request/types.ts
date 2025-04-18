import type { FirestoreUser } from '@/shared/types';
import type { FieldValue } from '@react-native-firebase/firestore';

export type ReactionType = 'LIKE';

/**
 * Member type for prayer requests
 */
export type ClientGroupMember = Pick<
	FirestoreUser,
	'id' | 'displayName' | 'photoUrl'
>;

export type ServerGroupMember = Pick<FirestoreUser, 'id'>;

export type ServerPrayerRequestReaction = {
	type: ReactionType;
	member: ServerGroupMember;
};

/**
 * Reaction type for prayer requests
 */
export type ClientPrayerRequestReaction = {
	type: ReactionType;
	member: ClientGroupMember;
};

/**
 * Base PrayerRequest interface with common properties
 */
export interface BasePrayerRequest {
	id: string;
	groupId: string;
	value: string;
	isAnonymous: boolean;
}

/**
 * Server-side PrayerRequest with Timestamp objects
 * Used for Firestore storage and retrieval
 */
export interface ServerPrayerRequest extends BasePrayerRequest {
	createdAt: FieldValue;
	updatedAt: FieldValue;
	member: ServerGroupMember;
	reactions: ServerPrayerRequestReaction[];
}

/**
 * Client-side PrayerRequest with JavaScript Date objects
 * Used for application logic and UI rendering
 */
export interface ClientPrayerRequest extends BasePrayerRequest {
	createdAt: Date;
	updatedAt: Date;
	member: ClientGroupMember;
	reactions: ClientPrayerRequestReaction[];
}

/**
 * Input data for creating a new prayer request
 */
export type CreatePrayerRequestInput = Omit<
	BasePrayerRequest,
	'id' | 'groupId'
> &
	Pick<ServerPrayerRequest, 'member'>;

/**
 * Input data for updating an existing prayer request
 */
export type UpdatePrayerRequestInput = Partial<
	Pick<ServerPrayerRequest, 'member' | 'reactions' | 'isAnonymous' | 'value'>
>;
