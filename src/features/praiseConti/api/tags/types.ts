import type { PraiseContiTag } from '../../types';

export interface GetPraiseContiTagRequest {
	tagId: string;
}

export type GetAllPraiseContiTagsResponse = PraiseContiTag[];

export type CreatePraiseContiTagRequest = Omit<
	PraiseContiTag,
	'id' | 'metadata'
>;

export type UpdatePraiseContiTagRequest = PraiseContiTag;

export interface DeletePraiseContiTagRequest {
	tagId: string;
}
