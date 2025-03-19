import type { Timestamp } from 'firebase/firestore';

export interface WorshipType {
	id: string;
	name: string;
	createdAt?: Timestamp;
	updatedAt?: Timestamp;
}
