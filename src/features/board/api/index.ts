import type {
	BoardPost,
	Comment,
	CreateBoardPostRequest,
	CreateCommentRequest,
	PaginatedResponse,
	UpdateBoardPostRequest,
	UpdateCommentRequest,
	ReactionType,
	ReactionMetadata,
} from '../types';
import type {
	BoardPostQueryOptions,
	CreateBoardPostInput,
	CreateCommentInput,
	UpdateBoardPostInput,
	UpdateCommentInput,
} from './types';
import { handleApiError } from '@/api/errors';
import { withApiLogging } from '@/api/utils/logger';
import {
	type ClientReaction,
	type FirestoreReaction,
	getBoardService,
} from './service';

/**
 * 게시글 상세 조회
 * @param postId 게시글 ID
 * @returns 게시글 데이터 또는 없으면 null
 */
export const fetchBoardPostById = withApiLogging(
	async (metadata: {
		postId: string;
		groupId: string;
	}): Promise<BoardPost | null> => {
		try {
			const boardService = getBoardService();
			const post = await boardService.getBoardPostById(metadata);

			// 조회수 증가
			// TODO: 조회수 증가 로직 수정
			// if (post) {
			// 	await boardService.incrementViewCount(metadata);
			// }

			return post;
		} catch (error) {
			throw handleApiError(error, 'fetchBoardPostById', 'board');
		}
	},
	'fetchBoardPostById',
	'board',
);

/**
 * 그룹의 게시글 목록 조회
 * @param options 게시글 조회 옵션
 * @returns 페이지네이션된 게시글 목록
 */
export const fetchBoardPostsByGroupId = withApiLogging(
	async (
		options: BoardPostQueryOptions,
	): Promise<PaginatedResponse<BoardPost>> => {
		try {
			const boardService = getBoardService();
			const result = await boardService.getBoardPostsByGroupId(options);

			// 로깅을 위한 메타데이터
			const context = {
				count: result.items.length,
				groupId: options.groupId,
				category: options.category,
			};

			return Object.assign(result, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'fetchBoardPostsByGroupId', 'board');
		}
	},
	'fetchBoardPostsByGroupId',
	'board',
);

/**
 * 게시글 생성
 * @param postData 게시글 데이터
 * @returns 생성된 게시글
 */
export const createBoardPost = withApiLogging(
	async (postData: CreateBoardPostInput): Promise<BoardPost> => {
		try {
			const boardService = getBoardService();
			return await boardService.createBoardPost(postData);
		} catch (error) {
			throw handleApiError(error, 'createBoardPost', 'board');
		}
	},
	'createBoardPost',
	'board',
);

/**
 * 게시글 업데이트
 * @param postId 게시글 ID
 * @param postData 업데이트할 게시글 데이터
 */
export const updateBoardPost = withApiLogging(
	async (
		metadata: { postId: string; groupId: string },
		postData: UpdateBoardPostRequest,
	): Promise<void> => {
		try {
			const boardService = getBoardService();
			await boardService.updateBoardPost(metadata, postData);
		} catch (error) {
			throw handleApiError(error, 'updateBoardPost', 'board');
		}
	},
	'updateBoardPost',
	'board',
);

/**
 * 게시글 삭제 (소프트 삭제)
 * @param postId 삭제할 게시글 ID
 */
export const deleteBoardPost = withApiLogging(
	async (metadata: { postId: string; groupId: string }): Promise<void> => {
		try {
			const boardService = getBoardService();
			await boardService.deleteBoardPost(metadata);
		} catch (error) {
			throw handleApiError(error, 'deleteBoardPost', 'board');
		}
	},
	'deleteBoardPost',
	'board',
);

/**
 * 그룹 내 고정된 게시글이 있는지 확인
 * @param metadata 그룹 ID와 현재 게시글 ID
 * @returns 고정된 게시글 또는 null
 */
export const checkPinnedPost = withApiLogging(
	async (metadata: {
		groupId: string;
		currentPostId?: string;
	}): Promise<BoardPost | null> => {
		try {
			const { groupId, currentPostId } = metadata;

			// 현재 고정된 게시글 조회
			const result = await fetchBoardPostsByGroupId({
				groupId,
				isPinned: true,
				limit: 1,
			});

			// 현재 게시글이 아닌 다른 고정된 게시글이 있는지 확인
			if (currentPostId) {
				const pinnedPost = result.items.find(
					(item) => item.id !== currentPostId && item.isPinned,
				);
				return pinnedPost || null;
			}

			// 현재 게시글 ID가 없으면 첫 번째 고정 게시글 반환
			return result.items.length > 0 ? result.items[0] : null;
		} catch (error) {
			console.error('Error checking pinned post:', error);
			throw handleApiError(error, 'checkPinnedPost', 'board');
		}
	},
	'checkPinnedPost',
	'board',
);

/**
 * 게시글의 댓글 목록 조회
 * @param postId 게시글 ID
 * @returns 댓글 목록
 */
export const fetchCommentsByPostId = withApiLogging(
	async (metadata: { postId: string; groupId: string }): Promise<Comment[]> => {
		try {
			const boardService = getBoardService();
			const comments = await boardService.getCommentsByPostId(metadata);

			// 로깅을 위한 메타데이터
			const context = {
				count: comments.length,
				postId: metadata.postId,
			};

			return Object.assign(comments, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'fetchCommentsByPostId', 'board');
		}
	},
	'fetchCommentsByPostId',
	'board',
);

/**
 * 게시글 조회수 증가
 * @param postId 게시글 ID
 * @returns void
 */
export const incrementViewCount = withApiLogging(
	async (metadata: { postId: string; groupId: string }): Promise<void> => {
		try {
			const boardService = getBoardService();
			await boardService.incrementViewCount(metadata);
		} catch (error) {
			throw handleApiError(error, 'incrementViewCount', 'board');
		}
	},
	'incrementViewCount',
	'board',
);

/**
 * 게시글이나 댓글에 반응 추가
 * @param targetId 게시글 또는 댓글 ID
 * @param targetType 대상 타입 ('post' 또는 'comment')
 * @param userId 사용자 ID
 * @param reactionType 반응 타입
 * @returns void
 */
export const addReaction = withApiLogging(
	async (
		metadata: ReactionMetadata,
		userId: string,
		reactionType: ReactionType,
	): Promise<void> => {
		try {
			const boardService = getBoardService();
			await boardService.addReaction(metadata, userId, reactionType);
		} catch (error) {
			throw handleApiError(error, 'addReaction', 'board');
		}
	},
	'addReaction',
	'board',
);

/**
 * 게시글이나 댓글에서 반응 제거
 * @param targetId 게시글 또는 댓글 ID
 * @param targetType 대상 타입 ('post' 또는 'comment')
 * @param userId 사용자 ID
 * @param reactionType 반응 타입
 * @returns void
 */
export const removeReaction = withApiLogging(
	async (
		metadata: ReactionMetadata,
		userId: string,
		reactionType: ReactionType,
	): Promise<void> => {
		try {
			const boardService = getBoardService();
			await boardService.removeReaction(metadata, userId, reactionType);
		} catch (error) {
			throw handleApiError(error, 'removeReaction', 'board');
		}
	},
	'removeReaction',
	'board',
);

/**
 * 게시글이나 댓글의 반응 목록 가져오기
 * @param targetId 게시글 또는 댓글 ID
 * @param targetType 대상 타입 ('post' 또는 'comment')
 * @returns 반응 집계 정보
 */
export const getReactions = withApiLogging(
	async (
		metadata: ReactionMetadata,
	): Promise<{ [key in ReactionType]?: ClientReaction[] }> => {
		try {
			const boardService = getBoardService();
			const reactions = await boardService.getReactions(metadata);

			return reactions;
		} catch (error) {
			throw handleApiError(error, 'getReactions', 'board');
		}
	},
	'getReactions',
	'board',
);

/**
 * 댓글 생성
 * @param commentData 댓글 데이터
 * @returns 생성된 댓글
 */
export const createComment = withApiLogging(
	async (
		metadata: { groupId: string },
		commentData: CreateCommentInput,
	): Promise<Comment> => {
		try {
			const boardService = getBoardService();
			return await boardService.createComment(metadata, commentData);
		} catch (error) {
			throw handleApiError(error, 'createComment', 'board');
		}
	},
	'createComment',
	'board',
);

/**
 * 댓글 업데이트
 * @param commentId 댓글 ID
 * @param postId 게시글 ID
 * @param commentData 업데이트할 댓글 데이터
 */
export const updateComment = withApiLogging(
	async (
		metadata: { postId: string; groupId: string; commentId: string },
		commentData: UpdateCommentRequest,
	): Promise<void> => {
		try {
			const boardService = getBoardService();
			await boardService.updateComment(metadata, commentData);
		} catch (error) {
			throw handleApiError(error, 'updateComment', 'board');
		}
	},
	'updateComment',
	'board',
);

/**
 * 댓글 삭제 (소프트 삭제)
 * @param commentId 댓글 ID
 * @param postId 게시글 ID
 */
export const deleteComment = withApiLogging(
	async (metadata: {
		postId: string;
		groupId: string;
		commentId: string;
	}): Promise<void> => {
		try {
			const boardService = getBoardService();
			await boardService.deleteComment(metadata);
			return;
		} catch (error) {
			throw handleApiError(error, 'deleteComment', 'board');
		}
	},
	'deleteComment',
	'board',
);
