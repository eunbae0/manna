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
import { ALL_PRAYER_REQUESTS_QUERY_KEY, usePrayerRequestToggleLike } from '../hooks/usePrayerRequests';
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

	const { heartScale, heartTranslateY, performLikeAnimation } = useLikeAnimation(hasLiked);

	const { toggleLike } = usePrayerRequestToggleLike({
		userId: user?.id || '',
		prayerRequestId: prayerRequest.id,
		groupId: currentGroup?.groupId || '',
		performLikeAnimation,
	})

	const doubleTap = Gesture.Tap()
		.maxDuration(250)
		.numberOfTaps(2)
		.onEnd(() => {
			runOnJS(toggleLike)('Double_Tab');
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
				<HStack space="md" className="py-5 pl-4">
					<Avatar
						size="md"
						className="mt-1"
						photoUrl={
							prayerRequest.isAnonymous
								? ''
								: prayerRequest.member?.photoUrl || ''
						}
					/>
					<VStack className="flex-1">
						<HStack className="items-center justify-between mr-1">
							<HStack space="sm" className="items-center">
								<Text size="lg" className="font-pretendard-bold">
									{prayerRequest.isAnonymous
										? '익명'
										: prayerRequest.member.displayName || '이름없음'}
								</Text>
								<Text className="text-typography-500" size="sm">
									{formatRelativeTime(prayerRequest.createdAt)}
								</Text>
							</HStack>
							{isOwner && (
								<Button onPress={handlePressMoreButton} variant="icon">
									<ButtonIcon as={MoreHorizontal} />
								</Button>
							)}
						</HStack>
						<Text size="lg" className="pr-12">
							{prayerRequest.value}
						</Text>
						<Pressable
							onPress={() => toggleLike('Click')}
							className="ml-auto mr-4"
						>
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
											hasLiked
												? 'text-primary-500'
												: 'color-black'
										}
									/>
								</Animated.View>
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
