import {
	collection,
	doc,
	getDoc,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	serverTimestamp,
	query,
	where,
	orderBy,
	Timestamp,
	setDoc,
	type FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { database } from '@/firebase/config';
import type {
	PrayerRequest,
	ClientPrayerRequest,
	CreatePrayerRequestInput,
	UpdatePrayerRequestInput,
	PrayerRequestReaction,
	Member,
} from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Firestore service for prayer request operations
 */
export class FirestorePrayerRequestService {
	private readonly groupId: string;
	private readonly collectionPath: string;

	private static instance: FirestorePrayerRequestService | null = null;

	public static getInstance(groupId: string): FirestorePrayerRequestService {
		if (!FirestorePrayerRequestService.instance) {
			FirestorePrayerRequestService.instance =
				new FirestorePrayerRequestService(groupId);
		}
		return FirestorePrayerRequestService.instance;
	}

	/**
	 * Creates a new prayer request service for a specific group
	 * @param groupId ID of the group
	 */
	private constructor(groupId: string) {
		this.groupId = groupId;
		this.collectionPath = `groups/${groupId}/prayer-requests`;
	}

	/**
	 * Converts a Firestore prayer request to a client prayer request
	 * @param data Firestore prayer request data
	 * @returns Client prayer request
	 */
	private convertToClientPrayerRequest(
		id: string,
		data: FirebaseFirestoreTypes.DocumentData,
	): ClientPrayerRequest {
		return {
			id,
			groupId: this.groupId,
			createdAt: data.createdAt?.toDate() || new Date(),
			updatedAt: data.updatedAt?.toDate() || new Date(),
			date: data.date?.toDate() || new Date(),
			member: data.member,
			value: data.value,
			reactions: data.reactions || [],
			isAnonymous: data.isAnonymous,
		};
	}

	/**
	 * Gets all prayer requests for the group
	 * @returns Array of prayer requests
	 */
	async getGroupPrayerRequests(): Promise<ClientPrayerRequest[]> {
		const prayerRequestsRef = collection(database, this.collectionPath);
		const q = query(prayerRequestsRef, orderBy('date', 'desc'));
		const querySnapshot = await getDocs(q);

		const prayerRequests: ClientPrayerRequest[] = [];
		for (const doc of querySnapshot.docs) {
			const data = doc.data();
			prayerRequests.push(this.convertToClientPrayerRequest(doc.id, data));
		}

		return prayerRequests;
	}

	/**
	 * Gets a specific prayer request by ID
	 * @param prayerRequestId ID of the prayer request
	 * @returns Prayer request data or null if not found
	 */
	async getPrayerRequestById(
		prayerRequestId: string,
	): Promise<ClientPrayerRequest | null> {
		const prayerRequestRef = doc(
			database,
			this.collectionPath,
			prayerRequestId,
		);
		const prayerRequestDoc = await getDoc(prayerRequestRef);

		if (!prayerRequestDoc.exists) {
			return null;
		}

		const data = prayerRequestDoc.data() || {};
		return this.convertToClientPrayerRequest(prayerRequestDoc.id, data);
	}

	/**
	 * Gets prayer requests by date range
	 * @param startDate Start date of the range
	 * @param endDate End date of the range
	 * @returns Array of prayer requests within the date range
	 */
	async getPrayerRequestsByDateRange(
		startDate: Date,
		endDate: Date,
	): Promise<ClientPrayerRequest[]> {
		const startTimestamp = Timestamp.fromDate(startDate);
		const endTimestamp = Timestamp.fromDate(endDate);

		const prayerRequestsRef = collection(database, this.collectionPath);
		const q = query(
			prayerRequestsRef,
			where('date', '>=', startTimestamp),
			where('date', '<=', endTimestamp),
			orderBy('date', 'desc'),
		);

		const querySnapshot = await getDocs(q);

		const prayerRequests: ClientPrayerRequest[] = [];
		for (const doc of querySnapshot.docs) {
			const data = doc.data();
			prayerRequests.push(this.convertToClientPrayerRequest(doc.id, data));
		}

		return prayerRequests;
	}

	/**
	 * Creates a new prayer request
	 * @param prayerRequestData Prayer request data to be saved
	 * @returns ID of the created prayer request
	 */
	async createPrayerRequest(
		prayerRequestData: CreatePrayerRequestInput,
	): Promise<string> {
		const id = uuidv4();
		const prayerRequestsRef = doc(database, this.collectionPath, id);

		const { date, ...restData } = prayerRequestData;

		const data: PrayerRequest = {
			...restData,
			id,
			groupId: this.groupId,
			date: Timestamp.fromDate(date),
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
			reactions: prayerRequestData.reactions || [],
		};

		await setDoc(prayerRequestsRef, data);
		return id;
	}

	/**
	 * Updates an existing prayer request
	 * @param prayerRequestId ID of the prayer request to update
	 * @param prayerRequestData Updated prayer request data
	 */
	async updatePrayerRequest(
		prayerRequestId: string,
		prayerRequestData: UpdatePrayerRequestInput,
	): Promise<void> {
		const prayerRequestRef = doc(
			database,
			this.collectionPath,
			prayerRequestId,
		);

		const data: Record<string, any> = {
			...prayerRequestData,
			updatedAt: serverTimestamp(),
		};

		// Convert Date to Timestamp if present
		if (prayerRequestData.date) {
			data.date = Timestamp.fromDate(prayerRequestData.date);
		}

		await updateDoc(prayerRequestRef, data);
	}

	/**
	 * Deletes a prayer request
	 * @param prayerRequestId ID of the prayer request to delete
	 */
	async deletePrayerRequest(prayerRequestId: string): Promise<void> {
		const prayerRequestRef = doc(
			database,
			this.collectionPath,
			prayerRequestId,
		);
		await deleteDoc(prayerRequestRef);
	}

	/**
	 * Adds a reaction to a prayer request
	 * @param prayerRequestId ID of the prayer request
	 * @param reaction Reaction data to add
	 */
	async addReaction(
		prayerRequestId: string,
		reaction: {
			type: 'LIKE';
			member: Member;
		},
	): Promise<void> {
		const prayerRequest = await this.getPrayerRequestById(prayerRequestId);

		if (!prayerRequest) {
			throw new Error(`Prayer request with ID ${prayerRequestId} not found`);
		}

		// Check if the user already reacted
		const existingReactionIndex = prayerRequest.reactions.findIndex(
			(r) => r.member.id === reaction.member.id && r.type === reaction.type,
		);

		let updatedReactions: PrayerRequestReaction[];

		if (existingReactionIndex >= 0) {
			// Remove the reaction if it already exists (toggle behavior)
			updatedReactions = [
				...prayerRequest.reactions.slice(0, existingReactionIndex),
				...prayerRequest.reactions.slice(existingReactionIndex + 1),
			];
		} else {
			// Add the new reaction
			updatedReactions = [...prayerRequest.reactions, reaction];
		}

		await this.updatePrayerRequest(prayerRequestId, {
			reactions: updatedReactions,
		});
	}
}

export const getPrayerRequestService = (
	groupId: string,
): FirestorePrayerRequestService => {
	return FirestorePrayerRequestService.getInstance(groupId);
};
