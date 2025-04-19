import {
	collection,
	doc,
	getDoc,
	getDocs,
	updateDoc,
	deleteDoc,
	serverTimestamp,
	query,
	where,
	orderBy,
	Timestamp,
	setDoc,
	type FirebaseFirestoreTypes,
	limit,
	startAfter,
} from '@react-native-firebase/firestore';
import { database } from '@/firebase/config';
import type {
	ClientPrayerRequest,
	CreatePrayerRequestInput,
	UpdatePrayerRequestInput,
	ServerPrayerRequest,
	ServerPrayerRequestReaction,
	ClientGroupMember,
} from './types';
import { v4 as uuidv4 } from 'uuid';
import { DELETED_MEMBER_DISPLAY_NAME } from '@/shared/constants';

const DEFAULT_PRAYER_REQUEST_PAGE_SIZE = 5;

/**
 * Firestore service for prayer request operations
 */
export class FirestorePrayerRequestService {
	private static instance: FirestorePrayerRequestService | null = null;

	public static getInstance(): FirestorePrayerRequestService {
		if (!FirestorePrayerRequestService.instance) {
			FirestorePrayerRequestService.instance =
				new FirestorePrayerRequestService();
		}
		return FirestorePrayerRequestService.instance;
	}

	private readonly collectionPath: string = 'groups';
	private readonly subCollectionPath: string = 'prayer-requests';
	private readonly memberCollectionPath: string = 'members';

	/**
	 * Converts a Firestore prayer request to a client prayer request
	 * @param data Firestore prayer request data
	 * @returns Client prayer request
	 */
	private convertToClientPrayerRequest(
		data: FirebaseFirestoreTypes.DocumentData,
		member: ClientGroupMember,
	): ClientPrayerRequest {
		return {
			id: data.id,
			groupId: data.groupId,
			createdAt: data.createdAt?.toDate() || new Date(),
			updatedAt: data.updatedAt?.toDate() || new Date(),
			member,
			value: data.value,
			reactions: data.reactions || [],
			isAnonymous: data.isAnonymous,
		};
	}

	/**
	 * Gets all prayer requests for the group
	 * @returns Array of prayer requests
	 */
	async getGroupPrayerRequests(
		groupId: string,
		lastKey: string,
	): Promise<ClientPrayerRequest[]> {
		const prayerRequestsRef = collection(
			database,
			this.collectionPath,
			groupId,
			this.subCollectionPath,
		);
		const q = lastKey
			? query(
					prayerRequestsRef,
					orderBy('createdAt', 'desc'),
					startAfter(lastKey),
					limit(DEFAULT_PRAYER_REQUEST_PAGE_SIZE),
				)
			: query(
					prayerRequestsRef,
					orderBy('createdAt', 'desc'),
					limit(DEFAULT_PRAYER_REQUEST_PAGE_SIZE),
				);
		const querySnapshot = await getDocs(q);

		const prayerRequests: ClientPrayerRequest[] = [];
		for (const prayerRequestDoc of querySnapshot.docs) {
			const data = prayerRequestDoc.data() as ServerPrayerRequest;
			const groupMemberDoc = await getDoc(
				doc(
					database,
					this.collectionPath,
					groupId,
					this.memberCollectionPath,
					data.member.id,
				),
			);

			// 탈퇴한 유저인 경우
			if (!groupMemberDoc.exists) {
				prayerRequests.push(
					this.convertToClientPrayerRequest(data, {
						id: data.member.id,
						displayName: DELETED_MEMBER_DISPLAY_NAME,
					}),
				);
				continue;
			}

			const clientMember = groupMemberDoc.data() as ClientGroupMember;
			prayerRequests.push(
				this.convertToClientPrayerRequest(data, clientMember),
			);
		}

		return prayerRequests;
	}

	/**
	 * Gets a specific prayer request by ID
	 * @param prayerRequestId ID of the prayer request
	 * @returns Prayer request data or null if not found
	 */
	async getPrayerRequestById(
		groupId: string,
		prayerRequestId: string,
	): Promise<ClientPrayerRequest | null> {
		const prayerRequestRef = doc(
			database,
			this.collectionPath,
			groupId,
			this.subCollectionPath,
			prayerRequestId,
		);
		const prayerRequestDoc = await getDoc(prayerRequestRef);

		if (!prayerRequestDoc.exists) {
			return null;
		}

		const data = prayerRequestDoc.data() as ServerPrayerRequest;

		const groupMemberDoc = await getDoc(
			doc(
				database,
				this.collectionPath,
				groupId,
				this.memberCollectionPath,
				data.member.id,
			),
		);

		// 탈퇴한 유저인 경우
		if (!groupMemberDoc.exists) {
			return this.convertToClientPrayerRequest(data, {
				id: data.member.id,
				displayName: DELETED_MEMBER_DISPLAY_NAME,
			});
		}
		const clientMember = groupMemberDoc.data() as ClientGroupMember;

		return this.convertToClientPrayerRequest(data, clientMember);
	}

	/**
	 * Gets prayer requests by date range
	 * @param startDate Start date of the range
	 * @param endDate End date of the range
	 * @returns Array of prayer requests within the date range
	 */
	async getPrayerRequestsByDateRange(
		groupId: string,
		startDate: Date,
		endDate: Date,
	): Promise<ClientPrayerRequest[]> {
		const startTimestamp = Timestamp.fromDate(startDate);
		const endTimestamp = Timestamp.fromDate(endDate);

		const prayerRequestsRef = collection(
			database,
			this.collectionPath,
			groupId,
			this.subCollectionPath,
		);
		const q = query(
			prayerRequestsRef,
			where('createdAt', '>=', startTimestamp),
			where('createdAt', '<=', endTimestamp),
			orderBy('createdAt', 'desc'),
		);

		const querySnapshot = await getDocs(q);

		const prayerRequests: ClientPrayerRequest[] = [];
		for (const prayerRequestDoc of querySnapshot.docs) {
			const data = prayerRequestDoc.data() as ServerPrayerRequest;

			const groupMemberDoc = await getDoc(
				doc(
					database,
					this.collectionPath,
					groupId,
					this.memberCollectionPath,
					data.member.id,
				),
			);

			// 탈퇴한 유저인 경우
			if (!groupMemberDoc.exists) {
				prayerRequests.push(
					this.convertToClientPrayerRequest(data, {
						id: data.member.id,
						displayName: DELETED_MEMBER_DISPLAY_NAME,
					}),
				);
				continue;
			}
			const clientMember = groupMemberDoc.data() as ClientGroupMember;
			prayerRequests.push(
				this.convertToClientPrayerRequest(data, clientMember),
			);
		}

		return prayerRequests;
	}

	/**
	 * Creates a new prayer request
	 * @param prayerRequestData Prayer request data to be saved
	 * @returns ID of the created prayer request
	 */
	async createPrayerRequest(
		groupId: string,
		prayerRequestData: CreatePrayerRequestInput,
	): Promise<string> {
		const id = uuidv4();
		const prayerRequestsRef = doc(
			database,
			this.collectionPath,
			groupId,
			this.subCollectionPath,
			id,
		);

		const data: Omit<ServerPrayerRequest, 'reactions'> = {
			...prayerRequestData,
			id,
			groupId,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
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
		groupId: string,
		prayerRequestId: string,
		prayerRequestData: UpdatePrayerRequestInput,
	): Promise<void> {
		const prayerRequestRef = doc(
			database,
			this.collectionPath,
			groupId,
			this.subCollectionPath,
			prayerRequestId,
		);

		const data: Partial<ServerPrayerRequest> = {
			...prayerRequestData,
			updatedAt: serverTimestamp(),
		};

		await updateDoc(prayerRequestRef, data);
	}

	/**
	 * Deletes a prayer request
	 * @param prayerRequestId ID of the prayer request to delete
	 */
	async deletePrayerRequest(
		groupId: string,
		prayerRequestId: string,
	): Promise<void> {
		const prayerRequestRef = doc(
			database,
			this.collectionPath,
			groupId,
			this.subCollectionPath,
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
		groupId: string,
		prayerRequestId: string,
		reaction: ServerPrayerRequestReaction,
	): Promise<void> {
		const prayerRequest = await this.getPrayerRequestById(
			groupId,
			prayerRequestId,
		);

		if (!prayerRequest) {
			throw new Error(`Prayer request with ID ${prayerRequestId} not found`);
		}

		// Check if the user already reacted
		const existingReactionIndex = prayerRequest.reactions.findIndex(
			(r) => r.member.id === reaction.member.id && r.type === reaction.type,
		);

		let updatedReactions: ServerPrayerRequestReaction[];

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

		await this.updatePrayerRequest(groupId, prayerRequestId, {
			reactions: updatedReactions,
		});
	}
}

export const getPrayerRequestService = (): FirestorePrayerRequestService => {
	return FirestorePrayerRequestService.getInstance();
};
