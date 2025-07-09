import type { PostCategory } from '../types';

export const getCategoryLabel = (category: PostCategory) => {
	switch (category) {
		case 'NOTICE':
			return '공지사항';
		case 'FREE':
			return '자유게시판';
		default:
			return '일반';
	}
};
