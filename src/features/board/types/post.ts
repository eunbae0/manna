/**
 * 게시글 관련 타입 정의
 */
import type {
	Attachment,
	Author,
	BaseEntity,
	PostCategory,
	ReactionSummary,
	ReactionType,
} from './base';
import type {
	ContentElementType,
	ContentElementUnion,
} from './content-elements';

// 게시글 엔티티
// Firestore 콜렉션 구조: posts/{postId}
export interface BoardPost extends BaseEntity {
	groupId: string;
	title: string;
	content?: string; // 단순 텍스트 내용 (후반호환성을 위해 유지)
	category: PostCategory;
	viewCount: number;
	commentCount: number; // 댓글 수 카운터 (성능을 위해 사전 집계)
	isPinned?: boolean;
	isDeleted?: boolean; // 삭제된 글 표시 (소프트 삭제 지원)
	attachments?: Attachment[]; // 첨부파일 지원 (Firestore에서는 중첩 문서로 저장)
	tags?: string[]; // 태그 지원 (Firestore에서 배열 필드로 저장)
	author: Author; // 작성자 정보 (Firestore에서 중첩 문서로 저장)
	reactionSummary?: { [key in ReactionType]?: number }; // 게시글 반응 집계 (Firestore에 최적화된 형태)
	reactions?: ReactionSummary[]; // 게시글에 대한 반응 집계 정보 (UI 표시용)

	// 리치 콘텐츠 요소들 - 텍스트, 이미지, 비디오, 투표, 일정 등
	elements?: {
		[key in ContentElementType]?: ContentElementUnion[];
	};
}

// 게시글 생성/수정 요청 타입
export interface CreateBoardPostRequest {
	title: string;
	content?: string; // 단순 텍스트 내용 (후반호환성을 위해 유지)
	category: PostCategory;
	isPinned?: boolean;
	attachments?: string[]; // 첨부파일 ID 목록
	tags?: string[];

	// 리치 콘텐츠 요소들
	elements?: {
		[key in ContentElementType]?: ContentElementUnion[];
	};
}

export interface UpdateBoardPostRequest
	extends Partial<CreateBoardPostRequest> {
	id: string;
}
