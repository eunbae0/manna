export type FeedTypeCollectionName = 'fellowship' | 'posts' | 'prayer-requests';

export interface Feed {
	identifier: {
		id: string;
		groupId: string;
	};
	metadata: {
		type: FeedTypeCollectionName;
		timestamp: number;
		createdAt?: FirebaseFirestore.Timestamp;
	};
	data: {
		[key: string]: any;
	};
	members: Member[];
}

export interface RequestData {
	lastVisible?: number | null;
	limit?: number;
}

export interface ResponseData {
	feeds: Feed[];
	lastVisible: number | null;
	hasMore: boolean;
}

export interface GroupDoc {
	groupId: string;
}

export interface Member {
	displayName: string;
	id: string;
	photoURL?: string;
	role: string;
	statusMessage?: string;
}
