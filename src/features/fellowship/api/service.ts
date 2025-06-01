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
	onSnapshot,
} from '@react-native-firebase/firestore';
import { database } from '@/firebase/config';
import type {
	CreateFellowshipInputV2,
	ServerFellowshipV2,
	UpdateFellowshipInputV2,
	ClientFellowshipV2,
	ClientFellowshipParticipantV2,
	CompactClientFellowshipV2,
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

	// 멤버 정보 캐시
	private memberCache: Map<string, Map<string, ClientFellowshipParticipantV2>> =
		new Map();

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
		data: ServerFellowshipV2,
		participants: ClientFellowshipParticipantV2[],
	): ClientFellowshipV2 {
		return {
			...data,
			info: {
				...data.info,
				date: data.info.date.toDate(),
				participants,
			},
		};
	}
	private convertToCompactClientFellowship(
		data: ServerFellowshipV2,
	): CompactClientFellowshipV2 {
		return {
			...data,
			info: {
				...data.info,
				date: data.info.date.toDate(),
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
		limitCount = 8,
		startAfter,
	}: {
		groupId: string;
		limitCount?: number;
		startAfter?: Timestamp;
	}): Promise<{
		items: ClientFellowshipV2[];
		hasMore: boolean;
		total: number;
	}> {
		let q: FirebaseFirestoreTypes.Query;

		const _limitCount = limitCount + 1; // Fetch one extra to determine if there are more items

		if (startAfter) {
			q = query(
				this.getFellowshipCollectionRef({ groupId }),
				orderBy('info.date', 'desc'),
				where('info.date', '<', startAfter),
				limit(_limitCount),
			);
		} else {
			q = query(
				this.getFellowshipCollectionRef({ groupId }),
				orderBy('info.date', 'desc'),
				limit(_limitCount),
			);
		}

		const querySnapshot = await getDocs(q);
		const hasMore = querySnapshot.docs.length > limitCount;

		// If we fetched an extra item to check for more, remove it from the results
		const docs = hasMore
			? querySnapshot.docs.slice(0, limitCount)
			: querySnapshot.docs;

		const fellowships: ClientFellowshipV2[] = [];
		for (const fellowshipsDoc of docs) {
			const participants: ClientFellowshipParticipantV2[] = [];
			const data = fellowshipsDoc.data() as ServerFellowshipV2;
			const memberPromises = data.info.participants.map((member) =>
				this.getParticipantWithCache(groupId, member.id, {
					displayName: member.displayName,
				}),
			);

			// 병렬로 멤버 정보 조회
			const memberResults = await Promise.all(memberPromises);
			participants.push(...memberResults);

			const fellowship = this.convertToClientFellowship(data, participants);
			fellowships.push(fellowship);
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
		items: CompactClientFellowshipV2[];
		total: number;
	}> {
		const q = query(
			this.getFellowshipCollectionRef({ groupId }),
			orderBy('info.date', 'desc'),
			where('roles.leaderId', '==', userId),
			limit(limitCount),
		);

		const querySnapshot = await getDocs(q);

		const fellowships: CompactClientFellowshipV2[] = [];
		for (const fellowshipsDoc of querySnapshot.docs) {
			const data = fellowshipsDoc.data() as ServerFellowshipV2;
			fellowships.push(this.convertToCompactClientFellowship(data));
		}

		return {
			items: fellowships,
			total: fellowships.length,
		};
	}

	/**
	 * 특정 사용자가 참여한 나눔을 가져옵니다
	 * @param groupId 그룹 ID
	 * @param userId 사용자 ID
	 * @param limitCount 가져올 항목 수
	 * @param startAfter 페이지네이션을 위한 시작점
	 * @returns 페이지네이션된 나눔 데이터
	 */
	async getUserFellowships({
		groupId,
		userId,
		limitCount = 8,
		startAfter,
	}: {
		groupId: string;
		userId: string;
		limitCount?: number;
		startAfter?: Timestamp;
	}): Promise<{
		items: ClientFellowshipV2[];
		hasMore: boolean;
		total: number;
	}> {
		// 서버에서 특정 사용자가 참여한 나눔만 필터링하기 위한 쿼리
		// Firestore에서는 배열 내 특정 값을 포함하는 문서를 찾기 위해 array-contains 연산자를 사용
		const q = query(
			this.getFellowshipCollectionRef({ groupId }),
			orderBy('info.date', 'desc'),
			where('info.participants', 'array-contains', { id: userId }),
			...(startAfter ? [startAfter] : []),
			limit(limitCount + 1), // 추가 항목을 가져와서 더 있는지 확인
		);

		const querySnapshot = await getDocs(q);
		const _limitCount = limitCount || 10;
		const hasMore = querySnapshot.docs.length > _limitCount;

		// 추가 항목이 있으면 결과에서 제외
		const docs = hasMore
			? querySnapshot.docs.slice(0, _limitCount)
			: querySnapshot.docs;

		const fellowships: ClientFellowshipV2[] = [];
		for (const fellowshipsDoc of docs) {
			const members: ClientFellowshipParticipantV2[] = [];
			const data = fellowshipsDoc.data() as ServerFellowshipV2;
			const memberPromises = data.info.participants.map((member) =>
				this.getParticipantWithCache(groupId, member.id, {
					displayName: member.displayName,
				}),
			);

			// 병렬로 멤버 정보 조회
			const memberResults = await Promise.all(memberPromises);
			members.push(...memberResults);

			const fellowship = this.convertToClientFellowship(data, members);
			fellowships.push(fellowship);
		}

		return {
			items: fellowships,
			hasMore,
			total: fellowships.length,
		};
	}

	/**
	 * Fetches fellowships by date
	 * @param groupId ID of the group
	 * @param date Date to fetch fellowships for
	 * @returns Array of fellowships
	 */
	async getFellowshipsByDate({
		groupId,
		date,
	}: {
		groupId: string;
		date: Date;
	}): Promise<ClientFellowshipV2[]> {
		const nextDay = new Date(date);
		nextDay.setDate(date.getDate() + 1);
		const q = query(
			this.getFellowshipCollectionRef({ groupId }),
			orderBy('info.date', 'desc'),
			where('info.date', '>=', date),
			where('info.date', '<=', nextDay),
		);

		const querySnapshot = await getDocs(q);

		const fellowships: ClientFellowshipV2[] = [];
		for (const fellowshipsDoc of querySnapshot.docs) {
			const members: ClientFellowshipParticipantV2[] = [];
			const data = fellowshipsDoc.data() as ServerFellowshipV2;
			const memberPromises = data.info.participants.map((member) =>
				this.getParticipantWithCache(groupId, member.id, {
					displayName: member.displayName,
				}),
			);

			// 병렬로 멤버 정보 조회
			const memberResults = await Promise.all(memberPromises);
			members.push(...memberResults);

			const fellowship = this.convertToClientFellowship(data, members);
			fellowships.push(fellowship);
		}

		return fellowships;
	}

	/**
	 * Fetches fellowships by date
	 * @param groupId ID of the group
	 * @param date Date to fetch fellowships for
	 * @returns Array of fellowships
	 */
	async getFellowshipDates({
		groupId,
		year,
		month,
	}: {
		groupId: string;
		year: number;
		month: number;
	}): Promise<number[]> {
		const q = query(
			this.getFellowshipCollectionRef({ groupId }),
			orderBy('info.date', 'desc'),
			where('info.date', '>=', new Date(year, month - 1, 1)),
			where('info.date', '<', new Date(year, month, 1)),
		);

		const querySnapshot = await getDocs(q);

		const fellowships: Set<number> = new Set<number>();
		for (const fellowshipsDoc of querySnapshot.docs) {
			const data = fellowshipsDoc.data() as ServerFellowshipV2;
			fellowships.add(data.info.date.toDate().getDate());
		}
		return Array.from(fellowships);
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
	}): Promise<ClientFellowshipV2 | null> {
		const docRef = this.getFellowshipDocRef({ groupId, fellowshipId });
		const docSnap = await getDoc(docRef);

		if (docSnap.exists) {
			const data = docSnap.data() as ServerFellowshipV2;
			const members: ClientFellowshipParticipantV2[] = [];
			const memberPromises = data.info.participants.map((member) =>
				this.getParticipantWithCache(groupId, member.id, {
					displayName: member.displayName,
				}),
			);

			// 병렬로 멤버 정보 조회
			const memberResults = await Promise.all(memberPromises);
			members.push(...memberResults);

			return this.convertToClientFellowship(data, members);
		}

		return null;
	}

	/**
	 * Sets up a real-time listener for a specific fellowship document
	 * @param groupId ID of the group
	 * @param fellowshipId ID of the fellowship to listen to
	 * @param onNext Callback function when data changes
	 * @param onError Callback function when an error occurs
	 * @returns Unsubscribe function to stop listening
	 */
	/**
	 * 그룹 멤버 정보를 가져오거나 캐시에서 조회
	 * @param groupId 그룹 ID
	 * @param memberId 멤버 ID
	 * @param memberInfo 멤버 기본 정보
	 * @returns 멤버 정보
	 */
	private async getParticipantWithCache(
		groupId: string,
		memberId: string,
		additionalInfo?: Pick<ClientFellowshipParticipantV2, 'displayName'>,
	): Promise<ClientFellowshipParticipantV2> {
		// 그룹 캐시가 없으면 초기화
		if (!this.memberCache.has(groupId)) {
			this.memberCache.set(groupId, new Map());
		}

		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const groupCache = this.memberCache.get(groupId)!;

		// 캐시에 멤버 정보가 있으면 반환
		if (groupCache.has(memberId)) {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			const cachedMember = groupCache.get(memberId)!;
			// TODO: 리더 상태와 게스트 상태는 최신 정보로 업데이트
			return {
				...cachedMember,
			};
		}

		// 캐시에 없으면 DB에서 조회
		const groupMemberDoc = await getDoc(
			doc(
				database,
				this.collectionPath,
				groupId,
				this.memberCollectionPath,
				memberId,
			),
		);

		let memberData: ClientFellowshipParticipantV2;

		// 탈퇴유저 또는 게스트유저인 경우
		if (!groupMemberDoc.exists) {
			memberData = {
				id: memberId,
				displayName: additionalInfo?.displayName ?? DELETED_MEMBER_DISPLAY_NAME,
				isGuest: true,
			};
		} else {
			const clientMember = groupMemberDoc.data() as ClientGroupMember;
			memberData = {
				...clientMember,
				photoUrl: clientMember.photoUrl || undefined,
				displayName: clientMember.displayName || undefined,
				isGuest: false,
			};
		}

		// 캐시에 저장
		groupCache.set(memberId, memberData);
		return memberData;
	}

	/**
	 * 캐시 무효화 - 그룹 또는 특정 멤버의 캐시 삭제
	 * @param groupId 그룹 ID
	 * @param memberId 멤버 ID (선택적)
	 */
	private invalidateCache(groupId: string, memberId?: string): void {
		if (memberId && this.memberCache.has(groupId)) {
			// 특정 멤버 캐시만 삭제
			this.memberCache.get(groupId)?.delete(memberId);
		} else {
			// 그룹 전체 캐시 삭제
			this.memberCache.delete(groupId);
		}
	}

	onFellowshipSnapshot(
		{ groupId, fellowshipId }: { groupId: string; fellowshipId: string },
		onNext: (fellowship: ClientFellowshipV2 | null) => void,
		onError: (error: Error) => void,
	): () => void {
		const docRef = this.getFellowshipDocRef({ groupId, fellowshipId });

		return onSnapshot(
			docRef,
			async (docSnap) => {
				try {
					if (docSnap.exists) {
						const data = docSnap.data() as ServerFellowshipV2;
						const members: ClientFellowshipParticipantV2[] = [];

						// 멤버 정보 가져오기 (캐시 활용)
						const memberPromises = data.info.participants.map((member) =>
							this.getParticipantWithCache(groupId, member.id, {
								displayName: member.displayName,
							}),
						);

						// 병렬로 멤버 정보 조회
						const memberResults = await Promise.all(memberPromises);
						members.push(...memberResults);

						const fellowship = this.convertToClientFellowship(data, members);
						onNext(fellowship);
					} else {
						onNext(null);
					}
				} catch (error) {
					console.error('Error in onFellowshipSnapshot:', error);
					onError(error as Error);
				}
			},
			(error) => {
				console.error('Firestore snapshot error:', error);
				onError(error);
			},
		);
	}

	/**
	 * Creates a new fellowship for a group
	 * @param fellowshipData Fellowship data to be saved
	 * @returns ID of the created fellowship
	 */
	async createFellowship(
		fellowshipData: CreateFellowshipInputV2,
	): Promise<string> {
		const fellowshipId = uuidv4();
		const docRef = this.getFellowshipDocRef({
			groupId: fellowshipData.identifiers.groupId,
			fellowshipId,
		});

		const processedData = {
			...fellowshipData,
			identifiers: {
				...fellowshipData.identifiers,
				id: fellowshipId,
			},
			info: {
				...fellowshipData.info,
				date: Timestamp.fromDate(fellowshipData.info.date),
			},
			metadata: {
				schemaVersion: '2',
				createdAt: serverTimestamp() as Timestamp,
				updatedAt: serverTimestamp() as Timestamp,
			},
		} satisfies ServerFellowshipV2;

		await setDoc(docRef, processedData);
		return fellowshipId;
	}

	/**
	 * Updates an existing fellowship
	 * @param fellowshipId ID of the fellowship to update
	 * @param fellowshipData Updated fellowship data
	 */
	async updateFellowship(
		{ groupId, fellowshipId }: { groupId: string; fellowshipId: string },
		fellowshipData: UpdateFellowshipInputV2,
	): Promise<void> {
		const docRef = this.getFellowshipDocRef({ groupId, fellowshipId });

		const flattenedData = flattenObject(fellowshipData);

		// updatedAt 필드 추가
		flattenedData.updatedAt = serverTimestamp();

		// 멤버 정보가 변경되었다면 캐시 무효화
		if (fellowshipData.info?.participants) {
			this.invalidateCache(groupId);
		}

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

		console.log(updateData);
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
}

export const getFellowshipService = (): FirestoreFellowshipService => {
	return FirestoreFellowshipService.getInstance();
};
