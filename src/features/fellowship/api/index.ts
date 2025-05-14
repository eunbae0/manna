import { handleApiError } from '@/api/errors';
import { withApiLogging } from '@/api/utils/logger';
import { getFellowshipService } from './service';
import type {
	ClientFellowship,
	CreateFellowshipInput,
	UpdateFellowshipInput,
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
		limitCount = 10,
		startAfter,
	}: {
		groupId: string;
		limitCount?: number;
		startAfter?: Timestamp; // Timestamp from Firestore
	}): Promise<{
		items: ClientFellowship[];
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
		items: ClientFellowship[];
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
	}): Promise<ClientFellowship | null> => {
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
	async (
		{ groupId }: { groupId: string },
		fellowshipData: CreateFellowshipInput,
	): Promise<string> => {
		try {
			const fellowshipService = getFellowshipService();
			return await fellowshipService.createFellowship(
				{
					groupId,
				},
				fellowshipData,
			);
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
		fellowshipData: UpdateFellowshipInput,
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

/**
 * Fetches fellowships by date range
 * @param groupId ID of the group
 * @param startDate Start date of the range
 * @param endDate End date of the range
 * @returns Array of fellowship data within the date range
 */
export const fetchFellowshipsByDateRange = withApiLogging(
	async (
		{ groupId }: { groupId: string },
		startDate: Date,
		endDate: Date,
	): Promise<ClientFellowship[]> => {
		try {
			const fellowshipService = getFellowshipService();
			const result = await fellowshipService.getFellowshipsByDateRange(
				{
					groupId,
				},
				startDate,
				endDate,
			);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				count: result.length,
				groupId,
				dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(result, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'fetchFellowshipsByDateRange', 'fellowship');
		}
	},
	'fetchFellowshipsByDateRange',
	'fellowship',
);
