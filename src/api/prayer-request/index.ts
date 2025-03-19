import type {
	ClientPrayerRequest,
	CreatePrayerRequestInput,
	Member,
	UpdatePrayerRequestInput,
} from './types';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';
import { FirestorePrayerRequestService } from './service';

/**
 * Creates a prayer request service instance for a specific group
 * @param groupId ID of the group
 * @returns Prayer request service instance
 */
function createPrayerRequestService(groupId: string) {
	return new FirestorePrayerRequestService(groupId);
}

/**
 * Fetches all prayer requests for a specific group
 * @param groupId ID of the group
 * @returns Array of prayer request data
 */
export const fetchGroupPrayerRequests = withApiLogging(
	async (groupId: string): Promise<ClientPrayerRequest[]> => {
		try {
			const prayerRequestService = createPrayerRequestService(groupId);
			const result = await prayerRequestService.getGroupPrayerRequests();

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				count: result.length,
				groupId,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(result, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'fetchGroupPrayerRequests', 'prayer-request');
		}
	},
	'fetchGroupPrayerRequests',
	'prayer-request',
);

/**
 * Fetches a specific prayer request by ID
 * @param groupId ID of the group
 * @param prayerRequestId ID of the prayer request to fetch
 * @returns Prayer request data or null if not found
 */
export const fetchPrayerRequestById = withApiLogging(
	async (
		groupId: string,
		prayerRequestId: string,
	): Promise<ClientPrayerRequest | null> => {
		try {
			const prayerRequestService = createPrayerRequestService(groupId);
			return await prayerRequestService.getPrayerRequestById(prayerRequestId);
		} catch (error) {
			throw handleApiError(error, 'fetchPrayerRequestById', 'prayer-request');
		}
	},
	'fetchPrayerRequestById',
	'prayer-request',
);

/**
 * Creates a new prayer request for a group
 * @param groupId ID of the group
 * @param prayerRequestData Prayer request data to be saved
 * @returns ID of the created prayer request
 */
export const createPrayerRequest = withApiLogging(
	async (
		groupId: string,
		prayerRequestData: CreatePrayerRequestInput,
	): Promise<string> => {
		try {
			const prayerRequestService = createPrayerRequestService(groupId);
			return await prayerRequestService.createPrayerRequest(prayerRequestData);
		} catch (error) {
			throw handleApiError(error, 'createPrayerRequest', 'prayer-request');
		}
	},
	'createPrayerRequest',
	'prayer-request',
);

/**
 * Updates an existing prayer request
 * @param groupId ID of the group
 * @param prayerRequestId ID of the prayer request to update
 * @param prayerRequestData Updated prayer request data
 */
export const updatePrayerRequest = withApiLogging(
	async (
		groupId: string,
		prayerRequestId: string,
		prayerRequestData: UpdatePrayerRequestInput,
	): Promise<void> => {
		try {
			const prayerRequestService = createPrayerRequestService(groupId);
			await prayerRequestService.updatePrayerRequest(
				prayerRequestId,
				prayerRequestData,
			);
		} catch (error) {
			throw handleApiError(error, 'updatePrayerRequest', 'prayer-request');
		}
	},
	'updatePrayerRequest',
	'prayer-request',
);

/**
 * Deletes a prayer request
 * @param groupId ID of the group
 * @param prayerRequestId ID of the prayer request to delete
 */
export const deletePrayerRequest = withApiLogging(
	async (groupId: string, prayerRequestId: string): Promise<void> => {
		try {
			const prayerRequestService = createPrayerRequestService(groupId);
			await prayerRequestService.deletePrayerRequest(prayerRequestId);
		} catch (error) {
			throw handleApiError(error, 'deletePrayerRequest', 'prayer-request');
		}
	},
	'deletePrayerRequest',
	'prayer-request',
);

/**
 * Fetches prayer requests by date range
 * @param groupId ID of the group
 * @param startDate Start date of the range
 * @param endDate End date of the range
 * @returns Array of prayer request data within the date range
 */
export const fetchPrayerRequestsByDateRange = withApiLogging(
	async (
		groupId: string,
		startDate: Date,
		endDate: Date,
	): Promise<ClientPrayerRequest[]> => {
		try {
			const prayerRequestService = createPrayerRequestService(groupId);
			const result = await prayerRequestService.getPrayerRequestsByDateRange(
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
			throw handleApiError(
				error,
				'fetchPrayerRequestsByDateRange',
				'prayer-request',
			);
		}
	},
	'fetchPrayerRequestsByDateRange',
	'prayer-request',
);

/**
 * Adds or removes a reaction to a prayer request
 * @param groupId ID of the group
 * @param prayerRequestId ID of the prayer request
 * @param reaction Reaction data
 */
export const togglePrayerRequestReaction = withApiLogging(
	async (
		groupId: string,
		prayerRequestId: string,
		reaction: {
			type: 'LIKE';
			member: Member;
		},
	): Promise<void> => {
		try {
			const prayerRequestService = createPrayerRequestService(groupId);
			await prayerRequestService.addReaction(prayerRequestId, reaction);
		} catch (error) {
			throw handleApiError(
				error,
				'togglePrayerRequestReaction',
				'prayer-request',
			);
		}
	},
	'togglePrayerRequestReaction',
	'prayer-request',
);
