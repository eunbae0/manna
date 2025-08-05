import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Avatar } from '@/components/common/avatar';
import { openProfile } from '@/shared/utils/router';
import { Heart, MessageSquare } from 'lucide-react-native';
import { Icon } from '#/components/ui/icon';
import type {
	AnswerContentWithAuthorInfo,
	ClientFellowship,
} from '../../api/types';
import { CommentItem } from './CommentItem';
import { Text } from '@/shared/components/text';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { BottomSheetListHeader } from '../../../../components/common/bottom-sheet/index';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Button, ButtonText } from '@/components/common/button';
import React, { useState } from 'react';
import { useFellowship } from '../../hooks/useFellowship';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/shared/utils/cn';
import { Box } from '#/components/ui/box';

type AnswerItemProps = {
	fellowshipId: string;
	contentType: keyof ClientFellowship['content'];
	answerId: string;
	answer: AnswerContentWithAuthorInfo;
};

export const AnswerItem = React.memo(function AnswerItem({
	fellowshipId,
	contentType,
	answerId,
	answer,
}: AnswerItemProps) {
	const { author, content: answerContent } = answer;

	return (
		<HStack space="sm" key={author?.id}>
			<Avatar
				size="xs"
				photoUrl={author?.photoUrl || undefined}
				className="mt-[2px]"
			/>
			<VStack space="xs" className="flex-1 pr-3">
				<VStack space="sm">
					<VStack space="xs">
						<AnimatedPressable
							onPress={() => !author?.isGuest && openProfile(author?.id)}
							className="self-start"
						>
							<Text
								size="lg"
								weight="semi-bold"
								className="text-typography-600"
							>
								{author?.displayName}
							</Text>
						</AnimatedPressable>
						<Text size="lg" className="text-typography-800">
							{answerContent}
						</Text>
					</VStack>
				</VStack>
				<ReactionBox
					fellowshipId={fellowshipId}
					contentType={contentType}
					answerId={answerId}
					answer={answer}
				/>
			</VStack>
		</HStack>
	);
});

export function ReactionBox({
	fellowshipId,
	contentType,
	answerId,
	answer,
}: AnswerItemProps) {
	const { author, comments, commentCount, reactions } = answer;
	const { toggleLike, addComment } = useFellowship(fellowshipId);
	const { user } = useAuthStore();
	const userId = user?.id || '';

	const isLiked = reactions.likes.includes(userId);
	const handlePressLike = () => {
		toggleLike(contentType, answerId, author.id, userId, isLiked);
	};

	//comment
	const [commentText, setCommentText] = useState('');

	const createComment = (text: string) => {
		addComment(contentType, answerId, answer.author.id, userId, text);
		setCommentText('');
		handleClose();
	};

	const { BottomSheetContainer, handleOpen, handleClose } = useBottomSheet();

	const commentsArray = Object.values(comments)
		.filter((c) => !c.isDeleted)
		// @ts-expect-error: createdAt is Firesgore Timestamp
		.sort((a, b) => b.createdAt._seconds - a.createdAt._seconds);
	return (
		<>
			<VStack>
				<HStack space="lg" className="mt-1 items-center">
					<HStack space="xs" className="items-center">
						<AnimatedPressable
							onPress={handlePressLike}
							pressableClassName="py-2"
						>
							<Icon
								as={Heart}
								fill={isLiked ? '#362303' : ''}
								className={cn(
									isLiked ? 'text-primary-500' : 'text-typography-600',
								)}
							/>
						</AnimatedPressable>
						<Text
							weight="medium"
							className={cn(
								isLiked ? 'text-primary-500' : 'text-typography-600',
							)}
						>
							{reactions.likeCount || ''}
						</Text>
					</HStack>
					<HStack space="xs" className="items-center">
						<AnimatedPressable onPress={handleOpen} pressableClassName="py-2">
							<Icon as={MessageSquare} className="text-typography-600" />
						</AnimatedPressable>
						<Text weight="medium" className="text-typography-600">
							{commentCount || ''}
						</Text>
					</HStack>
				</HStack>
				<VStack space="xs">
					{commentsArray.length > 0 &&
						commentsArray?.map((comment) => (
							<CommentItem
								key={comment.id}
								fellowshipId={fellowshipId}
								contentType={contentType}
								answerId={answerId}
								answerAuthorId={author?.id}
								comment={comment}
							/>
						))}
				</VStack>
				{commentCount > 0 && (
					<HStack space="sm" className="items-center mt-6">
						<Avatar size="2xs" photoUrl={user?.photoUrl || undefined} />
						<AnimatedPressable
							scale="sm"
							onPress={handleOpen}
							className="flex-1"
						>
							<Box className="border border-background-200/70 rounded-3xl px-4 py-2">
								<Text
									size="md"
									weight="regular"
									className="text-typography-500"
								>
									답글을 입력해주세요.
								</Text>
							</Box>
						</AnimatedPressable>
					</HStack>
				)}
			</VStack>
			<BottomSheetContainer>
				<VStack space="md" className="px-5 pt-3">
					<BottomSheetListHeader
						label={`${author?.displayName}님의 나눔에 답글 남기기`}
						onPress={handleClose}
					/>
					<VStack space="4xl">
						<BottomSheetTextInput
							placeholder="댓글을 입력해주세요."
							className={TEXT_INPUT_STYLE}
							multiline
							defaultValue={commentText}
							onChangeText={setCommentText}
						/>
						<Button size="lg" onPress={() => createComment(commentText)}>
							<ButtonText>등록하기</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</BottomSheetContainer>
		</>
	);
}
