import {
	collection,
	doc,
	getDocs,
	orderBy,
	query,
	addDoc,
	where,
	type DocumentData,
	writeBatch,
	type CollectionReference,
} from 'firebase/firestore';
import { database } from '@/firebase/config';
import type { WorshipType } from './types';
import { serverTimestamp } from '@/firebase/firestore';
import { FirestoreService } from '../services';

const DEFAULT_WORSHIP_TYPES = ['주일예배', '수요예배', '새벽기도회'];

/**
 * Worship types service class for handling Firestore operations related to worship types
 */
export class FirestoreWorshipTypesService extends FirestoreService {
	getWorshipTypesCollectionRef(): CollectionReference<
		DocumentData,
		DocumentData
	> {
		this.updateUserId();
		return collection(database, 'users', this.userId, 'worshipTypes');
	}
	/**
	 * Fetches all worship types for a specific user
	 * @returns Array of worship types
	 */
	async getUserWorshipTypes(): Promise<WorshipType[]> {
		const ref = this.getWorshipTypesCollectionRef();
		const q = query(ref, orderBy('createdAt', 'asc'));
		const querySnapshot = await getDocs(q);
		const worshipTypes: WorshipType[] = [];
		for (const doc of querySnapshot.docs) {
			const data = doc.data();
			worshipTypes.push({
				id: doc.id,
				name: data.name || '',
				createdAt: data.createdAt,
				updatedAt: data.updatedAt,
			});
		}

		return worshipTypes;
	}

	/**
	 * Creates a new worship type for a user
	 * @param name Name of the worship type
	 * @returns ID of the created worship type
	 */
	async createWorshipType(name: string): Promise<string> {
		const ref = this.getWorshipTypesCollectionRef();
		// Check if worship type with the same name already exists
		const q = query(ref, where('name', '==', name));
		const querySnapshot = await getDocs(q);

		if (!querySnapshot.empty) {
			// Return existing worship type ID if it already exists
			return querySnapshot.docs[0].id;
		}

		const worshipTypeData = {
			name,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};

		const docRef = await addDoc(ref, worshipTypeData);
		return docRef.id;
	}
	/**
	 * Creates default worship types for a user
	 * @returns void
	 */
	async createDefaultWorshipType(): Promise<void> {
		const ref = this.getWorshipTypesCollectionRef();
		const querySnapshot = await getDocs(ref);

		if (!querySnapshot.empty) return;

		const batch = writeBatch(database);

		for (let i = 0; i < DEFAULT_WORSHIP_TYPES.length; i++) {
			const docRef = doc(ref);
			batch.set(docRef, {
				name: DEFAULT_WORSHIP_TYPES[i],
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});
		}

		await batch.commit();
	}
}
