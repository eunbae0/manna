import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { togglePrayerRequestReaction } from '@/api/prayer-request';
import type { ClientPrayerRequest, Member } from '@/api/prayer-request/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MoreHorizontal, Pen, Trash } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text } from '#/components/ui/text';
import { Icon } from '#/components/ui/icon';
import type { YYYYMMDD } from '@/shared/types/date';
import { useAuthStore } from '@/store/auth';
import { Avatar } from '@/components/common/avatar';

import { Divider } from '#/components/ui/divider';
import {
	BottomSheetListLayout,
	BottomSheetListItem,
} from '@/components/common/bottom-sheet';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable } from 'react-native';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { usePrayerRequestMutations } from '@/features/home/hooks/usePrayerRequestMutations';

type Props = {
	prayerRequest: ClientPrayerRequest;
	member: Member;
	selectedDate: YYYYMMDD;
};

const PrayerRequestCard = ({ prayerRequest, member, selectedDate }: Props) => {
	const { currentGroup } = useAuthStore();
	const queryClient = useQueryClient();
	const hasLiked = prayerRequest.reactions.some(
		(reaction) => reaction.type === 'LIKE' && reaction.member.id === member.id,
	);

	const { mutate: toggleLike } = useMutation({
		mutationFn: async () => {
			return togglePrayerRequestReaction(
				currentGroup?.groupId || '',
				prayerRequest.id,
				{
					type: 'LIKE',
					member,
				},
			);
		},
		onSuccess: () => {
			Promise.all([
				queryClient.invalidateQueries({
					queryKey: [
						'prayer-requests',
						currentGroup?.groupId || '',
						selectedDate,
					],
				}),
				queryClient.invalidateQueries({
					queryKey: ['all-prayer-requests', currentGroup?.groupId || ''],
				}),
			]);
		},
	});

	// Create a double tap gesture
	const doubleTap = Gesture.Tap()
		.maxDuration(250)
		.numberOfTaps(2)
		.onEnd(() => {
			// TODO: Fix crash when executed
			// toggleLike();
		});

	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();

	const handlePressMoreButton = () => {
		handleOpen();
	};

	const { deletePrayerRequest } = usePrayerRequestMutations();

	const handlePressEdit = () => {
		handleClose();
		router.navigate({
			pathname: '/(app)/createPrayerRequestModal',
			params: {
				id: prayerRequest.id,
				date: selectedDate,
				value: prayerRequest.value,
			},
		});
	};

	const handlePressDelete = () => {
		handleClose();
		// Show confirmation dialog before deleting
		Alert.alert('기도 제목 삭제', '이 기도 제목을 삭제하시겠습니까?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				style: 'destructive',
				onPress: () => {
					deletePrayerRequest(prayerRequest.id, {
						onSuccess: () => {
							// Toast or notification could be shown here
							console.log('Prayer request deleted successfully');
							Promise.all([
								queryClient.invalidateQueries({
									queryKey: [
										'prayer-requests',
										currentGroup?.groupId || '',
										selectedDate,
									],
								}),
								queryClient.invalidateQueries({
									queryKey: [
										'all-prayer-requests',
										currentGroup?.groupId || '',
									],
								}),
							]);
						},
						onError: (error: Error) => {
							console.error('Failed to delete prayer request:', error);
							// Show error toast or notification
						},
					});
				},
			},
		]);
	};

	return (
		<>
			<GestureDetector gesture={doubleTap}>
				<HStack space="md" className="py-5">
					<Avatar size="md" className="mt-1" />
					<VStack space="xs" className="flex-1">
						<HStack className="items-center justify-between">
							<HStack space="sm" className="items-center">
								<Text size="lg" className="font-pretendard-bold">
									{prayerRequest.member.displayName || '익명'}
								</Text>
								<Text className="text-typography-500" size="sm">
									{formatRelativeTime(prayerRequest.date)}
								</Text>
							</HStack>
							<Pressable onPress={handlePressMoreButton}>
								<Icon size="lg" as={MoreHorizontal} />
							</Pressable>
						</HStack>
						<Text size="lg" className="">
							{prayerRequest.value}
						</Text>
						<Pressable onPress={() => toggleLike()} className="ml-auto">
							<HStack space="xs" className="items-center">
								<Icon
									size="lg"
									as={Heart}
									className={
										hasLiked
											? 'stroke-primary-500 fill-primary-500'
											: 'color-black'
									}
								/>
								<Text size="md" className={hasLiked ? 'text-primary-500' : ''}>
									{prayerRequest.reactions.length}
								</Text>
							</HStack>
						</Pressable>
					</VStack>
				</HStack>
			</GestureDetector>
			<BottomSheetContainer>
				<BottomSheetListLayout>
					<BottomSheetListItem
						label="수정하기"
						icon={Pen}
						onPress={handlePressEdit}
					/>
					<Divider />
					<BottomSheetListItem
						label="삭제하기"
						icon={Trash}
						onPress={handlePressDelete}
					/>
				</BottomSheetListLayout>
			</BottomSheetContainer>
		</>
	);
};

export { PrayerRequestCard };

function formatRelativeTime(date: Date | string): string {
	const now = new Date();
	const postTime = new Date(date);
	const diffMinutes = Math.floor(
		(now.getTime() - postTime.getTime()) / (1000 * 60),
	);

	if (diffMinutes < 1) {
		return '방금 전';
	}

	if (diffMinutes < 60) {
		return `${diffMinutes}분 전`;
	}

	const diffHours = Math.floor(diffMinutes / 60);
	return `${diffHours}시간 전`;
}
