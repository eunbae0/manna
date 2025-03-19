import type { User } from '@/types/user';
import type { FieldValue, Timestamp } from 'firebase/firestore';

/**
 * Member type for prayer requests
 */
export type Member = Pick<User, 'id' | 'displayName' | 'photoUrl'>;

/**
 * Reaction type for prayer requests
 */
export type PrayerRequestReaction = {
	type: 'LIKE';
	member: Member;
};

/**
 * Server-side PrayerRequest with Timestamp objects
 * Used for Firestore storage and retrieval
 */
export interface PrayerRequest {
	id: string;
	groupId: string;
	createdAt: FieldValue;
	updatedAt: FieldValue;
	date: Timestamp;
	member: Member;
	value: string;
	reactions: PrayerRequestReaction[];
}

/**
 * Client-side PrayerRequest with JavaScript Date objects
 * Used for application logic and UI rendering
 */
export interface ClientPrayerRequest {
	id: string;
	groupId: string;
	createdAt: Date;
	updatedAt: Date;
	date: Date;
	member: Member;
	value: string;
	reactions: PrayerRequestReaction[];
}

/**
 * Input data for creating a new prayer request
 */
export type CreatePrayerRequestInput = Omit<
	ClientPrayerRequest,
	'id' | 'groupId' | 'createdAt' | 'updatedAt' | 'reactions'
> & {
	reactions?: PrayerRequestReaction[];
};

/**
 * Input data for updating an existing prayer request
 */
export type UpdatePrayerRequestInput = Partial<
	Omit<ClientPrayerRequest, 'id' | 'groupId' | 'createdAt'>
>;
