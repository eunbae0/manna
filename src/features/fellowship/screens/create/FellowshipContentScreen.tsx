import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Divider } from '#/components/ui/divider';
import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Switch } from '#/components/ui/switch';
import { Text } from '@/shared/components/text';
import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';
import { useAuthStore } from '@/store/auth';
import { useFellowshipStore } from '@/store/createFellowship';
import {
	ChevronRight,
	Check,
	ChevronDown,
	Pickaxe,
	MessageSquareHeart,
	X,
	Plus,
	ThumbsUp,
	HelpingHand,
} from 'lucide-react-native';
import { Keyboard, TextInput } from 'react-native';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBackHandler } from '@/shared/hooks/useBackHandler';
import { useRecentFellowshipsWhereUserIsLeader } from '../../hooks/useRecentFellowshipsWhereUserIsLeader';
import AnimatedPressable from '@/components/common/animated-pressable';
import { ScrollView } from 'react-native-gesture-handler';
import type {
	CompactClientFellowshipV2,
	FellowshipContentItemV2,
} from '../../api/types';
import { v4 as uuidv4 } from 'uuid';
import { useExpandAnimation } from '@/shared/hooks/animation/useExpandAnimation';
import Animated from 'react-native-reanimated';
import { cn } from '@/shared/utils/cn';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import { KeyboardAwareScrollView } from '@/shared/components/KeyboardAwareScrollView';
import {
	BottomSheetListLayout,
	BottomSheetListHeader,
} from '@/components/common/bottom-sheet';
import {
	type QuestionCategory,
	ICEBREAKING_CATEGORIES,
	SERMON_CATEGORIES,
} from '../../constants/question';
import { Box } from '#/components/ui/box';

export default function FellowshipContentScreen() {
	const { user } = useAuthStore();
	const {
		type,
		setStep,
		updateFellowshipContent: updateFellowshipContentStore,
		content,
		hasShownRecentRecommendSheet,
		setHasShownRecentRecommendSheet,
	} = useFellowshipStore();

	const { data: fellowships } = useRecentFellowshipsWhereUserIsLeader(
		user?.id || '',
	);

	// 선택된 fellowship과 선택된 질문들을 관리하는 상태
	type FellowshipItem = NonNullable<CompactClientFellowshipV2>;
	const [selectedFellowship, setSelectedFellowship] =
		useState<FellowshipItem | null>(null);
	const [selectedQuestions, setSelectedQuestions] = useState<{
		iceBreaking: string[];
		sermonTopic: string[];
	}>({
		iceBreaking: [],
		sermonTopic: [],
	});

	const { BottomSheetContainer, handleOpen, handleClose } = useBottomSheet({
		variant: 'bottomSheet',
		onClose: () => {
			setHasShownRecentRecommendSheet(true);
		},
	});

	const handleCloseSheet = () => {
		setHasShownRecentRecommendSheet(true);
		handleClose();
	};

	useEffect(() => {
		if (type === 'EDIT') return;
		if (
			fellowships &&
			fellowships.items.length > 0 &&
			!hasShownRecentRecommendSheet
		) {
			handleOpen();
		}
	}, [type, fellowships, handleOpen, hasShownRecentRecommendSheet]);

	useBackHandler(() => {
		setStep('INFO');
		return true;
	});

	const {
		toggle: toggleIceBreaking,
		containerStyle: iceBreakingContainerStyle,
		iconStyle: iceBreakingIconStyle,
		onContentLayout: onIceBreakingContentLayout,
	} = useExpandAnimation();

	const {
		toggle: toggleSermonTopic,
		containerStyle: sermonTopicContainerStyle,
		iconStyle: sermonTopicIconStyle,
		onContentLayout: onSermonTopicContentLayout,
	} = useExpandAnimation();

	const iceBreakingTextInputRef = useRef<TextInput>(null);
	const sermonTextInputRef = useRef<TextInput>(null);

	const [iceBreakingAnswers, setIceBreakingAnswers] = useState(
		content.categories.iceBreaking.items && Object.values(content.categories.iceBreaking.items).length > 0
			? Object.values(content.categories.iceBreaking.items).map(({ id, title }) => { return { id, title } })
			: [
				{ id: 'iceBreaking_temp', title: '' },
			]);

	const [sermonTopicAnswers, setSermonTopicAnswers] = useState(
		content.categories.sermonTopic.items && Object.values(content.categories.sermonTopic.items).length > 0
			? Object.values(content.categories.sermonTopic.items).map(({ id, title }) => { return { id, title } })
			: [
				{ id: 'sermonTopic_temp', title: '' },
			]);


	// 나눔 추천
	const {
		BottomSheetContainer: RecommendedQuestionsBottomSheetContainer,
		handleOpen: handleOpenRecommendedQuestions,
		handleClose: handleCloseRecommendedQuestions,
	} = useBottomSheet();

	const [selectedCategory, setSelectedCategory] = useState<
		'iceBreaking' | 'sermonTopic'
	>('iceBreaking');
	const [activeCategoryId, setActiveCategoryId] = useState<string>('1');
	const [recommendedQuestions, setRecommendedQuestions] = useState<
		QuestionCategory[]
	>(ICEBREAKING_CATEGORIES);

	// 선택된 질문 개수 계산
	const selectedQuestionsCount = useMemo(() => {
		return recommendedQuestions.reduce((count, category) => {
			return count + category.questions.filter((q) => q.selected).length;
		}, 0);
	}, [recommendedQuestions]);

	const handlePressRecommendedQuestions = (
		category: 'iceBreaking' | 'sermonTopic',
	) => {
		Keyboard.dismiss();
		setSelectedCategory(category);
		setRecommendedQuestions(
			category === 'iceBreaking' ? ICEBREAKING_CATEGORIES : SERMON_CATEGORIES,
		);
		handleOpenRecommendedQuestions();
	};

	const handleSelectCategory = (categoryId: string) => {
		setActiveCategoryId(categoryId);
	};

	const handleToggleQuestion = (categoryId: string, questionId: string) => {
		setRecommendedQuestions((prev) => {
			return prev.map((category) => {
				if (category.id === categoryId) {
					return {
						...category,
						questions: category.questions.map((question) => {
							if (question.id === questionId) {
								return { ...question, selected: !question.selected };
							}
							return question;
						}),
					};
				}
				return category;
			});
		});
	};

	const handleAddSelectedQuestions = () => {
		const isIceBreaking = selectedCategory === 'iceBreaking';
		// 모든 카테고리에서 선택된 질문들 수집
		const selectedQuestions = recommendedQuestions
			.flatMap((category) => category.questions)
			.filter((question) => question.selected)
			.map((question) => ({
				id: uuidv4(),
				title: question.text,
			}));

		if (selectedQuestions.length === 0) {
			// 선택된 질문이 없으면 바텀시트만 닫기
			handleCloseRecommendedQuestions();
			return;
		}

		if (isIceBreaking) {
			const updatedFields = [
				...iceBreakingAnswers.filter(({ title }) => title !== ''),
				...selectedQuestions,
			];
			setIceBreakingAnswers(updatedFields);
		} else {
			const updatedFields = [
				...sermonTopicAnswers.filter(({ title }) => title !== ''),
				...selectedQuestions,
			];
			setSermonTopicAnswers(updatedFields);
		}

		// 선택 상태 초기화
		setRecommendedQuestions((prev) => {
			return prev.map((category) => ({
				...category,
				questions: category.questions.map((question) => ({
					...question,
					selected: false,
				})),
			}));
		});

		// 바텀시트 닫기
		handleCloseRecommendedQuestions();

		// 포커스 설정 (마지막 필드로)
		setTimeout(() => {
			if (isIceBreaking) {
				iceBreakingTextInputRef.current?.focus();
			} else {
				sermonTextInputRef.current?.focus();
			}
		}, 100);
	};

	// local > store 업데이트
	const updateFellowshipContent = () => {
		const iceBreakingItems: Record<string, FellowshipContentItemV2> = {}
		iceBreakingAnswers.forEach(({ id, title }, index) => {
			if (!title) return;
			iceBreakingItems[id] = {
				id, title, order: index, answers: {}
			}
		})
		if (Object.keys(iceBreakingItems).length === 0)
			iceBreakingItems.iceBreaking_temp = {
				id: 'iceBreaking_temp', title: '', order: 0, answers: {}
			}
		const sermonTopicItems: Record<string, FellowshipContentItemV2> = {}
		sermonTopicAnswers.forEach(({ id, title }, index) => {
			if (!title) return;
			sermonTopicItems[id] = {
				id, title, order: index, answers: {}
			}
		})
		if (Object.keys(sermonTopicItems).length === 0)
			sermonTopicItems.sermonTopic_temp = {
				id: 'sermonTopic_temp', title: '', order: 0, answers: {}
			}
		updateFellowshipContentStore({
			categories: {
				iceBreaking: {
					order: 0,
					id: 'iceBreaking',
					title: "아이스 브레이킹",
					type: 'iceBreaking',
					isActive: iceBreakingAnswers.length > 0,
					items: iceBreakingItems
				},
				sermonTopic: {
					order: 1,
					id: 'sermonTopic',
					title: "설교 나눔",
					type: 'sermonTopic',
					isActive: sermonTopicAnswers.length > 0,
					items: sermonTopicItems
				},
			},
		});
	}

	return (
		<>
			<KeyboardDismissView className="flex-1">
				<Header onPressBackButton={() => setStep('INFO')} />
				<KeyboardAwareScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
					keyboardShouldPersistTaps="handled"
				>
					<VStack className="flex-1">
						<VStack className="px-5 py-6 gap-16 flex-1">
							<HStack className="items-center justify-between">
								<Heading className="text-[24px]">
									나눔은 어떻게 진행할까요?
								</Heading>
								{/* TODO: 도움말 모달 추가하기 */}
								{/* <Pressable>
									<Icon
										as={CircleHelp}
										size="lg"
										className="color-typography-600"
									/>
								</Pressable> */}
							</HStack>
							<VStack className="gap-7">
								<VStack>
									<AnimatedPressable onPress={() => toggleIceBreaking()}>
										<HStack className="items-center justify-between">
											<HStack space="md" className="items-center">
												<Icon
													as={Pickaxe}
													size="xl"
													className="text-primary-500"
												/>
												<Text
													size="xl"
													weight="medium"
													className="text-typography-700"
												>
													아이스 브레이킹
												</Text>
											</HStack>
											<HStack space="md" className="items-center">
												<Text
													size="lg"
													weight="medium"
													className="text-typography-700"
												>
													{iceBreakingAnswers.length === 1 && iceBreakingAnswers[0].title === ''
														? '질문을 추가해보세요'
														: `${iceBreakingAnswers.length}개`}
												</Text>
												<Animated.View style={[iceBreakingIconStyle]}>
													<Icon
														as={ChevronDown}
														size="md"
														className="text-typography-500"
													/>
												</Animated.View>
											</HStack>
										</HStack>
									</AnimatedPressable>
									<Animated.View style={iceBreakingContainerStyle}>
										<VStack
											space="md"
											className="pt-6"
											onLayout={onIceBreakingContentLayout}
										>
											{iceBreakingAnswers.map(({ id, title }, index) => (
												<HStack key={id} space="sm" className="items-center">
													<TextInput
														ref={
															index === iceBreakingAnswers.length - 1
																? iceBreakingTextInputRef
																: null
														}
														value={title}
														onChangeText={(text) => {
															const updatedFields = [...iceBreakingAnswers];
															updatedFields[index].title = text;
															setIceBreakingAnswers(updatedFields);
														}}
														multiline
														placeholder="ex. 이번 주 동안 있었던 재밌는 일 한가지를 말해주세요"
														textAlignVertical="top"
														className={cn(
															TEXT_INPUT_STYLE,
															'text-lg py-3 placeholder:text-typography-400 flex-1',
														)}
													/>
													{iceBreakingAnswers.length > 1 && (
														<Button
															variant="icon"
															onPress={() => {
																const updatedFields = iceBreakingAnswers.filter(
																	(item) => item.id !== id,
																);
																setIceBreakingAnswers(updatedFields);
															}}
														>
															<ButtonIcon as={X} />
														</Button>
													)}
												</HStack>
											))}
											<HStack space="sm" className="items-center">
												<Button
													variant="outline"
													className="flex-1"
													onPress={() => {
														const updatedFields = [...iceBreakingAnswers];
														updatedFields.push({ id: uuidv4(), title: '' });
														setIceBreakingAnswers(updatedFields);
														// focus keyboard
														setTimeout(() => {
															iceBreakingTextInputRef.current?.focus();
														}, 100);
													}}
												>
													<ButtonText>항목 추가</ButtonText>
													<ButtonIcon as={Plus} />
												</Button>
												<Button
													className="flex-1"
													onPress={() =>
														handlePressRecommendedQuestions('iceBreaking')
													}
												>
													<ButtonText>추천 질문 보기</ButtonText>
													<ButtonIcon as={ThumbsUp} />
												</Button>
											</HStack>
										</VStack>
									</Animated.View>
								</VStack>

								<Divider />

								<VStack>
									<AnimatedPressable onPress={() => toggleSermonTopic()}>
										<HStack className="items-center justify-between">
											<HStack space="md" className="items-center">
												<Icon
													as={MessageSquareHeart}
													size="xl"
													className="text-primary-500"
												/>
												<Text
													size="xl"
													weight="medium"
													className="text-typography-700"
												>
													설교 나눔
												</Text>
											</HStack>
											<HStack space="md" className="items-center">
												<Text
													size="lg"
													weight="medium"
													className="text-typography-700"
												>
													{sermonTopicAnswers.length === 1 && sermonTopicAnswers[0].title === ''
														? '질문을 추가해보세요'
														: `${sermonTopicAnswers.length}개`}
												</Text>
												<Animated.View style={[sermonTopicIconStyle]}>
													<Icon
														as={ChevronDown}
														size="md"
														className="text-typography-500"
													/>
												</Animated.View>
											</HStack>
										</HStack>
									</AnimatedPressable>
									<Animated.View style={sermonTopicContainerStyle}>
										<VStack
											space="md"
											className="pt-6"
											onLayout={onSermonTopicContentLayout}
										>
											{sermonTopicAnswers.map(({ id, title }, index) => (
												<HStack key={id} space="sm" className="items-center">
													<TextInput
														ref={
															index === sermonTopicAnswers.length - 1
																? sermonTextInputRef
																: null
														}
														value={title}
														onChangeText={(text) => {
															const updatedFields = [...sermonTopicAnswers];
															updatedFields[index].title = text;
															setSermonTopicAnswers(updatedFields);
														}}
														multiline
														placeholder="ex. 오늘 말씀을 삶에 어떻게 적용할 수 있을까요?"
														textAlignVertical="top"
														className={cn(
															TEXT_INPUT_STYLE,
															'text-lg py-3 placeholder:text-typography-400 flex-1',
														)}
													/>
													{sermonTopicAnswers.length > 1 && (
														<Button
															variant="icon"
															onPress={() => {
																const updatedFields = sermonTopicAnswers.filter(
																	(item) => item.id !== id,
																);
																setSermonTopicAnswers(updatedFields);
															}}
														>
															<ButtonIcon as={X} />
														</Button>
													)}
												</HStack>
											))}
											<HStack space="sm" className="items-center">
												<Button
													variant="outline"
													className="flex-1"
													onPress={() => {
														const updatedFields = [...sermonTopicAnswers];
														updatedFields.push({ id: uuidv4(), title: '' });
														setSermonTopicAnswers(updatedFields);
														// focus keyboard
														setTimeout(() => {
															sermonTextInputRef.current?.focus();
														}, 100);
													}}
												>
													<ButtonText>항목 추가</ButtonText>
													<ButtonIcon as={Plus} />
												</Button>
												<Button
													className="flex-1"
													onPress={() =>
														handlePressRecommendedQuestions('sermonTopic')
													}
												>
													<ButtonText>추천 질문 보기</ButtonText>
													<ButtonIcon as={ThumbsUp} />
												</Button>
											</HStack>
										</VStack>
									</Animated.View>
								</VStack>

								<Divider />

								<HStack className="items-center justify-between">
									<HStack space="md" className="items-center">
										<Icon
											as={HelpingHand}
											size="xl"
											className="text-primary-500"
										/>
										<Text
											size="xl"
											weight="medium"
											className="text-typography-700"
										>
											기도 제목
										</Text>
									</HStack>
									<HStack space="sm" className="items-center">
										{/* <Text size="md" weight="regular" className="text-typography-600">
											활성화 됨
										</Text> */}
										<Switch
											size="md"
											isDisabled={false}
											defaultValue={content.categories.prayerRequest.isActive}
											onChange={() => {
												updateFellowshipContentStore({
													categories: {
														prayerRequest: {
															isActive: !content.categories.prayerRequest.isActive,
														},
													},
												});
											}}
										/>
									</HStack>
								</HStack>

								<Box className="h-20" />
							</VStack>
						</VStack>
					</VStack>
				</KeyboardAwareScrollView>
				<HStack space="sm" className="mb-6 mx-5">
					<Button
						size="lg"
						variant="outline"
						className="flex-1"
						onPress={() => {
							updateFellowshipContent();
							setStep('INFO');
						}}
					>
						<ButtonText>이전으로</ButtonText>
					</Button>
					<Button
						size="lg"
						variant="solid"
						className="flex-1"
						onPress={() => {
							updateFellowshipContent();
							setStep('OPTIONS');
						}}
					>
						<ButtonText>다음</ButtonText>
					</Button>
				</HStack>
			</KeyboardDismissView>
			<BottomSheetContainer>
				<VStack space="2xl" className="justify-center pt-4 pb-5 px-4">
					<VStack className="items-start" space="sm">
						<Heading size="2xl" className="text-start font-pretendard-bold">
							최근에 진행한 나눔이 있네요!
						</Heading>
						<Text size="lg" className="text-start text-typography-500">
							최근 진행한 나눔에서 질문을 가져와 보세요.
						</Text>
					</VStack>
					{!selectedFellowship ? (
						<VStack space="2xl">
							<ScrollView className="md:max-h-screen max-h-60">
								{fellowships?.items.map((fellowship) => (
									<AnimatedPressable
										scale="sm"
										key={fellowship.identifiers.id}
										onPress={() => {
											setSelectedFellowship(fellowship);
											// 선택된 질문 초기화
											setSelectedQuestions({
												iceBreaking: [],
												sermonTopic: [],
											});
										}}
										className="w-full mb-2"
									>
										<HStack className="w-full justify-between items-center p-4 border border-neutral-200 rounded-lg">
											<VStack space="xs">
												<Text size="md" className="font-pretendard-Medium">
													{new Date(fellowship.info.date).toLocaleDateString(
														'ko-KR',
														{
															year: 'numeric',
															month: '2-digit',
															day: '2-digit',
														},
													)}{' '}
													{new Date(fellowship.info.date).toLocaleTimeString(
														'ko-KR',
														{
															hour: '2-digit',
															minute: '2-digit',
															hour12: false,
														},
													)}
												</Text>
												<Text size="lg" className="font-pretendard-bold">
													{fellowship.info.title || '제목 없음'}
												</Text>
											</VStack>
											<Icon as={ChevronRight} size="md" color="#9CA3AF" />
										</HStack>
									</AnimatedPressable>
								))}
							</ScrollView>
							<Button
								onPress={handleCloseSheet}
								fullWidth
								animation
								size="lg"
								variant="outline"
							>
								<ButtonText>다음에 할래요</ButtonText>
							</Button>
						</VStack>
					) : (
						<>
							<VStack space="lg" className="w-full">
								{/* 아이스브레이킹 섹션 */}
								<VStack space="sm" className="w-full">
									{selectedFellowship?.content.categories.iceBreaking.items
										&& (
											<Text size="lg" className="font-pretendard-bold">
												아이스브레이킹
											</Text>
										)}
									{Object.values(selectedFellowship?.content.categories.iceBreaking.items).map(
										({ id, title }) => (
											<AnimatedPressable
												scale="sm"
												key={id}
												onPress={() => {
													setSelectedQuestions((prev) => {
														const isSelected = prev.iceBreaking.includes(
															title,
														);
														return {
															...prev,
															iceBreaking: isSelected
																? prev.iceBreaking.filter(
																	(q) => q !== title,
																)
																: [...prev.iceBreaking, title],
														};
													});
												}}
												className="w-full"
											>
												<HStack className="w-full justify-between items-center p-3 border border-neutral-200 rounded-lg">
													<Text className="flex-1" size="md">
														{title}
													</Text>
													{selectedQuestions.iceBreaking.includes(
														title,
													) ? (
														<HStack className="justify-center items-center w-6 h-6 bg-primary-500 rounded-md">
															<Icon as={Check} size="sm" color="white" />
														</HStack>
													) : (
														<HStack className="justify-center items-center w-6 h-6 border border-primary-500 rounded-md">
															<Icon as={Check} size="sm" color="white" />
														</HStack>
													)}
												</HStack>
											</AnimatedPressable>
										),
									)}
								</VStack>

								{/* 설교 나눔 섹션 */}
								<VStack space="sm" className="w-full">
									{selectedFellowship?.content.categories.sermonTopic.items && (
										<Text size="lg" className="font-pretendard-bold">
											설교 나눔
										</Text>
									)}
									{Object.values(selectedFellowship?.content.categories.sermonTopic.items).map(
										({ id, title }) => (
											<AnimatedPressable
												key={id}
												onPress={() => {
													setSelectedQuestions((prev) => {
														const isSelected = prev.sermonTopic.includes(
															title,
														);
														return {
															...prev,
															sermonTopic: isSelected
																? prev.sermonTopic.filter(
																	(q) => q !== title,
																)
																: [...prev.sermonTopic, title],
														};
													});
												}}
												className="w-full"
											>
												<HStack className="w-full justify-between items-center p-3 border border-neutral-200 rounded-lg">
													<Text className="flex-1" size="md">
														{title}
													</Text>
													{selectedQuestions.sermonTopic.includes(
														title,
													) ? (
														<HStack className="justify-center items-center w-6 h-6 bg-primary-500 rounded-md">
															<Icon as={Check} size="sm" color="white" />
														</HStack>
													) : (
														<HStack className="justify-center items-center w-6 h-6 border border-primary-500 rounded-md">
															<Icon as={Check} size="sm" color="white" />
														</HStack>
													)}
												</HStack>
											</AnimatedPressable>
										),
									)}
								</VStack>

								<HStack className="w-full mt-4" space="sm">
									<Button
										variant="outline"
										onPress={() => setSelectedFellowship(null)}
										animation
										size="lg"
										className="flex-1"
									>
										<ButtonText>뒤로</ButtonText>
									</Button>
									<Button
										variant="solid"
										onPress={() => {
											// 선택된 질문들을 추가
											const selectedIceBreaking =
												Object.values(selectedFellowship.content.categories.iceBreaking.items)
													.filter((item: { title: string }) =>
														selectedQuestions.iceBreaking.includes(
															item.title,
														),
													)
													.map(({ title }) => ({
														id: uuidv4(),
														title,
														answers: {},
													}));

											const selectedSermonTopic =
												Object.values(selectedFellowship.content.categories.sermonTopic.items)
													.filter((item: { title: string }) =>
														selectedQuestions.sermonTopic.includes(
															item.title,
														),
													)
													.map(({ title }) => ({
														id: uuidv4(),
														title,
														answers: {},
													}));
											if (selectedIceBreaking.length > 0) {
												const updatedFields = [
													...iceBreakingAnswers.filter(({ title }) => title !== ''),
													...selectedIceBreaking,
												];
												setIceBreakingAnswers(updatedFields);
											}
											if (selectedSermonTopic.length > 0) {
												const updatedSermonTopicFields = [
													...sermonTopicAnswers.filter(({ title }) => title !== ''),
													...selectedSermonTopic,
												];
												setSermonTopicAnswers(updatedSermonTopicFields);
											}
											// BottomSheet 닫기
											handleCloseSheet();
										}}
										animation
										size="lg"
										className="flex-1"
										disabled={
											selectedQuestions.iceBreaking.length === 0 &&
											selectedQuestions.sermonTopic.length === 0
										}
									>
										<ButtonText>
											{selectedQuestions.iceBreaking.length +
												selectedQuestions.sermonTopic.length}
											개 추가하기
										</ButtonText>
									</Button>
								</HStack>
							</VStack>
						</>
					)}
				</VStack>
			</BottomSheetContainer>
			<RecommendedQuestionsBottomSheetContainer>
				<BottomSheetListLayout className="pb-4">
					<BottomSheetListHeader
						label={
							selectedCategory === 'iceBreaking'
								? '아이스 브레이킹 추천 질문'
								: '설교 나눔 추천 질문'
						}
						onPress={handleCloseRecommendedQuestions}
					/>
					<VStack>
						{/* 카테고리 탭 */}
						<HStack className="mb-4 border-b border-background-200">
							{recommendedQuestions.map((category) => (
								<AnimatedPressable
									key={category.id}
									scale='sm'
									onPress={() => handleSelectCategory(category.id)}
									className={cn(
										activeCategoryId === category.id &&
										'border-b-2 border-primary-500',
									)}
								>
									<Text
										size="lg"
										weight="semi-bold"
										className={cn(
											activeCategoryId === category.id
												? 'text-primary-500'
												: 'text-typography-500',
											'py-2 px-4',
										)}
									>
										{category.title}
									</Text>
								</AnimatedPressable>
							))}
						</HStack>

						{/* 현재 선택된 카테고리의 질문 목록 */}
						<ScrollView className="h-64" showsVerticalScrollIndicator={false}>
							<VStack space="md" className="mb-4">
								{recommendedQuestions
									.find((category) => category.id === activeCategoryId)
									?.questions.map((question) => {
										const isSelected = question.selected;
										return (
											<AnimatedPressable
												key={question.id}
												scale='sm'
												onPress={() =>
													handleToggleQuestion(activeCategoryId, question.id)
												}
											>
												<HStack space="md" className="items-center justify-between py-3">
													<HStack space="sm" className="items-center flex-1">
														<Box className="w-2 h-2 bg-background-400 rounded-full" />
														<Text size="lg" className="flex-1">
															{question.text}
														</Text>
													</HStack>
													{isSelected ? (
														<Box className="bg-primary-500 rounded-full p-1 w-6 h-6 mr-2">
															<Icon as={Check} size="sm" color="white" />
														</Box>
													) : (
														<Box className="border border-primary-500 rounded-full p-1 w-6 h-6 mr-2" />
													)}
												</HStack>
											</AnimatedPressable>
										);
									})}
							</VStack>
						</ScrollView>

						{/* 추가하기 버튼 */}
						<Button
							size="lg"
							className="mt-2"
							onPress={handleAddSelectedQuestions}
						>
							<ButtonText>
								{selectedQuestionsCount > 0
									? `${selectedQuestionsCount}개 추가하기`
									: '닫기'}
							</ButtonText>
						</Button>
					</VStack>
				</BottomSheetListLayout>
			</RecommendedQuestionsBottomSheetContainer>
		</>
	);
}
