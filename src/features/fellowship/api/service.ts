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
	type FirebaseFirestoreTypes,
	setDoc,
	type FieldValue,
	limit,
} from '@react-native-firebase/firestore';
import { database } from '@/firebase/config';
import type {
	ClientFellowship,
	UpdateFellowshipInput,
	CreateFellowshipInput,
	ServerFellowship,
	ClientFellowshipMember,
} from '@/features/fellowship/api/types';
import { serverTimestamp } from '@/firebase/firestore';
import { flattenObject } from '@/shared/utils/flattenObject';
import { v4 as uuidv4 } from 'uuid';
import { DELETED_MEMBER_DISPLAY_NAME } from '@/shared/constants';
import type { ClientGroupMember } from '@/api/prayer-request/types';

/**
 * Fellowship service class for handling Firestore operations related to fellowship data
 */
export class FirestoreFellowshipService {
	private static instance: FirestoreFellowshipService | null = null;

	public static getInstance(): FirestoreFellowshipService {
		if (!FirestoreFellowshipService.instance) {
			FirestoreFellowshipService.instance = new FirestoreFellowshipService();
		}
		return FirestoreFellowshipService.instance;
	}

	private readonly collectionPath: string = 'groups';
	private readonly subCollectionPath: string = 'fellowship';
	private readonly memberCollectionPath: string = 'members';

	/**
	 * Gets the fellowship collection reference for a specific group
	 * @returns CollectionReference for the fellowship collection
	 */
	private getFellowshipCollectionRef({
		groupId,
	}: {
		groupId: string;
	}): FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData> {
		return collection(
			database,
			this.collectionPath,
			groupId,
			this.subCollectionPath,
		);
	}
	/**
	 * Gets a specific fellowship document reference
	 * @param fellowshipId ID of the fellowship document
	 * @returns DocumentReference for the fellowship document
	 */
	private getFellowshipDocRef({
		groupId,
		fellowshipId,
	}: {
		groupId: string;
		fellowshipId: string;
	}): FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> {
		return doc(
			database,
			this.collectionPath,
			groupId,
			this.subCollectionPath,
			fellowshipId,
		);
	}

	private convertToClientFellowship(
		data: ServerFellowship,
		members: ClientFellowshipMember[],
	): ClientFellowship {
		return {
			...data,
			info: {
				...data.info,
				date: data.info.date.toDate(),
				members,
			},
			content: {
				...data.content,
				iceBreaking: data.content.iceBreaking.map((field) => ({
					...field,
					answers: field.answers.map((answer) => ({
						...answer,
						member: members.find((m) => m.id === answer.member.id)!,
					})),
				})),
				sermonTopic: data.content.sermonTopic.map((field) => ({
					...field,
					answers: field.answers.map((answer) => ({
						...answer,
						member: members.find((m) => m.id === answer.member.id)!,
					})),
				})),
				prayerRequest: data.content.prayerRequest,
			},
		};
	}

	/**
	 * Fetches fellowships for a specific group with pagination
	 * @param groupId ID of the group
	 * @param limit Number of items to fetch per page
	 * @param startAfter Timestamp to start fetching after (for pagination)
	 * @returns Paginated response with fellowship data
	 */
	async getGroupFellowships({
		groupId,
		limitCount = 10,
		startAfter,
	}: {
		groupId: string;
		limitCount?: number;
		startAfter?: Timestamp;
	}): Promise<{
		items: ClientFellowship[];
		hasMore: boolean;
		total: number;
	}> {
		let q: FirebaseFirestoreTypes.Query;

		const _limitCount = limitCount + 1; // Fetch one extra to determine if there are more items

		if (startAfter) {
			q = query(
				this.getFellowshipCollectionRef({ groupId }),
				orderBy('createdAt', 'desc'),
				where('createdAt', '<', startAfter),
				limit(_limitCount),
			);
		} else {
			q = query(
				this.getFellowshipCollectionRef({ groupId }),
				orderBy('createdAt', 'desc'),
				limit(_limitCount),
			);
		}

		const querySnapshot = await getDocs(q);
		const hasMore = querySnapshot.docs.length > _limitCount;

		// If we fetched an extra item to check for more, remove it from the results
		const docs = hasMore
			? querySnapshot.docs.slice(0, _limitCount)
			: querySnapshot.docs;

		const fellowships: ClientFellowship[] = [];
		for (const fellowshipsDoc of docs) {
			const members: ClientFellowshipMember[] = [];
			const data = fellowshipsDoc.data() as ServerFellowship;
			for (const member of data.info.members) {
				const groupMemberDoc = await getDoc(
					doc(
						database,
						this.collectionPath,
						groupId,
						this.memberCollectionPath,
						member.id,
					),
				);

				// 탈퇴유저 또는 게스트유저인 경우
				if (!groupMemberDoc.exists) {
					const clientMember = {
						id: member.id,
						displayName: member.displayName ?? DELETED_MEMBER_DISPLAY_NAME,
						isLeader: member.isLeader,
						isGuest: member.isGuest,
					};
					members.push(clientMember);
					continue;
				}

				const clientMember = groupMemberDoc.data() as ClientGroupMember;
				members.push({
					...clientMember,
					isLeader: member.isLeader,
					isGuest: member.isGuest,
				});
			}
			fellowships.push(this.convertToClientFellowship(data, members));
		}

		return {
			items: fellowships,
			hasMore,
			total: fellowships.length,
		};
	}

	async getRecentFellowshipsWhereUserIsLeader({
		groupId,
		userId,
		limitCount = 5,
	}: {
		groupId: string;
		userId: string;
		limitCount?: number;
	}): Promise<{
		items: ClientFellowship[];
		total: number;
	}> {
		const q = query(
			this.getFellowshipCollectionRef({ groupId }),
			orderBy('createdAt', 'desc'),
			where('info.leaderId', '==', userId),
			limit(limitCount),
		);

		const querySnapshot = await getDocs(q);

		const fellowships: ClientFellowship[] = [];
		for (const fellowshipsDoc of querySnapshot.docs) {
			const members: ClientFellowshipMember[] = [];
			const data = fellowshipsDoc.data() as ServerFellowship;
			for (const member of data.info.members) {
				const groupMemberDoc = await getDoc(
					doc(
						database,
						this.collectionPath,
						groupId,
						this.memberCollectionPath,
						member.id,
					),
				);

				// 탈퇴유저 또는 게스트유저인 경우
				if (!groupMemberDoc.exists) {
					const clientMember = {
						id: member.id,
						displayName: member.displayName ?? DELETED_MEMBER_DISPLAY_NAME,
						isLeader: member.isLeader,
						isGuest: member.isGuest,
					};
					members.push(clientMember);
					continue;
				}

				const clientMember = groupMemberDoc.data() as ClientGroupMember;
				members.push({
					...clientMember,
					isLeader: member.isLeader,
					isGuest: member.isGuest,
				});
			}
			fellowships.push(this.convertToClientFellowship(data, members));
		}

		return {
			items: fellowships,
			total: fellowships.length,
		};
	}

	/**
	 * Fetches a specific fellowship by ID
	 * @param fellowshipId ID of the fellowship to fetch
	 * @returns Fellowship data or null if not found
	 */
	async getFellowshipById({
		groupId,
		fellowshipId,
	}: {
		groupId: string;
		fellowshipId: string;
	}): Promise<ClientFellowship | null> {
		const docRef = this.getFellowshipDocRef({ groupId, fellowshipId });
		const docSnap = await getDoc(docRef);

		if (docSnap.exists) {
			const data = docSnap.data() as ServerFellowship;
			const members: ClientFellowshipMember[] = [];
			for (const member of data.info.members) {
				const groupMemberDoc = await getDoc(
					doc(
						database,
						this.collectionPath,
						groupId,
						this.memberCollectionPath,
						member.id,
					),
				);

				// 탈퇴유저 또는 게스트유저인 경우
				if (!groupMemberDoc.exists) {
					const clientMember = {
						id: member.id,
						displayName: member.displayName ?? DELETED_MEMBER_DISPLAY_NAME,
						isLeader: member.isLeader,
						isGuest: member.isGuest,
					};
					members.push(clientMember);
					continue;
				}

				const clientMember = groupMemberDoc.data() as ClientGroupMember;
				members.push({
					...clientMember,
					isLeader: member.isLeader,
					isGuest: member.isGuest,
				});
			}

			return this.convertToClientFellowship(data, members);
		}

		return null;
	}

	/**
	 * Creates a new fellowship for a group
	 * @param fellowshipData Fellowship data to be saved
	 * @returns ID of the created fellowship
	 */
	async createFellowship(
		{ groupId }: { groupId: string },
		fellowshipData: CreateFellowshipInput,
	): Promise<string> {
		const fellowshipId = uuidv4();
		const processedData = {
			...fellowshipData,
			id: fellowshipId,
			groupId,
			info: {
				...fellowshipData.info,
				date: Timestamp.fromDate(fellowshipData.info.date),
				preachTitle: fellowshipData.info.preachTitle || '',
			},
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		} satisfies ServerFellowship;

		await setDoc(
			this.getFellowshipDocRef({ groupId, fellowshipId }),
			processedData,
		);
		return fellowshipId;
	}

	/**
	 * Updates an existing fellowship
	 * @param fellowshipId ID of the fellowship to update
	 * @param fellowshipData Updated fellowship data
	 */
	async updateFellowship(
		{ groupId, fellowshipId }: { groupId: string; fellowshipId: string },
		fellowshipData: UpdateFellowshipInput,
	): Promise<void> {
		const docRef = this.getFellowshipDocRef({ groupId, fellowshipId });

		// 중첩된 객체를 Firestore의 dot notation으로 변환
		const flattenedData = flattenObject(fellowshipData);

		// updatedAt 필드 추가
		flattenedData.updatedAt = serverTimestamp();

		// info.date가 Date 객체인 경우 Timestamp로 변환
		if (flattenedData['info.date'] instanceof Date) {
			flattenedData['info.date'] = Timestamp.fromDate(
				flattenedData['info.date'] as Date,
			);
		}

		// Firestore에 맞는 타입으로 변환
		type FirestoreUpdateData = {
			[key: string]: FieldValue | Partial<unknown> | undefined;
		};
		const updateData: FirestoreUpdateData = {};

		for (const [key, value] of Object.entries(flattenedData)) {
			updateData[key] = value as FieldValue | Partial<unknown> | undefined;
		}

		await updateDoc(docRef, updateData);
	}

	/**
	 * Deletes a fellowship
	 * @param { groupId: string; fellowshipId: string } ID of the fellowship to delete
	 */
	async deleteFellowship({
		groupId,
		fellowshipId,
	}: { groupId: string; fellowshipId: string }): Promise<void> {
		const docRef = this.getFellowshipDocRef({ groupId, fellowshipId });
		await deleteDoc(docRef);
	}

	/**
	 * Fetches fellowships by date range
	 * @param startDate Start date of the range
	 * @param endDate End date of the range
	 * @returns Array of fellowship data within the date range
	 */
	async getFellowshipsByDateRange(
		{ groupId }: { groupId: string },
		startDate: Date,
		endDate: Date,
	): Promise<ClientFellowship[]> {
		const startTimestamp = Timestamp.fromDate(startDate);
		const endTimestamp = Timestamp.fromDate(endDate);

		const q = query(
			this.getFellowshipCollectionRef({ groupId }),
			where('info.date', '>=', startTimestamp),
			where('info.date', '<=', endTimestamp),
			orderBy('info.date', 'desc'),
		);

		const querySnapshot = await getDocs(q);

		const fellowships: ClientFellowship[] = [];
		for (const fellowshipDoc of querySnapshot.docs) {
			const data = fellowshipDoc.data() as ServerFellowship;
			const members: ClientFellowshipMember[] = [];
			for (const member of data.info.members) {
				const groupMemberDoc = await getDoc(
					doc(
						database,
						this.collectionPath,
						groupId,
						this.memberCollectionPath,
						member.id,
					),
				);

				// 탈퇴유저 또는 게스트유저인 경우
				if (!groupMemberDoc.exists) {
					const clientMember = {
						id: member.id,
						displayName: member.displayName ?? DELETED_MEMBER_DISPLAY_NAME,
						isLeader: member.isLeader,
						isGuest: member.isGuest,
					};
					members.push(clientMember);
					continue;
				}

				const clientMember = groupMemberDoc.data() as ClientGroupMember;
				members.push({
					...clientMember,
					isLeader: member.isLeader,
					isGuest: member.isGuest,
				});
			}
			fellowships.push(this.convertToClientFellowship(data, members));
		}

		return fellowships;
	}
}

export const getFellowshipService = (): FirestoreFellowshipService => {
	return FirestoreFellowshipService.getInstance();
};
