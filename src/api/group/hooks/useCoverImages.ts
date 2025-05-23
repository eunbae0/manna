import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getGroupService } from '../service';
import type { CoverImage, UpdateGroupInput } from '../types';
import { useToastStore } from '@/store/toast';
import { useAuthStore } from '@/store/auth';
import { updateGroup } from '..';

/**
 * Hook for managing group cover images
 */
export function useCoverImages() {
	const queryClient = useQueryClient();
	const { showToast } = useToastStore();
	const { currentGroup } = useAuthStore();

	const updateCoverImages = useMutation({
		mutationFn: async (coverImages: CoverImage[]) => {
			if (!currentGroup?.groupId) {
				throw new Error('그룹 ID가 없어요');
			}

			const groupData: UpdateGroupInput = {
				coverImages,
			};

			const groupService = getGroupService();
			return groupService.updateGroup(currentGroup.groupId, groupData);
		},
		onSuccess: () => {
			// Invalidate group queries to refresh data
			if (currentGroup?.groupId) {
				queryClient.invalidateQueries({
					queryKey: ['group', currentGroup.groupId],
				});
			}

			showToast({
				type: 'success',
				title: '성공',
				message: '커버 이미지가 업데이트되었어요.',
			});
		},
		onError: (error) => {
			console.error('Failed to update cover images:', error);
			showToast({
				type: 'error',
				title: '오류',
				message: '커버 이미지 업데이트에 실패했어요.',
			});
		},
	});

	const addCoverImage = useMutation({
		mutationFn: async (imageUri: string) => {
			if (!currentGroup?.groupId) {
				throw new Error('그룹 ID가 없어요');
			}

			// Get current group data
			const groupData: { coverImages?: CoverImage[] } =
				await queryClient.fetchQuery({
					queryKey: ['group', currentGroup.groupId],
				});

			if (!groupData) {
				throw new Error('그룹 데이터를 찾을 수 없어요');
			}

			// Get current images and determine next order value
			const currentImages = groupData.coverImages || [];
			const maxOrder =
				currentImages.length > 0
					? Math.max(...currentImages.map((img: CoverImage) => img.order))
					: -1;

			const newImage: CoverImage = {
				uri: imageUri,
				order: maxOrder + 1,
			};

			const updatedImages = [...currentImages, newImage];

			const updateData: UpdateGroupInput = {
				coverImages: updatedImages,
			};

			const groupService = getGroupService();
			return groupService.updateGroup(currentGroup.groupId, updateData);
		},
		onSuccess: () => {
			if (currentGroup?.groupId) {
				queryClient.invalidateQueries({
					queryKey: ['group', currentGroup.groupId],
				});
			}

			showToast({
				type: 'success',
				title: '성공',
				message: '새 이미지가 추가되었어요.',
			});
		},
		onError: (error) => {
			console.error('Failed to add cover image:', error);
			showToast({
				type: 'error',
				title: '오류',
				message: '이미지 추가에 실패했어요.',
			});
		},
	});

	const removeCoverImage = useMutation({
		mutationFn: async (imageUri: string) => {
			if (!currentGroup?.groupId) {
				throw new Error('그룹 ID가 없어요');
			}

			// Get current group data
			const groupData: { coverImages?: CoverImage[] } =
				await queryClient.fetchQuery({
					queryKey: ['group', currentGroup.groupId],
				});

			if (!groupData) {
				throw new Error('그룹 데이터를 찾을 수 없어요');
			}

			// Filter out the image to remove
			const filteredImages = (groupData.coverImages || []).filter(
				(img: CoverImage) => img.uri !== imageUri,
			);

			// Reorder the remaining images
			const reorderedImages = filteredImages.map(
				(img: CoverImage, index: number) => ({
					...img,
					order: index,
				}),
			);

			const updateData: UpdateGroupInput = {
				coverImages: reorderedImages,
			};

			const groupService = getGroupService();
			return groupService.updateGroup(currentGroup.groupId, updateData);
		},
		onSuccess: () => {
			if (currentGroup?.groupId) {
				queryClient.invalidateQueries({
					queryKey: ['group', currentGroup.groupId],
				});
			}

			showToast({
				type: 'success',
				title: '성공',
				message: '이미지가 삭제되었어요.',
			});
		},
		onError: (error) => {
			console.error('Failed to remove cover image:', error);
			showToast({
				type: 'error',
				title: '오류',
				message: '이미지 삭제에 실패했어요.',
			});
		},
	});

	const reorderCoverImages = useMutation({
		mutationFn: async (reorderedImages: CoverImage[]) => {
			if (!currentGroup?.groupId) {
				throw new Error('그룹 ID가 없어요');
			}

			// Apply new order values
			const updatedImages = reorderedImages.map((img, index) => ({
				...img,
				order: index,
			}));

			const updateData: UpdateGroupInput = {
				coverImages: updatedImages,
			};

			return updateGroup(currentGroup.groupId, updateData);
		},
		onSuccess: () => {
			if (currentGroup?.groupId) {
				queryClient.invalidateQueries({
					queryKey: ['group', currentGroup.groupId],
				});
			}

			showToast({
				type: 'success',
				title: '성공',
				message: '이미지 순서가 변경되었어요.',
			});
		},
		onError: (error) => {
			console.error('Failed to reorder cover images:', error);
			showToast({
				type: 'error',
				title: '오류',
				message: '이미지 순서 변경에 실패했어요.',
			});
		},
	});

	return {
		updateCoverImages,
		addCoverImage,
		removeCoverImage,
		reorderCoverImages,
	};
}
