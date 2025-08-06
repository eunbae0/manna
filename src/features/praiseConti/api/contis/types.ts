import type { ClientPraiseConti } from '@/features/praiseConti/types';

export type GetPraiseContiRequest = {
	groupId: string;
	praiseContiId: string;
};

export type GetPraiseContiListRequest = {
	groupId: string;
	lastVisible?: string | null;
	limit?: number;
};

export type GetPraiseContiListResponse = {
	data: ClientPraiseConti[];
	lastVisible: string | null;
	hasMore: boolean;
};

export type CreatePraiseContiRequest = Omit<
	ClientPraiseConti,
	'identifier' | 'metadata'
> & {
	authorId: string;
	groupId: string;
};

export type UpdatePraiseContiRequest = {
	groupId: string;
	praiseConti: ClientPraiseConti;
};

export type DeletePraiseContiRequest = {
	groupId: string;
	praiseContiId: string;
};
