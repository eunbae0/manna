import {
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	where,
	updateDoc,
	deleteDoc,
	Timestamp,
	type DocumentData,
	type CollectionReference,
	type DocumentReference,
	setDoc,
} from 'firebase/firestore';
import { database } from '@/firebase/config';
import type { Fellowship, ClientFellowship } from './types';
import { serverTimestamp } from '@/firebase/firestore';
import { FirestoreService } from '../services';
import { v4 as uuidv4 } from 'uuid';

/**
 * Fellowship service class for handling Firestore operations related to fellowship data
 */
export class FirestoreFellowshipService extends FirestoreService {
	private groupId: string;

	constructor(groupId?: string) {
		super();
		this.groupId = groupId || '';
	}

	/**
	 * Sets the current group ID
	 * @param groupId The group ID to set
	 */
	setGroupId(groupId: string): void {
		this.groupId = groupId;
	}

	/**
	 * Gets the fellowship collection reference for a specific group
	 * @returns CollectionReference for the fellowship collection
	 */
	getFellowshipCollectionRef(): CollectionReference<DocumentData> {
		if (!this.groupId) {
			throw new Error('Group ID is not set');
		}
		return collection(database, 'groups', this.groupId, 'fellowship');
	}
	/**
	 * Gets a specific fellowship document reference
	 * @param fellowshipId ID of the fellowship document
	 * @returns DocumentReference for the fellowship document
	 */
	getFellowshipDocRef(fellowshipId: string): DocumentReference<DocumentData> {
		if (!this.groupId) {
			throw new Error('Group ID is not set');
		}
		return doc(database, 'groups', this.groupId, 'fellowship', fellowshipId);
	}

	/**
	 * Fetches all fellowships for a specific group
	 * @returns Array of fellowship data
	 */
	async getGroupFellowships(): Promise<Fellowship[]> {
		const q = query(
			this.getFellowshipCollectionRef(),
			orderBy('createdAt', 'desc'),
		);
		const querySnapshot = await getDocs(q);

		const fellowships: Fellowship[] = [];
		for (const doc of querySnapshot.docs) {
			const data = doc.data() as DocumentData;
			fellowships.push({
				id: doc.id,
				groupId: this.groupId,
				...data,
			} as Fellowship);
		}

		return fellowships;
	}

	/**
	 * Fetches a specific fellowship by ID
	 * @param fellowshipId ID of the fellowship to fetch
	 * @returns Fellowship data or null if not found
	 */
	async getFellowshipById(
		fellowshipId: string,
	): Promise<ClientFellowship | null> {
		const docRef = this.getFellowshipDocRef(fellowshipId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data() as Fellowship;

			return {
				...data,
				info: {
					...data.info,
					date: data.info.date.toDate(),
				},
			} as ClientFellowship;
		}

		return null;
	}

	/**
	 * Creates a new fellowship for a group
	 * @param fellowshipData Fellowship data to be saved
	 * @returns ID of the created fellowship
	 */
	async createFellowship(
		fellowshipData: Omit<
			ClientFellowship,
			'id' | 'groupId' | 'createdAt' | 'updatedAt'
		>,
	): Promise<string> {
		const id = uuidv4();
		const processedData = {
			...fellowshipData,
			id,
			groupId: this.groupId,
			info: {
				...fellowshipData.info,
				date: Timestamp.fromDate(fellowshipData.info.date),
				preachTitle: fellowshipData.info.preachTitle || '',
			},
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		} satisfies Fellowship;
		await setDoc(this.getFellowshipDocRef(id), processedData);
		return id;
	}

	/**
	 * Updates an existing fellowship
	 * @param fellowshipId ID of the fellowship to update
	 * @param fellowshipData Updated fellowship data
	 */
	async updateFellowship(
		fellowshipId: string,
		fellowshipData: Partial<
			Omit<ClientFellowship, 'id' | 'groupId' | 'createdAt'>
		>,
	): Promise<void> {
		const docRef = this.getFellowshipDocRef(fellowshipId);

		const processedData = {
			...fellowshipData,
			info: {
				...fellowshipData.info,
				date: Timestamp.fromDate(fellowshipData.info?.date ?? new Date()),
			},
			updatedAt: serverTimestamp(),
		} satisfies { info: Partial<Fellowship['info']> } & Omit<
			Partial<Fellowship>,
			'info'
		>;

		await updateDoc(docRef, processedData);
	}

	/**
	 * Deletes a fellowship
	 * @param fellowshipId ID of the fellowship to delete
	 */
	async deleteFellowship(fellowshipId: string): Promise<void> {
		const docRef = this.getFellowshipDocRef(fellowshipId);
		await deleteDoc(docRef);
	}

	/**
	 * Fetches fellowships by date range
	 * @param startDate Start date of the range
	 * @param endDate End date of the range
	 * @returns Array of fellowship data within the date range
	 */
	async getFellowshipsByDateRange(
		startDate: Date,
		endDate: Date,
	): Promise<ClientFellowship[]> {
		const startTimestamp = Timestamp.fromDate(startDate);
		const endTimestamp = Timestamp.fromDate(endDate);

		const q = query(
			this.getFellowshipCollectionRef(),
			where('info.date', '>=', startTimestamp),
			where('info.date', '<=', endTimestamp),
			orderBy('info.date', 'desc'),
		);

		const querySnapshot = await getDocs(q);

		const fellowships: ClientFellowship[] = [];
		for (const doc of querySnapshot.docs) {
			const data = doc.data() as Fellowship;
			fellowships.push({
				...data,
				info: {
					...data.info,
					date: data.info.date.toDate(),
				},
			} as ClientFellowship);
		}

		return fellowships;
	}
}
