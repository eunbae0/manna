import type { ClientMetadata, ServerMetadata } from '@/shared/types/base';

export type ServerPraiseConti = {
	identifier: {
		id: string;
		authorId: string;
	};
	metadata: ServerMetadata;

	title: string;
	thumbnailUrl: string;

	tags: Record<string, Pick<PraiseContiTag, 'id' | 'name'>>;

	songs: Record<string, PraiseSong>;
};

export type ClientPraiseConti = {
	identifier: {
		id: string;
		authorId: string;
	};
	metadata: ClientMetadata;

	title: string;
	thumbnailUrl: string;

	tags: Array<Pick<PraiseContiTag, 'id' | 'name'>>;

	songs: Array<PraiseSong>;
};

export type PraiseSong = {
	id: string;
	name: string;
	imageUrl: string;
	order: number;
	chord?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
	bpm?: number;
	memo?: string;
	youtubeMusicData?: YTMusicSearchResult;
	createdAt: Date;
};

type YTMusicSearchResult = {
	album: string;
	artist: string;
	duration: 379;
	thumbnail: string;
	title: string;
	video_id: string;
	youtube_music_url: string;
	youtube_url: string;
};

export type PraiseContiTag = {
	id: string;
	name: string;
	metadata: ServerMetadata;
};
