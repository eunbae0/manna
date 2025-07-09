import type { FeedType } from '../api/types';

export function formatFeedType(type: FeedType) {
	switch (type) {
		case 'prayer-requests':
			return '기도 제목';
		case 'fellowship':
			return '모임';
		case 'posts':
			return '게시판';
		default:
			return '알 수 없음';
	}
}
