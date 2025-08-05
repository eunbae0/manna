import React, { useState } from 'react';
import { HStack } from '#/components/ui/hstack';
import { Alert } from 'react-native';
import { VStack } from '#/components/ui/vstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Avatar } from '@/components/common/avatar';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Text } from '@/shared/components/text';
import {
	PopupMenu,
	PopupMenuItem,
	PopupMenuItemLabel,
} from '@/shared/components/popup-menu';
import { openProfile } from '@/shared/utils/router';
import { MoreHorizontal, Pen, Trash } from 'lucide-react-native';
import type {
	AnswerCommentWithAuthorInfo,
	ClientFellowship,
} from '../../api/types';
import { Icon } from '#/components/ui/icon';
import { BottomSheetListHeader } from '@/components/common/bottom-sheet';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useFellowship } from '../../hooks/useFellowship';
import { useAuthStore } from '@/store/auth';
import { formatRelativeTime } from '../../../../shared/utils/formatRelativeTime';
import { Timestamp } from '@react-native-firebase/firestore';

export const CommentItem = React.memo(function CommentItem({
	fellowshipId,
	contentType,
	answerId,
	answerAuthorId,
	comment,
}: {
	fellowshipId: string;
	contentType: keyof ClientFellowship['content'];
	answerId: string;
	answerAuthorId: string;
	comment: AnswerCommentWithAuthorInfo;
}) {
	const { updateComment, deleteComment } = useFellowship(fellowshipId);
	const { user } = useAuthStore();

	const userId = user?.id || '';

	const isAuthor = userId === comment.author.id;

	//comment
	const [commentText, setCommentText] = useState(comment.content);

	const handlePressUpdateComment = (text: string) => {
		updateComment(contentType, answerId, answerAuthorId, comment.id, text);
		setCommentText('');
		handleClose();
	};

	const handleDeleteComment = () => {
		Alert.alert('댓글을 삭제할까요?', '', [
			{
				text: '삭제하기',
				onPress: handleConfirmDelete,
				style: 'destructive',
			},
			{ text: '아니요', style: 'cancel' },
		]);
	};
	const handleConfirmDelete = () => {
		deleteComment(contentType, answerId, answerAuthorId, comment.id);
	};

	const { BottomSheetContainer, handleOpen, handleClose } = useBottomSheet();

	const ts = new Timestamp(
		// @ts-expect-error: make date object manually (date is Object, not Timestamp)
		comment.createdAt._seconds,
		// @ts-expect-error: make date object manually (date is Object, not Timestamp)
		comment.createdAt._nanoseconds,
	);
	const date = ts.toDate();

	return (
		<>
			<HStack space="sm" className="justify-between mt-5">
				<HStack space="sm">
					<Avatar
						size="2xs"
						photoUrl={comment.author?.photoUrl || undefined}
						className="mt-[2px]"
					/>
					<VStack space="xs">
						<AnimatedPressable
							onPress={() =>
								!comment.author?.isGuest && openProfile(comment.author?.id)
							}
							className="self-start"
						>
							<Text
								size="lg"
								weight="semi-bold"
								className="text-typography-600"
							>
								{comment.author?.displayName}
							</Text>
							<Text size="lg" weight="light" className="text-typography-500">
								{formatRelativeTime(date)}
							</Text>
						</AnimatedPressable>
						<Text size="lg" className="text-typography-800">
							{comment.content}
						</Text>
					</VStack>
				</HStack>
				{isAuthor && (
					<PopupMenu
						placement="bottom left"
						hasBackdrop={false}
						trigger={({ ...triggerProps }) => {
							return (
								<Button
									variant="icon"
									size="sm"
									className="absolute -top-2 -right-3"
									{...triggerProps}
								>
									<ButtonIcon
										as={MoreHorizontal}
										className="text-typography-600"
									/>
								</Button>
							);
						}}
					>
						<PopupMenuItem closeOnSelect onPress={handleOpen}>
							<Icon as={Pen} size="sm" className="mr-2 text-typography-700" />
							<PopupMenuItemLabel size="md">수정하기</PopupMenuItemLabel>
						</PopupMenuItem>
						<PopupMenuItem closeOnSelect={true} onPress={handleDeleteComment}>
							<Icon as={Trash} size="sm" className="mr-2 text-error-500" />
							<PopupMenuItemLabel size="md" className="text-error-500">
								삭제하기
							</PopupMenuItemLabel>
						</PopupMenuItem>
					</PopupMenu>
				)}
			</HStack>
			<BottomSheetContainer>
				<VStack space="md" className="px-5 pt-3">
					<BottomSheetListHeader label="답글 수정하기" onPress={handleClose} />
					<VStack space="4xl">
						<BottomSheetTextInput
							placeholder="답글을 입력해주세요."
							className={TEXT_INPUT_STYLE}
							multiline
							defaultValue={commentText}
							onChangeText={setCommentText}
						/>
						<Button
							size="lg"
							onPress={() => handlePressUpdateComment(commentText)}
						>
							<ButtonText>수정하기</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</BottomSheetContainer>
		</>
	);
});
