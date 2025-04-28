/**
 * 반응 관련 타입 정의
 */
import type { ReactionType } from './base';

// 반응 메타데이터 타입
export type PostReactionMetadata = {
	postId: string;
	groupId: string;
	targetType: 'post';
};

export type CommentReactionMetadata = {
	postId: string;
	groupId: string;
	targetType: 'comment';
	commentId: string;
};

export type ReactionMetadata = PostReactionMetadata | CommentReactionMetadata;

// 반응 관련 요청 타입
export interface AddReactionRequest {
	targetId: string; // 반응 대상 ID (게시글 또는 댓글)
	targetType: 'post' | 'comment'; // 반응 대상 타입
	type: ReactionType; // 반응 타입
}

export interface RemoveReactionRequest {
	targetId: string; // 반응 대상 ID (게시글 또는 댓글)
	targetType: 'post' | 'comment'; // 반응 대상 타입
	type?: ReactionType; // 특정 타입만 제거하려면 지정, 없으면 모든 반응 제거
}
