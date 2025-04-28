import type { FieldValue } from '@react-native-firebase/firestore';
import type {
	BoardPost,
	Comment,
	ContentElementUnion,
	CreateBoardPostRequest,
	CreateCommentRequest,
	PaginationParams,
	UpdateBoardPostRequest,
	UpdateCommentRequest,
} from '../types';

/**
 * 서버 측 게시글 타입 (Firestore 특정 필드 포함)
 * Firestore 저장 및 검색에 사용
 */
export interface FirestoreBoardPost {
	id: string;
	title: string;
	content?: string;
	category: string;
	viewCount: number;
	commentCount: number;
	isPinned?: boolean;
	isDeleted?: boolean;
	tags?: string[];
	author: {
		id: string;
		displayName: string;
		photoUrl?: string;
		role?: string;
	};
	reactionSummary?: Record<string, number>;
	pollCount?: number;
	scheduleCount?: number;
	groupId: string;
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

/**
 * 서버 측 댓글 타입 (Firestore 특정 필드 포함)
 */
export interface FirestoreComment {
	id: string;
	postId: string;
	content: string;
	author: {
		id: string;
		displayName: string;
		photoUrl?: string;
		role?: string;
	};
	parentId?: string;
	depth?: number;
	isEdited?: boolean;
	isDeleted?: boolean;
	likeCount?: number;
	reactionSummary?: Record<string, number>;
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

/**
 * 서버 측 콘텐츠 요소 타입 (Firestore 특정 필드 포함)
 */
export interface FirestoreContentElement {
	id: string;
	type: string;
	position: number;
	[key: string]: any;
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

/**
 * 게시글 생성 입력 데이터
 */
export interface CreateBoardPostInput extends CreateBoardPostRequest {
	groupId: string;
	userId: string;
}

/**
 * 게시글 업데이트 입력 데이터
 */
export type UpdateBoardPostInput = UpdateBoardPostRequest;

/**
 * 댓글 생성 입력 데이터
 */
export interface CreateCommentInput extends CreateCommentRequest {
	postId: string;
	userId: string;
}

/**
 * 댓글 업데이트 입력 데이터
 */
export type UpdateCommentInput = UpdateCommentRequest;

/**
 * 게시글 쿼리 옵션
 */
export interface BoardPostQueryOptions extends PaginationParams {
	groupId: string;
	category?: string;
	authorId?: string;
	tags?: string[];
	isPinned?: boolean;
	searchText?: string;
}
