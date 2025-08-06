import { handleApiError } from '@/api/errors';
import { withApiLogging } from '@/api/utils/logger';
import { getPraiseContiService } from './service';
import type {
	CreatePraiseContiRequest,
	DeletePraiseContiRequest,
	GetPraiseContiListRequest,
	GetPraiseContiListResponse,
	UpdatePraiseContiRequest,
	GetPraiseContiRequest,
} from './types';
import type {
	ClientPraiseConti,
	ServerPraiseConti,
} from '@/features/praiseConti/types';

export const getPraiseConti = withApiLogging(
	async (props: GetPraiseContiRequest): Promise<ClientPraiseConti | null> => {
		try {
			const praiseContiService = getPraiseContiService();
			return await praiseContiService.getPraiseConti(props);
		} catch (error) {
			throw handleApiError(error, 'getPraiseConti', 'praiseConti');
		}
	},
	'getPraiseConti',
	'praiseConti',
);

export const getPraiseContiList = withApiLogging(
	async (
		props: GetPraiseContiListRequest,
	): Promise<GetPraiseContiListResponse> => {
		try {
			const praiseContiService = getPraiseContiService();
			return await praiseContiService.getPraiseContiList(props);
		} catch (error) {
			throw handleApiError(error, 'getPraiseContiList', 'praiseConti');
		}
	},
	'getPraiseContiList',
	'praiseConti',
);

export const createPraiseConti = withApiLogging(
	async (props: CreatePraiseContiRequest): Promise<void> => {
		try {
			const praiseContiService = getPraiseContiService();
			return await praiseContiService.createPraiseConti(props);
		} catch (error) {
			throw handleApiError(error, 'createPraiseConti', 'praiseConti');
		}
	},
	'createPraiseConti',
	'praiseConti',
);

export const updatePraiseConti = withApiLogging(
	async (props: UpdatePraiseContiRequest): Promise<void> => {
		try {
			const praiseContiService = getPraiseContiService();
			await praiseContiService.updatePraiseConti(props);
		} catch (error) {
			throw handleApiError(error, 'updatePraiseConti', 'praiseConti');
		}
	},
	'updatePraiseConti',
	'praiseConti',
);

export const deletePraiseConti = withApiLogging(
	async (props: DeletePraiseContiRequest): Promise<void> => {
		try {
			const praiseContiService = getPraiseContiService();
			await praiseContiService.deletePraiseConti(props);
		} catch (error) {
			throw handleApiError(error, 'deletePraiseConti', 'praiseConti');
		}
	},
	'deletePraiseConti',
	'praiseConti',
);
