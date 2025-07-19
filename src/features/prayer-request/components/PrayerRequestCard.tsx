import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { togglePrayerRequestReaction } from '@/api/prayer-request';
import type {
	ClientGroupMember,
	ClientPrayerRequest,
} from '@/api/prayer-request/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MoreHorizontal, Pen, Trash } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text } from '@/shared/components/text';
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
import { usePrayerRequestMutations } from '@/features/group/hooks/usePrayerRequestMutations';
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
	runOnJS,
} from 'react-native-reanimated';

import * as Haptics from 'expo-haptics';
import { Button, ButtonIcon } from '@/components/common/button';
import { useToastStore } from '@/store/toast';
import { PRAYER_REQUESTS_QUERY_KEY } from '@/features/group/hooks/usePrayerRequestsByDate';
import {
	ALL_PRAYER_REQUESTS_QUERY_KEY,
	usePrayerRequestToggleLike,
} from '../hooks/usePrayerRequests';
import type { AmplitudeEventType } from '@/shared/constants/amplitude';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import { useLikeAnimation } from '@/shared/hooks/animation/useLikeAnimation';

type Props = {
	prayerRequest: ClientPrayerRequest;
};

const PrayerRequestCard = ({ prayerRequest }: Props) => {
	const { currentGroup, user } = useAuthStore();
	const queryClient = useQueryClient();
	const hasLiked = prayerRequest.reactions.some(
		(reaction) => reaction.type === 'LIKE' && reaction.member.id === user?.id,
	);

	const isOwner = prayerRequest.member.id === user?.id;

	const { showSuccess, showError } = useToastStore();

	const { heartScale, heartTranslateY, performLikeAnimation } =
		useLikeAnimation(hasLiked);

	const { toggleLike } = usePrayerRequestToggleLike({
		userId: user?.id || '',
		prayerRequestId: prayerRequest.id,
		groupId: currentGroup?.groupId || '',
		performLikeAnimation,
	});

	const doubleTap = Gesture.Tap()
		.maxDuration(250)
		.numberOfTaps(2)
		.onEnd(() => {
			runOnJS(toggleLike)();
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
				value: prayerRequest.value,
				isAnonymous: prayerRequest.isAnonymous ? 'true' : 'false',
			},
		});
	};

	const handlePressDelete = () => {
		handleClose();
		// Show confirmation dialog before deleting
		Alert.alert('기도 제목 삭제', '이 기도 제목을 삭제할까요?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				style: 'destructive',
				onPress: () => {
					deletePrayerRequest(prayerRequest.id, {
						onSuccess: () => {
							// Toast or notification could be shown here
							showSuccess('기도 제목이 삭제되었어요');
							Promise.all([
								queryClient.invalidateQueries({
									queryKey: [
										PRAYER_REQUESTS_QUERY_KEY,
										currentGroup?.groupId || '',
									],
								}),
								queryClient.invalidateQueries({
									queryKey: [
										ALL_PRAYER_REQUESTS_QUERY_KEY,
										currentGroup?.groupId || '',
									],
								}),
							]);
						},
						onError: (error: Error) => {
							showError('기도 제목을 삭제하는데 실패했어요.');
						},
					});
				},
			},
		]);
	};
	return (
		<>
			<GestureDetector gesture={doubleTap}>
				<VStack space="lg" className="py-5 pl-4 flex-1">
					<HStack space="md" className="">
						<Avatar
							size="md"
							className="mt-1"
							photoUrl={
								prayerRequest.isAnonymous
									? ''
									: prayerRequest.member?.photoUrl || ''
							}
						/>
						<HStack className="flex-1 justify-between items-start mr-1">
							<VStack className="gap-[2px]">
								<Text
									size="lg"
									weight="semi-bold"
									className="text-typography-800"
								>
									{prayerRequest.isAnonymous
										? '익명'
										: prayerRequest.member.displayName || '이름없음'}
								</Text>
								<Text size="md" className="text-typography-500">
									{formatRelativeTime(prayerRequest.createdAt)}
								</Text>
							</VStack>
							{isOwner && (
								<Button
									className="absolute -top-2 right-0"
									onPress={handlePressMoreButton}
									size="sm"
									variant="icon"
								>
									<ButtonIcon as={MoreHorizontal} />
								</Button>
							)}
						</HStack>
					</HStack>
					<Text size="xl" className="text-typography-900 pr-12">
						{prayerRequest.value}
					</Text>
					<Pressable onPress={() => toggleLike()} className="ml-auto mr-4">
						<HStack space="xs" className="items-center">
							<Animated.View
								style={useAnimatedStyle(() => ({
									transform: [
										{ scale: heartScale.value },
										{ translateY: heartTranslateY.value },
									],
								}))}
							>
								<Icon
									size="lg"
									as={Heart}
									fill={hasLiked ? '#362303' : undefined}
									className={
										hasLiked ? 'text-primary-500' : 'text-typography-500'
									}
								/>
							</Animated.View>
							<Text
								size="lg"
								weight="medium"
								className={
									hasLiked ? 'text-primary-500' : 'text-typography-500'
								}
							>
								{prayerRequest.reactions.length}
							</Text>
						</HStack>
					</Pressable>
				</VStack>
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
