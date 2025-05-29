import { handleApiError } from '@/api/errors';
import { withApiLogging } from '@/api/utils/logger';
import { getFellowshipService } from './service';
import type {
	ClientFellowshipV2,
	CompactClientFellowshipV2,
	CreateFellowshipInputV2,
	UpdateFellowshipInputV2,
} from './types';
import type { Timestamp } from '@react-native-firebase/firestore';

/**
 * Fetches fellowships for a specific group with pagination
 * @param groupId ID of the group
 * @param limit Number of items to fetch per page
 * @param startAfter Timestamp to start fetching after (for pagination)
 * @returns Paginated response with fellowship data
 */
export const fetchGroupFellowships = withApiLogging(
	async ({
		groupId,
		limitCount = 8,
		startAfter,
	}: {
		groupId: string;
		limitCount?: number;
		startAfter?: Timestamp; // Timestamp from Firestore
	}): Promise<{
		items: ClientFellowshipV2[];
		hasMore: boolean;
		total: number;
	}> => {
		try {
			const fellowshipService = getFellowshipService();
			const result = await fellowshipService.getGroupFellowships({
				groupId,
				limitCount,
				startAfter,
			});

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				count: result.items.length,
				groupId,
				hasMore: result.hasMore,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(result, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'fetchGroupFellowships', 'fellowship');
		}
	},
	'fetchGroupFellowships',
	'fellowship',
);
export const fetchRecentFellowshipsWhereUserIsLeader = withApiLogging(
	async ({
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
	}> => {
		try {
			const fellowshipService = getFellowshipService();
			const result =
				await fellowshipService.getRecentFellowshipsWhereUserIsLeader({
					groupId,
					userId,
					limitCount,
				});

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				count: result.items.length,
				groupId,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(result, { __logContext: context });
		} catch (error) {
			throw handleApiError(
				error,
				'fetchRecentFellowshipsWhereUserIsLeader',
				'fellowship',
			);
		}
	},
	'fetchRecentFellowshipsWhereUserIsLeader',
	'fellowship',
);

/**
 * 특정 사용자가 참여한 나눔을 가져옵니다
 * @param groupId 그룹 ID
 * @param userId 사용자 ID
 * @param limitCount 가져올 항목 수 (기본값: 8)
 * @param startAfter 페이지네이션을 위한 시작점
 * @returns 페이지네이션된 나눔 데이터
 */
export const fetchUserFellowships = withApiLogging(
	async ({
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
	}> => {
		try {
			if (!groupId || !userId) {
				return {
					items: [],
					hasMore: false,
					total: 0,
				};
			}

			const fellowshipService = getFellowshipService();
			return await fellowshipService.getUserFellowships({
				groupId,
				userId,
				limitCount,
				startAfter,
			});
		} catch (error) {
			throw handleApiError(error, 'fetchUserFellowships', 'fellowship');
		}
	},
	'fetchUserFellowships',
	'fellowship',
);

/**
 * Fetches a specific fellowship by ID
 * @param groupId ID of the group
 * @param fellowshipId ID of the fellowship to fetch
 * @returns Fellowship data or null if not found
 */
export const fetchFellowshipById = withApiLogging(
	async ({
		groupId,
		fellowshipId,
	}: {
		groupId: string;
		fellowshipId: string;
	}): Promise<ClientFellowshipV2 | null> => {
		try {
			const fellowshipService = getFellowshipService();
			return await fellowshipService.getFellowshipById({
				groupId,
				fellowshipId,
			});
		} catch (error) {
			throw handleApiError(error, 'fetchFellowshipById', 'fellowship');
		}
	},
	'fetchFellowshipById',
	'fellowship',
);

/**
 * Creates a new fellowship for a group
 * @param groupId ID of the group
 * @param fellowshipData Fellowship data to be saved
 * @returns ID of the created fellowship
 */
export const createFellowship = withApiLogging(
	async (fellowshipData: CreateFellowshipInputV2): Promise<string> => {
		try {
			const fellowshipService = getFellowshipService();
			return await fellowshipService.createFellowship(fellowshipData);
		} catch (error) {
			throw handleApiError(error, 'createFellowship', 'fellowship');
		}
	},
	'createFellowship',
	'fellowship',
);

/**
 * Updates an existing fellowship
 * @param groupId ID of the group
 * @param fellowshipId ID of the fellowship to update
 * @param fellowshipData Updated fellowship data
 */
export const updateFellowship = withApiLogging(
	async (
		{ groupId, fellowshipId }: { groupId: string; fellowshipId: string },
		fellowshipData: UpdateFellowshipInputV2,
	): Promise<void> => {
		try {
			const fellowshipService = getFellowshipService();
			await fellowshipService.updateFellowship(
				{
					groupId,
					fellowshipId,
				},
				fellowshipData,
			);
		} catch (error) {
			throw handleApiError(error, 'updateFellowship', 'fellowship');
		}
	},
	'updateFellowship',
	'fellowship',
);

/**
 * Deletes a fellowship
 * @param groupId ID of the group
 * @param fellowshipId ID of the fellowship to delete
 */
export const deleteFellowship = withApiLogging(
	async ({
		groupId,
		fellowshipId,
	}: { groupId: string; fellowshipId: string }): Promise<void> => {
		try {
			const fellowshipService = getFellowshipService();
			await fellowshipService.deleteFellowship({ groupId, fellowshipId });
		} catch (error) {
			throw handleApiError(error, 'deleteFellowship', 'fellowship');
		}
	},
	'deleteFellowship',
	'fellowship',
);
