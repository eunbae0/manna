import { handleApiError } from '@/api/errors';
import { withApiLogging } from '@/api/utils/logger';
import { getPraiseContiTagService } from './service';
import type {
	GetAllPraiseContiTagsResponse,
	CreatePraiseContiTagRequest,
	UpdatePraiseContiTagRequest,
	DeletePraiseContiTagRequest,
	GetPraiseContiTagRequest,
} from './types';
import type { PraiseContiTag } from '../../types';

export const getPraiseContiTag = withApiLogging(
	async (request: GetPraiseContiTagRequest): Promise<PraiseContiTag | null> => {
		try {
			const tagService = getPraiseContiTagService();
			return await tagService.getPraiseContiTag(request);
		} catch (error) {
			throw handleApiError(error, 'getPraiseContiTag', 'praiseContiTag');
		}
	},
	'getPraiseContiTag',
	'praiseContiTag',
);

export const getAllPraiseContiTags = withApiLogging(
	async (): Promise<GetAllPraiseContiTagsResponse> => {
		try {
			const tagService = getPraiseContiTagService();
			return await tagService.getAllPraiseContiTags();
		} catch (error) {
			throw handleApiError(error, 'getAllPraiseContiTags', 'praiseContiTag');
		}
	},
	'getAllPraiseContiTags',
	'praiseContiTag',
);

export const createPraiseContiTag = withApiLogging(
	async (request: CreatePraiseContiTagRequest): Promise<PraiseContiTag> => {
		try {
			const tagService = getPraiseContiTagService();
			return await tagService.createPraiseContiTag(request);
		} catch (error) {
			throw handleApiError(error, 'createPraiseContiTag', 'praiseContiTag');
		}
	},
	'createPraiseContiTag',
	'praiseContiTag',
);

export const updatePraiseContiTag = withApiLogging(
	async (request: UpdatePraiseContiTagRequest): Promise<void> => {
		try {
			const tagService = getPraiseContiTagService();
			await tagService.updatePraiseContiTag(request);
		} catch (error) {
			throw handleApiError(error, 'updatePraiseContiTag', 'praiseContiTag');
		}
	},
	'updatePraiseContiTag',
	'praiseContiTag',
);

export const deletePraiseContiTag = withApiLogging(
	async (request: DeletePraiseContiTagRequest): Promise<void> => {
		try {
			const tagService = getPraiseContiTagService();
			await tagService.deletePraiseContiTag(request);
		} catch (error) {
			throw handleApiError(error, 'deletePraiseContiTag', 'praiseContiTag');
		}
	},
	'deletePraiseContiTag',
	'praiseContiTag',
);
