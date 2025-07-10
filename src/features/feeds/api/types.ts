import type { GroupMember } from '@/api/group/types';
import type { ServerPrayerRequest } from '@/api/prayer-request/types';
import type { BoardPost } from '@/features/board/types';
import type { ServerFellowshipV2 } from '@/features/fellowship/api/types';

export type FeedType = 'fellowship' | 'posts' | 'prayer-requests';

export type BaseFeed<T extends FeedType> = {
	identifier: {
		id: string;
		groupId: string;
	};
	metadata: {
		type: T;
		timestamp: number;
		createdAt?: FirebaseFirestore.Timestamp;
	};
	members: GroupMember[];
};

export interface PrayerRequestsFeed extends BaseFeed<'prayer-requests'> {
	data: ServerPrayerRequest;
}

export interface FellowshipFeed extends BaseFeed<'fellowship'> {
	data: ServerFellowshipV2;
}

export interface PostsFeed extends BaseFeed<'posts'> {
	data: BoardPost;
}

export type Feed = FellowshipFeed | PostsFeed | PrayerRequestsFeed;

export interface RequestData {
	lastVisible?: number | null;
	limit?: number;
	groupIds?: string[];
}

export interface ResponseData {
	feeds: Feed[];
	lastVisible: number | null;
	hasMore: boolean;
}
