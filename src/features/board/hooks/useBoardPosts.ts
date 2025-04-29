import {
	useMutation,
	useQuery,
	useQueryClient,
	useInfiniteQuery,
} from '@tanstack/react-query';
import {
	createBoardPost,
	deleteBoardPost,
	fetchBoardPostById,
	fetchBoardPostsByGroupId,
	incrementViewCount,
	updateBoardPost,
} from '../api';
import type { BoardPostQueryOptions, CreateBoardPostInput } from '../api/types';
import type {
	BoardPost,
	PaginatedResponse,
	UpdateBoardPostRequest,
} from '../types';

// Query keys
export const boardKeys = {
	all: ['board'] as const,
	post: (groupId: string, postId: string) =>
		[...boardKeys.all, 'post', groupId, postId] as const,
	infinitePosts: (groupId: string) =>
		[...boardKeys.all, 'infinite_posts', groupId] as const,
	pinnedPost: (groupId?: string) =>
		[...boardKeys.all, 'pinned', groupId] as const,
};

/**
 * 게시글 상세 조회 훅
 * @param groupId 그룹 ID
 * @param postId 게시글 ID
 * @returns 게시글 데이터와 로딩 상태
 */
export function useBoardPost(groupId: string, postId: string) {
	return useQuery({
		queryKey: boardKeys.post(groupId, postId),
		queryFn: () => fetchBoardPostById({ groupId, postId }),
	});
}
/**
 * 게시글 생성 훅
 * @returns 게시글 생성 뮤테이션
 */
export function useCreateBoardPost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (postData: CreateBoardPostInput) => createBoardPost(postData),
		onSuccess: (newPost: BoardPost) => {
			// 무한 스크롤 게시글 목록 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: boardKeys.infinitePosts(newPost.groupId),
			});
		},
	});
}

/**
 * 게시글 업데이트 훅
 * @returns 게시글 업데이트 뮤테이션
 */
export function useUpdateBoardPost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			metadata,
			postData,
		}: {
			metadata: { postId: string; groupId: string };
			postData: UpdateBoardPostRequest;
		}) => updateBoardPost(metadata, postData),
		onSuccess: (_, { metadata }) => {
			// 해당 게시글 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: boardKeys.post(metadata.groupId, metadata.postId),
			});
			// 무한 스크롤 게시글 목록 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: boardKeys.infinitePosts(metadata.groupId),
			});
		},
	});
}

/**
 * 게시글 삭제 훅
 * @returns 게시글 삭제 뮤테이션
 */
export function useDeleteBoardPost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (metadata: { postId: string; groupId: string }) =>
			deleteBoardPost(metadata),
		onSuccess: (_, metadata) => {
			// 해당 게시글 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: boardKeys.post(metadata.groupId, metadata.postId),
			});
			// 무한 스크롤 게시글 목록 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: boardKeys.infinitePosts(metadata.groupId),
			});
		},
	});
}

/**
 * 게시글 조회수 증가 훅
 * @returns 조회수 증가 뮤테이션
 */
export function useIncrementViewCount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (metadata: { postId: string; groupId: string }) =>
			incrementViewCount(metadata),
		onSuccess: (_, metadata) => {
			// 해당 게시글 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: boardKeys.post(metadata.groupId, metadata.postId),
			});
			// 조회수 증가는 무효화로 처리
			queryClient.invalidateQueries({
				queryKey: boardKeys.infinitePosts(metadata.groupId),
			});
		},
	});
}

/**
 * 그룹의 게시글 목록을 무한 스크롤로 조회하는 훅
 * @param options 게시글 조회 옵션
 * @returns 무한 스크롤 게시글 목록과 로딩 상태
 */
export function useInfiniteBoardPosts(
	options: Omit<BoardPostQueryOptions, 'page' | 'startAfter' | 'endBefore'>,
) {
	const { groupId, category, limit = 10 } = options;

	return useInfiniteQuery<PaginatedResponse<BoardPost>>({
		queryKey: [...boardKeys.infinitePosts(groupId), { category }],
		queryFn: async ({ pageParam }) => {
			if (!groupId) {
				return {
					items: [],
					total: 0,
					hasMore: false,
					page: 1,
					limit: limit,
				};
			}

			return fetchBoardPostsByGroupId({
				...options,
				limit,
				startAfter: pageParam as string,
			});
		},
		initialPageParam: '',
		getNextPageParam: (lastPage) => {
			// 더 이상 데이터가 없으면 undefined 반환
			if (!lastPage.hasMore || lastPage.items.length === 0) {
				return undefined;
			}

			// 마지막 아이템의 createdAt을 다음 페이지 파라미터로 사용
			const lastItem = lastPage.items[lastPage.items.length - 1];
			return lastItem?.createdAt || undefined;
		},
		enabled: !!groupId,
	});
}

/**
 * 그룹 내 고정된 게시글을 가져오는 훅
 * @param groupId 그룹 ID
 * @returns 고정된 게시글 정보와 로딩 상태
 */
export function usePinnedPost(groupId?: string) {
	return useQuery({
		queryKey: boardKeys.pinnedPost(groupId),
		queryFn: async (): Promise<BoardPost | null> => {
			if (!groupId) return null;
			
			// 고정된 게시글 조회
			const result = await fetchBoardPostsByGroupId({
				groupId,
				isPinned: true,
				limit: 1,
			});
			
			// 고정된 게시글이 있으면 첫 번째 게시글 반환
			return result.items.length > 0 ? result.items[0] : null;
		},
		enabled: !!groupId,
	});
}
