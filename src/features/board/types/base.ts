/**
 * 기본 타입 정의
 * 여러 타입에서 공통으로 사용되는 기본 타입들
 */

// 엔티티 기본 필드
// 모든 엔티티에 공통으로 사용되는 기본 필드
export interface BaseEntity {
	id: string;
	createdAt: Date;
	updatedAt?: Date;
}

// 사용자 역할 엔티티
// 그룹 멤버 역할 정의
export enum UserRole {
	LEADER = 'leader',
	MEMBER = 'member',
	GUEST = 'guest',
}

// 게시글 카테고리 엔티티
export enum PostCategory {
	NOTICE = 'NOTICE',
	FREE = 'FREE',
	// EVENT = 'EVENT',
}

// 작성자 정보
// 게시글과 댓글에서 공통으로 사용되는 작성자 정보
export interface Author {
	id: string;
	displayName: string;
	photoUrl?: string;
	role?: UserRole;
}

export interface FirestoreAuthor {
	id: string; // 사용자 ID만 저장
}

// 첨부파일 엔티티
// Firestore 콜렉션 구조: attachments/{attachmentId} 또는 posts/{postId}/attachments/{attachmentId}
export interface Attachment extends BaseEntity {
	filename: string;
	fileSize: number;
	fileType: string;
	url: string; // Firebase Storage URL
	thumbnailUrl?: string;
	postId?: string; // 어떤 게시글의 첨부파일인지 (별도 콜렉션 사용 시 필요)
	storageRef?: string; // Firebase Storage 참조 경로
}

// 반응 타입 정의
// 다양한 이모티콘 반응 지원
export enum ReactionType {
	LIKE = 'like',
	LOVE = 'love',
	LAUGH = 'laugh',
	SAD = 'sad',
	ANGRY = 'angry',
	WOW = 'wow',
	SUPPORT = 'support',
}

// 반응 엔티티
// 게시글이나 댓글에 대한 반응 정보
// Firestore 콜렉션 구조: reactions/{reactionId}
export interface Reaction extends BaseEntity {
	targetId: string; // 반응 대상 ID (게시글 또는 댓글)
	targetType: 'post' | 'comment'; // 반응 대상 타입
	type: ReactionType; // 반응 타입
	userId: string; // 반응한 사용자 ID
}

// 반응 집계 정보
// UI에 표시하기 위한 반응 집계 정보
export interface ReactionSummary {
	type: ReactionType;
	count: number;
	userIds: string[]; // 반응한 사용자 ID 목록 (Firestore 배열 제한 주의)
}

// API 요청/응답 공통 타입
// 페이지네이션 지원
export interface PaginationParams {
	page?: number;
	limit: number;
	sort?: string;
	order?: 'asc' | 'desc';
	startAfter?: string; // 커서 기반 페이지네이션을 위한 시작점
	endBefore?: string; // 커서 기반 페이지네이션을 위한 종료점
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
}
