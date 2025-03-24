import type {
	ClientWorshipType,
	CreateWorshipTypeInput,
	UpdateWorshipTypeInput,
} from './types';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';
import { FirestoreWorshipTypesService } from './service';

/**
 * Creates a worship types service instance
 * @returns Worship types service instance
 */
function createWorshipTypesService() {
	return new FirestoreWorshipTypesService();
}

/**
 * Fetches all worship types for the current user
 * @returns Array of worship type data
 */
export const fetchUserWorshipTypes = withApiLogging(
	async (): Promise<ClientWorshipType[]> => {
		try {
			const worshipTypesService = createWorshipTypesService();
			// Create default worship types if none exist
			await worshipTypesService.createDefaultWorshipTypes();
			const result = await worshipTypesService.getUserWorshipTypes();

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				count: result.length,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(result, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'fetchUserWorshipTypes', 'worship-types');
		}
	},
	'fetchUserWorshipTypes',
	'worship-types',
);

/**
 * Creates a new worship type for the current user
 * @param input Worship type input data
 * @returns ID of the created worship type
 */
export const createUserWorshipType = withApiLogging(
	async (input: CreateWorshipTypeInput): Promise<string> => {
		try {
			const worshipTypesService = createWorshipTypesService();
			const worshipTypeId = await worshipTypesService.createWorshipType(input);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				worshipTypeId,
				input,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(worshipTypeId, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'createUserWorshipType', 'worship-types');
		}
	},
	'createUserWorshipType',
	'worship-types',
);

/**
 * Updates an existing worship type
 * @param worshipTypeId ID of the worship type to update
 * @param input Updated worship type data
 * @returns true if successful, false if worship type not found
 */
export const updateUserWorshipType = withApiLogging(
	async (
		worshipTypeId: string,
		input: UpdateWorshipTypeInput,
	): Promise<boolean> => {
		try {
			const worshipTypesService = createWorshipTypesService();
			const result = await worshipTypesService.updateWorshipType(
				worshipTypeId,
				input,
			);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				worshipTypeId,
				input,
				success: result,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(result, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'updateUserWorshipType', 'worship-types');
		}
	},
	'updateUserWorshipType',
	'worship-types',
);

/**
 * Deletes a worship type
 * @param worshipTypeId ID of the worship type to delete
 * @returns true if successful, false if worship type not found
 */
export const deleteUserWorshipType = withApiLogging(
	async (worshipTypeId: string): Promise<boolean> => {
		try {
			const worshipTypesService = createWorshipTypesService();
			const result = await worshipTypesService.deleteWorshipType(worshipTypeId);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				worshipTypeId,
				success: result,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(result, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'deleteUserWorshipType', 'worship-types');
		}
	},
	'deleteUserWorshipType',
	'worship-types',
);
