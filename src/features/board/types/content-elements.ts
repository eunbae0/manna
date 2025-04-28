/**
 * 콘텐츠 요소 관련 타입 정의
 */
import { BaseEntity } from './base';

// 콘텐츠 요소 타입 - 게시글 내용에 포함되는 요소들
export enum ContentElementType {
	TEXT = 'text', // 일반 텍스트
	IMAGE = 'image', // 이미지
	VIDEO = 'video', // 비디오
	POLL = 'poll', // 투표
	SCHEDULE = 'schedule', // 일정
}

// 콘텐츠 요소 기본 타입
export interface ContentElement {
	id: string; // 요소 고유 ID
	type: ContentElementType; // 요소 타입
	position: number; // 요소 순서 (정렬을 위해 필요)
}

// 텍스트 요소
export interface TextElement extends ContentElement {
	type: ContentElementType.TEXT;
	content: string; // 텍스트 내용
}

// 이미지 요소
export interface ImageElement extends ContentElement {
	type: ContentElementType.IMAGE;
	url: string; // 이미지 URL
	caption?: string; // 이미지 설명
	width?: number; // 이미지 너비
	height?: number; // 이미지 높이
}

// 비디오 요소
export interface VideoElement extends ContentElement {
	type: ContentElementType.VIDEO;
	url: string; // 비디오 URL
	caption?: string; // 비디오 설명
	thumbnailUrl?: string; // 썸네일 URL
}

// 투표 요소
export interface PollElement extends ContentElement {
	type: ContentElementType.POLL;
	poll: {
		id: string;
		question: string;
		options: Array<{
			id: string;
			text: string;
			voteCount: number;
			voterIds?: string[];
		}>;
		multipleSelection: boolean;
		endDate?: string;
		totalVotes: number;
		isAnonymous: boolean;
		allowAddOptions?: boolean;
		createdAt: string;
		updatedAt?: string;
	};
}

// 일정 요소
export interface ScheduleElement extends ContentElement {
	type: ContentElementType.SCHEDULE;
	schedule: {
		id: string;
		title: string;
		startDate: string;
		endDate?: string;
		location?: string;
		description?: string;
		isAllDay: boolean;
		recurrence?: {
			frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
			interval: number;
			endDate?: string;
		};
		participants?: Array<{
			userId: string;
			displayName: string;
			photoUrl?: string;
			status: 'attending' | 'declined' | 'tentative' | 'invited';
		}>;
		notifications?: Array<{
			type: 'email' | 'push';
			time: number;
		}>;
		createdAt: string;
		updatedAt?: string;
	};
}

// 모든 콘텐츠 요소 타입 통합
export type ContentElementUnion =
	| TextElement
	| ImageElement
	| VideoElement
	| PollElement
	| ScheduleElement;

// 콘텐츠 요소 생성 요청 타입
export interface CreateTextElementRequest {
	content: string;
	position?: number;
}

export interface CreateImageElementRequest {
	url: string;
	caption?: string;
	width?: number;
	height?: number;
	position?: number;
}

export interface CreateVideoElementRequest {
	url: string;
	caption?: string;
	thumbnailUrl?: string;
	position?: number;
}

export interface CreatePollElementRequest {
	poll: {
		question: string;
		options: Array<{ text: string }>;
		multipleSelection?: boolean;
		endDate?: string;
		isAnonymous?: boolean;
		allowAddOptions?: boolean;
	};
	position?: number;
}

export interface CreateScheduleElementRequest {
	schedule: {
		title: string;
		startDate: string;
		endDate?: string;
		location?: string;
		description?: string;
		isAllDay?: boolean;
		recurrence?: {
			frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
			interval: number;
			endDate?: string;
		};
		notifications?: Array<{
			type: 'email' | 'push';
			time: number;
		}>;
	};
	position?: number;
}

// 콘텐츠 요소 생성 요청 통합 타입
export type CreateContentElementRequest =
	| ({ type: ContentElementType.TEXT } & CreateTextElementRequest)
	| ({ type: ContentElementType.IMAGE } & CreateImageElementRequest)
	| ({ type: ContentElementType.VIDEO } & CreateVideoElementRequest)
	| ({ type: ContentElementType.POLL } & CreatePollElementRequest)
	| ({ type: ContentElementType.SCHEDULE } & CreateScheduleElementRequest);

// 콘텐츠 요소 관련 요청 타입
export interface AddContentElementRequest {
	postId: string; // 게시글 ID
	element: CreateContentElementRequest; // 추가할 콘텐츠 요소
}

export interface UpdateContentElementRequest {
	postId: string; // 게시글 ID
	elementId: string; // 콘텐츠 요소 ID
	element: Partial<CreateContentElementRequest>; // 수정할 콘텐츠 요소 내용
}

export interface RemoveContentElementRequest {
	postId: string; // 게시글 ID
	elementId: string; // 콘텐츠 요소 ID
}

export interface ReorderContentElementsRequest {
	postId: string; // 게시글 ID
	elementIds: string[]; // 정렬된 콘텐츠 요소 ID 목록
}
