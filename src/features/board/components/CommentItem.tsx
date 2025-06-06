import { useBottomSheet } from '@/hooks/useBottomSheet';
import {
	BottomSheetListHeader,
} from '@/components/common/bottom-sheet';
import { useState } from 'react';
import { Alert, type ViewProps } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { Avatar } from '@/components/common/avatar';
import { VStack } from '#/components/ui/vstack';
import { Crown, MoreHorizontal, Pen, Trash } from 'lucide-react-native';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Icon } from '#/components/ui/icon';
import { Text } from '@/shared/components/text';

import { formatRelativeTime } from '@/shared/utils/formatRelativeTime';
import type { Comment } from '../types';
import { Box } from '#/components/ui/box';
import { PopupMenu, PopupMenuItem, PopupMenuItemLabel } from '@/shared/components/popup-menu';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

type CommentItemProps = {
	comment: Comment;
	onEdit: (id: string, content: string) => void;
	onDelete: (id: string) => void;
	isCurrentUser: boolean;
} & ViewProps;

/**
 * 댓글 컴포넌트
 */
export const CommentItem = ({
	comment,
	onEdit,
	onDelete,
	isCurrentUser,
	...props
}: CommentItemProps) => {
	// 메뉴 관련 상태
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// 댓글 수정을 위한 바텀시트
	const {
		BottomSheetContainer: EditBottomSheet,
		handleOpen: openEditSheet,
		handleClose: closeEditSheet,
	} = useBottomSheet();

	// 수정할 댓글 내용
	const [editContent, setEditContent] = useState(comment.content);

	// 댓글 수정 제출
	const handleSubmitEdit = () => {
		if (editContent.trim()) {
			onEdit(comment.id, editContent);
			closeEditSheet();
		}
	};

	// 댓글 삭제 확인
	const handleConfirmDelete = () => {
		Alert.alert('댓글 삭제', '정말 이 댓글을 삭제할까요?', [
			{ text: '취소', style: 'cancel' },
			{
				text: '삭제',
				style: 'destructive',
				onPress: () => onDelete(comment.id),
			},
		]);
	};

	return (
		<HStack space="md" className="py-4" {...props}>
			<Avatar
				size="sm"
				photoUrl={comment.author.photoUrl || ''}
			/>
			<VStack space="xs" className="flex-1">
				<HStack space="sm" className="items-center justify-between">
					<HStack space="sm" className="items-center">
						<HStack space="xs" className="items-center">
							<Text size="md" className="font-pretendard-bold">
								{comment.author.displayName || '이름없음'}
							</Text>
							{comment.author.role === 'leader' && (
								<Icon as={Crown} size="xs" className="text-yellow-500" />
							)}
						</HStack>
						<HStack space="xs" className="items-center">
							<Box className="w-1 h-1 rounded-full bg-gray-300" />
							<Text className="text-typography-500" size="sm">
								{formatRelativeTime(comment.createdAt)}
							</Text>
						</HStack>
					</HStack>
					{/* 댓글 작성자인 경우에만 더보기 메뉴 표시 */}
					{isCurrentUser && (
						<PopupMenu
							placement="bottom left"
							hasBackdrop={false}
							trigger={({ ...triggerProps }) => {
								return (
									<Button
										variant="icon"
										size="sm"
										className="absolute -top-5 -right-2"
										{...triggerProps}
									>
										<ButtonIcon as={MoreHorizontal} size="sm" />
									</Button>
								);
							}}
						>
							<PopupMenuItem
								closeOnSelect
								onPress={() => {
									setIsMenuOpen(false);
									setEditContent(comment.content);
									openEditSheet();
								}}
							>
								<Icon as={Pen} size="sm" className="mr-2 text-typography-700" />
								<PopupMenuItemLabel size="md">수정하기</PopupMenuItemLabel>
							</PopupMenuItem>
							<PopupMenuItem
								closeOnSelect
								onPress={() => {
									setIsMenuOpen(false);
									handleConfirmDelete();
								}}
							>
								<Icon as={Trash} size="sm" className="mr-2 text-error-500" />
								<PopupMenuItemLabel size="md" className="text-error-500">
									삭제하기
								</PopupMenuItemLabel>
							</PopupMenuItem>
						</PopupMenu>
					)}
				</HStack>
				<Text size="lg" className="text-typography-700">{comment.content}</Text>
			</VStack>

			{/* 댓글 수정 바텀시트 */}
			<EditBottomSheet>
				<VStack className="px-5">
					<BottomSheetListHeader
						label="댓글 수정하기"
						onPress={closeEditSheet}
					/>
					<VStack space="md" >
						<BottomSheetTextInput
							className="text-lg bg-gray-100 rounded-md p-3 text-typography-700 min-h-[100px] font-pretendard-Regular"
							placeholder="댓글을 입력하세요"
							defaultValue={editContent}
							onChangeText={setEditContent}
							multiline
							autoFocus
						/>
						<Button
							size="lg"
							onPress={handleSubmitEdit}
							disabled={!editContent.trim()}
						>
							<ButtonText>완료</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</EditBottomSheet>
		</HStack>
	);
};
