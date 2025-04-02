import { handleApiError } from '@/api/errors';
import { withApiLogging } from '@/api/utils/logger';
import { FirestoreFellowshipService } from './service';
import type {
	Fellowship,
	ClientFellowship,
	UpdateFellowshipInput,
} from './types';

/**
 * Creates a fellowship service instance for a specific group
 * @param groupId ID of the group
 * @returns Fellowship service instance
 */
function createFellowshipService(groupId: string) {
	return new FirestoreFellowshipService(groupId);
}

/**
 * Fetches all fellowships for a specific group
 * @param groupId ID of the group
 * @returns Array of fellowship data
 */
export const fetchGroupFellowships = withApiLogging(
	async (groupId: string): Promise<Fellowship[]> => {
		try {
			const fellowshipService = createFellowshipService(groupId);
			const result = await fellowshipService.getGroupFellowships();

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				count: result.length,
				groupId,
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

/**
 * Fetches a specific fellowship by ID
 * @param groupId ID of the group
 * @param fellowshipId ID of the fellowship to fetch
 * @returns Fellowship data or null if not found
 */
export const fetchFellowshipById = withApiLogging(
	async (
		groupId: string,
		fellowshipId: string,
	): Promise<ClientFellowship | null> => {
		try {
			const fellowshipService = createFellowshipService(groupId);
			return await fellowshipService.getFellowshipById(fellowshipId);
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
		groupId: string,
		fellowshipData: Omit<
			ClientFellowship,
			'id' | 'groupId' | 'createdAt' | 'updatedAt'
		>,
	): Promise<string> => {
		try {
			const fellowshipService = createFellowshipService(groupId);
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
		groupId: string,
		fellowshipId: string,
		fellowshipData: UpdateFellowshipInput,
	): Promise<void> => {
		try {
			const fellowshipService = createFellowshipService(groupId);
			await fellowshipService.updateFellowship(fellowshipId, fellowshipData);
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
	async (groupId: string, fellowshipId: string): Promise<void> => {
		try {
			const fellowshipService = createFellowshipService(groupId);
			await fellowshipService.deleteFellowship(fellowshipId);
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
		groupId: string,
		startDate: Date,
		endDate: Date,
	): Promise<ClientFellowship[]> => {
		try {
			const fellowshipService = createFellowshipService(groupId);
			const result = await fellowshipService.getFellowshipsByDateRange(
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
