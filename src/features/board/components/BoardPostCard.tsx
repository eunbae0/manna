import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Box } from '#/components/ui/box';
import { Text } from '@/shared/components/text';
import { Avatar } from '@/components/common/avatar';
import { Icon } from '#/components/ui/icon';
import {
	ThumbsUp,
	MessageCircle,
	Eye,
	Pen,
	Crown,
	MoreHorizontal,
	Trash,
	Pin,
	PinOff,
} from 'lucide-react-native';
import { Button, ButtonIcon } from '@/components/common/button';
import { cn } from '@/shared/utils/cn';
import AnimatedPressable from '@/components/common/animated-pressable';
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import {
	BottomSheetListLayout,
	BottomSheetListItem,
} from '@/components/common/bottom-sheet';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import {
	type ImageElement,
	UserRole,
	type BoardPost,
	type PostReactionMetadata,
	type ReactionType,
} from '@/features/board/types';
import { useReactions, useDeleteBoardPost, useReactionToggle } from '../hooks';
import { usePinPostUtils } from '../utils/pin';
import { checkPinnedPost } from '../api';
import { useCallback, useMemo } from 'react';
import { Image } from 'expo-image';
import { getImageSourceForSignedImageUrl } from '@/shared/utils/image';
import { ScrollView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

interface BoardPostCardProps {
	post: BoardPost;
}

/**
 * 게시판 글 카드 컴포넌트
 * 게시판 글 목록에서 각 게시글을 표시하는 카드 컴포넌트
 */
export function BoardPostCard({ post }: BoardPostCardProps) {
	const { currentGroup } = useAuthStore();
	const categoryLabel = post.category === 'NOTICE' ? '공지사항' : '자유게시판';
	const categoryColor =
		post.category === 'NOTICE' ? 'text-amber-600' : 'text-indigo-600';

	// 고정된 글 배경색 지정
	const isPinnedStyle = post.isPinned ? 'bg-gray-50' : '';

	const { user } = useAuthStore();
	const { showSuccess, showError } = useToastStore();

	const isOwner = post.author.id === user?.id;

	const { BottomSheetContainer, handleOpen, handleClose } = useBottomSheet();

	const handlePressPost = () => {
		router.push(`/(app)/(board)/${post.id}`);
	};

	const handlePressMoreButton = () => {
		handleOpen();
	};

	const deletePostMutation = useDeleteBoardPost();

	const handleDeletePost = () => {
		Alert.alert('게시글 삭제', '정말 이 게시글을 삭제할까요?', [
			{
				text: '취소',
				style: 'cancel',
			},
			{
				text: '삭제',
				style: 'destructive',
				onPress: () => {
					if (!currentGroup?.groupId || !post.id) return;

					deletePostMutation.mutate(
						{
							groupId: currentGroup.groupId,
							postId: post.id,
						},
						{
							onSuccess: () => {
								showSuccess('게시글이 삭제되었어요');
							},
							onError: () => {
								showError('게시글을 삭제하지 못했어요');
							},
							onSettled: () => {
								handleClose();
							},
						},
					);
				},
			},
		]);
	};

	const { updatePostPinStatus } = usePinPostUtils();

	// 게시글 고정/해제 처리
	const handleTogglePin = async () => {
		if (!post || !currentGroup?.groupId) return;

		// 고정 해제의 경우 바로 처리
		if (post.isPinned) {
			await updatePostPinStatus(
				post.id,
				currentGroup.groupId,
				false,
				handleClose,
			);
			return;
		}

		// 고정하려는 경우, 이미 고정된 게시글이 있는지 확인
		const existingPinnedPost = await checkPinnedPost({
			groupId: currentGroup.groupId,
			currentPostId: post.id,
		});

		if (!existingPinnedPost) {
			await updatePostPinStatus(
				post.id,
				currentGroup.groupId,
				true,
				handleClose,
			);
			return;
		}

		// 이미 고정된 게시글이 있는 경우 확인 알림 표시
		Alert.alert(
			'현재 고정된 게시글을 바꾸시겠어요?',
			'한 번에 하나의 게시글만 고정할 수 있습니다.',
			[
				{ text: '취소', style: 'cancel' },
				{
					text: '확인',
					onPress: async () => {
						const unpinSuccess = await updatePostPinStatus(
							existingPinnedPost.id,
							currentGroup.groupId,
							false,
							handleClose,
							false,
						);

						if (unpinSuccess) {
							await updatePostPinStatus(
								post.id,
								currentGroup.groupId,
								true,
								handleClose,
							);
						}
					},
				},
			],
		);
	};

	const reactionMetadata: PostReactionMetadata = useMemo(() => {
		return {
			targetType: 'post',
			groupId: currentGroup?.groupId || '',
			postId: post.id || '',
		};
	}, [currentGroup?.groupId, post.id]);

	const { data: reactions, isLoading: isReactionsLoading } =
		useReactions(reactionMetadata);

	const isLiked = reactions
		? Object.values(reactions).some((reactions) =>
				reactions.some(
					(reaction) =>
						reaction.userId === user?.id && reaction.type === 'like',
				),
			)
		: false;

	const reactionToggleMutation = useReactionToggle();

	const handleLike = useCallback(() => {
		if (!post || !user || !currentGroup?.groupId) return;

		// 좋아요 취소
		reactionToggleMutation.mutate(
			{
				metadata: reactionMetadata,
				userId: user.id,
				reactionType: 'like' as ReactionType,
				currentLikeState: isLiked,
			},
			{
				onError: () => {
					showError('좋아요를 취소하지 못했어요');
				},
				onSettled: () => {
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
				},
			},
		);
	}, [post, user, currentGroup?.groupId, reactionMetadata, isLiked]);

	return (
		<>
			<AnimatedPressable scale="sm" onPress={handlePressPost}>
				<HStack space="md" className={cn('py-5 pl-4', isPinnedStyle)}>
					<Avatar
						size="md"
						className="mt-1"
						photoUrl={post.author.photoUrl || ''}
					/>
					<VStack space="sm" className="flex-1">
						<VStack space="xs">
							<HStack className="items-center justify-between mr-1">
								<HStack space="sm" className="items-center">
									<HStack space="xs" className="items-center">
										<Text size="md" weight="semi-bold">
											{post.author.displayName || '이름없음'}
										</Text>
										{post.author.role === 'leader' && (
											<Icon as={Crown} size="sm" className="text-yellow-500" />
										)}
									</HStack>
									<HStack space="sm" className="items-center">
										<Box className="w-1 h-1 rounded-full bg-gray-300" />
										<Text className="text-typography-500" size="sm">
											{formatRelativeTime(post.createdAt)}
										</Text>
									</HStack>
									<Text
										className={cn(
											'text-xs font-pretendard-Medium',
											categoryColor,
										)}
									>
										{categoryLabel}
									</Text>
								</HStack>
								<HStack space="xs" className="items-center">
									{post.isPinned && (
										<HStack space="xs" className="items-center mr-12">
											<Text
												size="xs"
												weight="semi-bold"
												className="text-typography-600"
											>
												고정됨
											</Text>
											<Icon
												as={Pin}
												size="xs"
												className="text-typography-600"
											/>
										</HStack>
									)}
								</HStack>
							</HStack>
							<VStack space="sm" className="">
								<VStack space="xs">
									<Text size="xl" weight="medium" className="pr-12">
										{post.title}
									</Text>
									<Text
										numberOfLines={2}
										size="lg"
										className="pr-12 text-typography-600"
									>
										{post.content}
									</Text>
								</VStack>
								<ScrollView horizontal showsHorizontalScrollIndicator={false}>
									<HStack space="sm" className="">
										{post.elements?.image?.map((i) => {
											const image = i as ImageElement;
											return (
												<Image
													key={image.position}
													source={getImageSourceForSignedImageUrl(image.url)}
													style={{
														width: 160,
														height: 160,
														borderRadius: 8,
														borderWidth: 1,
														borderColor: '#ECECEC',
														marginVertical: 8,
													}}
													contentFit="cover"
												/>
											);
										})}
									</HStack>
								</ScrollView>
							</VStack>
						</VStack>
						<HStack className="items-center justify-between pr-4">
							<HStack space="lg" className="items-center">
								<AnimatedPressable onPress={handleLike}>
									<HStack space="xs" className="items-center">
										<Icon
											as={ThumbsUp}
											size="xl"
											fill={isLiked ? '#362303' : undefined}
											className={
												isLiked ? 'text-primary-500' : 'text-typography-500'
											}
										/>
										<Text
											size="lg"
											weight="medium"
											className={
												isLiked ? 'text-primary-500' : 'text-typography-500'
											}
										>
											{post.reactionSummary?.like || 0}
										</Text>
									</HStack>
								</AnimatedPressable>
								<HStack space="xs" className="items-center">
									<Icon
										size="xl"
										as={MessageCircle}
										className="text-typography-500"
									/>
									<Text
										size="lg"
										weight="medium"
										className="text-typography-500"
									>
										{post.commentCount}
									</Text>
								</HStack>
							</HStack>
							<HStack space="xs" className="items-center">
								<Icon size="sm" as={Eye} className="text-gray-500" />
								<Text size="sm" className="text-gray-500">
									{post.viewCount}
								</Text>
							</HStack>
						</HStack>
					</VStack>
					{isOwner && (
						<Box className="absolute top-2 right-1">
							<Button onPress={handlePressMoreButton} variant="icon">
								<ButtonIcon as={MoreHorizontal} />
							</Button>
						</Box>
					)}
				</HStack>
			</AnimatedPressable>
			<BottomSheetContainer>
				<BottomSheetListLayout className="gap-4">
					<BottomSheetListItem
						label="수정하기"
						icon={Pen}
						onPress={() => {
							handleClose();
							router.push({
								pathname: '/(app)/(board)/create',
								params: { id: post.id, isEdit: 'true' },
							});
						}}
					/>
					{user?.id && post?.author?.role === UserRole.LEADER && (
						<BottomSheetListItem
							label={post.isPinned ? '고정 해제하기' : '고정하기'}
							icon={post.isPinned ? PinOff : Pin}
							onPress={handleTogglePin}
						/>
					)}
					<BottomSheetListItem
						label="삭제하기"
						icon={Trash}
						variant="destructive"
						onPress={handleDeletePost}
					/>
				</BottomSheetListLayout>
			</BottomSheetContainer>
		</>
	);
}
