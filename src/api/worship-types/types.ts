import type { FieldValue, Timestamp } from '@react-native-firebase/firestore';

/**
 * Server-side WorshipType with Timestamp objects
 * Used for Firestore storage and retrieval
 */
export interface WorshipType {
	id: string;
	name: string;
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

/**
 * Client-side WorshipType with JavaScript Date objects
 * Used for application logic and UI rendering
 */
export interface ClientWorshipType {
	id: string;
	name: string;
}

/**
 * Input data for creating a new worship type
 */
export type CreateWorshipTypeInput = Pick<WorshipType, 'id' | 'name'>;

/**
 * Input data for updating an existing worship type
 */
export type UpdateWorshipTypeInput = Pick<WorshipType, 'name'>;
