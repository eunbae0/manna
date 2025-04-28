import { useUpdateBoardPost } from '../hooks/useBoardPosts';
import { useToastStore } from '@/store/toast';

/**
 * 게시글 고정/해제 상태를 업데이트하는 함수
 * @param options 업데이트 옵션
 * @returns 성공 여부를 반환하는 Promise
 */
export function usePinPostUtils() {
	const updatePostMutation = useUpdateBoardPost();
	const { showSuccess, showError } = useToastStore();

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
