/**
 * 댓글 관련 타입 정의
 */
import type { Author, BaseEntity, ReactionSummary, ReactionType } from './base';

// 댓글 엔티티
// Firestore 콜렉션 구조: posts/{postId}/comments/{commentId}
// 또는 별도 콜렉션: comments/{commentId}
export interface Comment extends BaseEntity {
	groupId: string;
	postId: string;
	content: string;
	author: Author;
	parentId?: string; // 대댓글인 경우 부모 댓글 ID
	depth?: number; // 댓글 깊이 (대댓글 표시를 위해)
	isEdited?: boolean; // 수정 여부
	isDeleted?: boolean; // 삭제 여부 (소프트 삭제 지원)
	likeCount?: number; // 좋아요 수 (성능을 위해 사전 집계)
	reactionSummary?: { [key in ReactionType]?: number }; // 댓글 반응 집계
	reactions?: ReactionSummary[]; // 댓글에 대한 반응 집계 정보 (UI 표시용)
}

// 댓글 생성/수정 요청 타입
export interface CreateCommentRequest {
	postId: string;
	content: string;
	parentId?: string; // 대댓글인 경우 부모 댓글 ID
}

export interface UpdateCommentRequest {
	id: string;
	content: string;
}
