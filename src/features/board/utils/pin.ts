import { useUpdateBoardPost } from '../hooks/useBoardPosts';
import { useToastStore } from '@/store/toast';
import { useQueryClient } from '@tanstack/react-query';
import { boardKeys } from '../hooks/useBoardPosts';

/**
 * 게시글 고정/해제 상태를 업데이트하는 함수
 * @param options 업데이트 옵션
 * @returns 성공 여부를 반환하는 Promise
 */
export function usePinPostUtils() {
	const updatePostMutation = useUpdateBoardPost();
	const { showSuccess, showError } = useToastStore();
	const queryClient = useQueryClient();

	/**
	 * 게시글 고정/해제 상태를 업데이트하는 함수
	 * @param postId 게시글 ID
	 * @param groupId 그룹 ID
	 * @param isPinned 고정 여부
	 * @param onSettled 완료 후 실행할 콜백 함수
	 * @returns 성공 여부를 반환하는 Promise
	 */
	const updatePostPinStatus = async (
		postId: string,
		groupId: string,
		isPinned: boolean,
		onSettled?: () => void,
		showToast = true,
	): Promise<boolean> => {
		try {
			await updatePostMutation.mutateAsync({
				metadata: { postId, groupId },
				postData: { id: postId, isPinned },
			});

			// 고정된 게시글 관련 쿼리 무효화
			// 1. 모든 그룹의 고정 게시글 쿼리 무효화
			queryClient.invalidateQueries({ queryKey: boardKeys.pinnedPost() });

			// 2. 현재 그룹의 고정 게시글 쿼리 무효화
			queryClient.invalidateQueries({
				queryKey: boardKeys.pinnedPost(groupId),
			});

			// 3. 게시글 목록 쿼리 무효화 (정렬 순서가 변경될 수 있으므로)
			queryClient.invalidateQueries({
				queryKey: boardKeys.infinitePosts(groupId),
			});

			if (showToast) {
				showSuccess(`게시글이 ${isPinned ? '고정' : '고정 해제'}되었어요`);
			}
			return true;
		} catch (error) {
			if (showToast) {
				showError(`게시글을 ${isPinned ? '고정' : '고정 해제'}하지 못했어요`);
			}
			return false;
		} finally {
			if (onSettled) {
				onSettled();
			}
		}
	};

	return { updatePostPinStatus };
}
