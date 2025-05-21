import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Box } from '#/components/ui/box';
import { Text } from '#/components/ui/text';
import { Keyboard, TextInput } from 'react-native';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Avatar } from '@/components/common/avatar';
import { Icon } from '#/components/ui/icon';
import { ChevronRight, Check, Plus } from 'lucide-react-native';
import Header from '@/components/common/Header';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import {
	BottomSheetListLayout,
	BottomSheetListHeader,
} from '@/components/common/bottom-sheet';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import { cn } from '@/shared/utils/cn';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Divider } from '#/components/ui/divider';
import { KeyboardToolbar } from '@/shared/components/KeyboardToolbar';
import { categoryLabels } from '@/features/board/constants';
import { PostCategory } from '@/features/board/types';
import {
	useBoardPost,
	useCreateBoardPost,
	useUpdateBoardPost,
} from '@/features/board/hooks';
import { ExitConfirmModal } from '@/components/common/exit-confirm-modal';
import { usePreventBackWithConfirm } from '@/shared/hooks/usePreventBackWithConfirm';
import { KeyboardAwareScrollView } from '@/shared/components/KeyboardAwareScrollView';

/**
 * 게시글 작성 화면
 */
export default function CreateBoardPostScreen() {
	const { user, currentGroup } = useAuthStore();
	const { showSuccess, showError } = useToastStore();
	const { isEdit, id } = useLocalSearchParams<{
		id?: string;
		isEdit?: string;
	}>();

	// 게시글 수정 모드 확인
	const isEditMode = isEdit === 'true';

	// 게시글 수정 모드에서 게시글 데이터 가져오기
	const { data: editPost } = useBoardPost(
		currentGroup?.groupId || '',
		id || '',
	);

	// 게시글 제목과 내용
	const [title, setTitle] = useState(isEditMode ? editPost?.title || '' : '');
	const [content, setContent] = useState(
		isEditMode ? editPost?.content || '' : '',
	);

	// 선택된 카테고리
	const [selectedCategory, setSelectedCategory] = useState<PostCategory>(
		isEditMode ? editPost?.category || PostCategory.FREE : PostCategory.FREE,
	);

	// 바텀시트 관련 후크
	const { BottomSheetContainer, handleOpen, handleClose } = useBottomSheet();

	// 화면 첫 접근 시 바텀시트 자동으로 열기
	useEffect(() => {
		if (isEditMode) return;
		// 약간의 지연 후 바텀시트 열기 (화면 전환 애니메이션 완료 후)
		const timer = setTimeout(() => {
			handleOpen();
		}, 300);

		return () => clearTimeout(timer);
	}, [handleOpen, isEditMode]);

	// 카테고리 선택 바텀시트 열기
	const handleOpenCategorySheet = () => {
		Keyboard.dismiss();
		handleOpen();
	};

	// 카테고리 선택 처리
	const handleSelectCategory = (category: PostCategory) => {
		setSelectedCategory(category);
		handleClose();
	};

	const hasContent = !!title.trim() || !!content.trim();
	const { bottomSheetProps, handleExit } = usePreventBackWithConfirm({
		condition: hasContent,
	});

	const { mutate: createPost } = useCreateBoardPost();
	const { mutate: updatePost } = useUpdateBoardPost();

	const handleSubmit = () => {
		if (!title.trim()) {
			showError('제목을 입력해주세요');
			return;
		}

		if (!content.trim()) {
			showError('내용을 입력해주세요');
			return;
		}

		if (!currentGroup) {
			showError('그룹 정보를 찾을 수 없어요');
			return;
		}

		if (!user) {
			showError('사용자 정보를 찾을 수 없어요');
			return;
		}

		if (isEditMode) {
			// 게시글 수정 요청
			updatePost(
				{
					metadata: {
						postId: id || '',
						groupId: currentGroup.groupId,
					},
					postData: {
						id: id || '',
						title: title.trim(),
						content: content.trim(),
						category: selectedCategory,
					},
				},
				{
					onSuccess: () => {
						showSuccess('게시글이 수정되었어요');
						router.dismiss();
					},
					onError: (error) => {
						console.error('게시글 수정 실패:', error);
						showError('게시글 수정에 실패했어요');
					},
				},
			);
			return;
		}

		// 게시글 생성 요청
		createPost(
			{
				title: title.trim(),
				content: content.trim(),
				category: selectedCategory,
				groupId: currentGroup.groupId,
				userId: user.id,
			},
			{
				onSuccess: (postId) => {
					showSuccess('게시글이 등록되었어요');
					router.replace(`/(app)/(board)/${postId.id}`);
				},
				onError: (error) => {
					console.error('게시글 등록 실패:', error);
					showError('게시글 등록에 실패했어요');
				},
			},
		);
	};

	return (
		<>
			<SafeAreaView className="flex-1 bg-white">
				<KeyboardAvoidingView>
					<KeyboardDismissView>
						<VStack className="flex-1">
							{/* 헤더 */}
							<Header className="justify-between pr-5">
								<Button
									variant="text"
									disabled={!title.trim() || !content.trim()}
									onPress={handleSubmit}
								>
									<ButtonText>{isEditMode ? '수정하기' : '남기기'}</ButtonText>
								</Button>
							</Header>
							<KeyboardAwareScrollView
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps="always"
							>
								<VStack className="flex-1 px-5">
									{/* 작성자 정보 영역 */}
									<HStack space="lg" className="py-5">
										<Avatar size="lg" photoUrl={user?.photoUrl || ''} />
										<VStack space="xs" className="justify-center">
											<Text size="md" className="font-pretendard-bold">
												{user?.displayName || '이름없음'}
											</Text>
											<AnimatedPressable onPress={handleOpenCategorySheet}>
												<HStack className="px-2 py-1 bg-gray-100 rounded-md items-center justify-between">
													<Text
														className={cn('text-sm font-pretendard-Medium')}
													>
														{categoryLabels[selectedCategory]}
													</Text>
													<Icon as={ChevronRight} size="sm" />
												</HStack>
											</AnimatedPressable>
										</VStack>
									</HStack>

									{/* 카테고리 선택 영역 */}

									{/* 구분선 */}
									<Divider className="bg-background-100" />

									{/* 제목 입력 영역 */}
									<Box className="py-3">
										<TextInput
											placeholder="제목을 입력해주세요"
											value={title}
											onChangeText={setTitle}
											className="text-xl font-pretendard-semi-bold p-2"
											maxLength={100}
										/>
									</Box>

									{/* 구분선 */}
									<Divider className="bg-background-100" />

									{/* 내용 입력 영역 */}
									<Box className="py-3 flex-1">
										<TextInput
											placeholder="신앙 나눔이나 이야기를 남겨보세요."
											value={content}
											onChangeText={setContent}
											className="text-lg font-pretendard-Medium flex-1 min-h-[200px] p-2"
											multiline
											textAlignVertical="top"
										/>
									</Box>
								</VStack>
							</KeyboardAwareScrollView>
						</VStack>
					</KeyboardDismissView>
					{/* TODO: 항목 추가 버튼 */}
					{/* <HStack className="px-4 pt-3 border-t border-background-200">
					<Button variant="text" rounded className="bg-background-50 px-3">
						<ButtonText>항목 추가하기</ButtonText>
						<ButtonIcon as={Plus} />
					</Button>
				</HStack> */}
				</KeyboardAvoidingView>

				{/* 카테고리 선택 바텀시트 */}
				<BottomSheetContainer>
					<BottomSheetListLayout>
						<BottomSheetListHeader
							label="어디에 작성할까요?"
							onPress={handleClose}
						/>
						{/* 자유게시판 선택 옵션 */}
						<AnimatedPressable
							onPress={() => handleSelectCategory(PostCategory.FREE)}
						>
							<HStack
								space="md"
								className="items-center justify-between py-3 pl-2 pr-4"
							>
								<Text
									size="lg"
									className={cn(
										selectedCategory === 'FREE' &&
										'font-pretendard-bold text-primary-400',
									)}
								>
									자유게시판
								</Text>
								{selectedCategory === 'FREE' && (
									<Icon as={Check} size="xl" className="stroke-primary-400" />
								)}
							</HStack>
						</AnimatedPressable>

						{/* 공지사항 선택 옵션 */}
						<AnimatedPressable
							onPress={() => handleSelectCategory(PostCategory.NOTICE)}
						>
							<HStack
								space="md"
								className="items-center justify-between py-3 pl-2 pr-4"
							>
								<Text
									size="lg"
									className={cn(
										selectedCategory === 'NOTICE' &&
										'font-pretendard-bold text-primary-400',
									)}
								>
									공지사항
								</Text>
								{selectedCategory === 'NOTICE' && (
									<Icon as={Check} size="xl" className="stroke-primary-400" />
								)}
							</HStack>
						</AnimatedPressable>
					</BottomSheetListLayout>
				</BottomSheetContainer>
				<ExitConfirmModal {...bottomSheetProps} onExit={handleExit} />
			</SafeAreaView>
			<KeyboardToolbar />
		</>
	);
}
