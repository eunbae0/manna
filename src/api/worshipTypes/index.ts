import type { WorshipType } from './types';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';
import { FirestoreWorshipTypesService } from './service';

const worshipTypesService = new FirestoreWorshipTypesService();

export const fetchUserWorshipTypes = withApiLogging(
	async (): Promise<WorshipType[]> => {
		try {
			await worshipTypesService.createDefaultWorshipType();
			const worshipTypes = await worshipTypesService.getUserWorshipTypes();

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				count: worshipTypes.length,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(worshipTypes, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'fetchUserWorshipTypes', 'notes');
		}
	},
	'fetchUserWorshipTypes',
	'notes',
);

/**
 * Creates a new worship type for the currently logged-in user
 * @param name Name of the worship type
 * @returns ID of the created worship type
 */
export const createUserWorshipType = withApiLogging(
	async (name: string): Promise<string> => {
		try {
			const worshipTypeId = await worshipTypesService.createWorshipType(name);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				worshipTypeId,
				name,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(worshipTypeId, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'createUserWorshipType', 'notes');
		}
	},
	'createUserWorshipType',
	'notes',
);
