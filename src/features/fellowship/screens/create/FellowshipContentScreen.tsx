import { Button, ButtonText } from '@/components/common/button';
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
import { ChevronRight, Check } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useEffect, useState } from 'react';
import { useBackHandler } from '@/shared/hooks/useBackHandler';
import { useRecentFellowshipsWhereUserIsLeader } from '../../hooks/useRecentFellowshipsWhereUserIsLeader';
import AnimatedPressable from '@/components/common/animated-pressable';
import { ScrollView } from 'react-native-gesture-handler';
import type { ClientFellowship } from '../../api/types';
import { v4 as uuidv4 } from 'uuid';

export default function FellowshipContentScreen() {
	const { user, currentGroup } = useAuthStore();
	const {
		type,
		fellowshipId,
		setStep,
		updateFellowshipContent,
		updateFellowshipOptions,
		content,
		options,
		completeFellowship,
		hasShownRecentRecommendSheet,
		setHasShownRecentRecommendSheet,
	} = useFellowshipStore();

	const { data: fellowships } = useRecentFellowshipsWhereUserIsLeader(
		user?.id || '',
	);

	// 선택된 fellowship과 선택된 질문들을 관리하는 상태
	type FellowshipItem = NonNullable<ClientFellowship>;
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

	return (
		<>
			<VStack className="flex-1">
				<Header onPressBackButton={() => setStep('INFO')} />
				<VStack className="px-5 py-6 gap-12 flex-1">
					<HStack className="items-center justify-between">
						<Heading className="text-[24px]">나눔은 어떻게 진행할까요?</Heading>
						{/* TODO: 도움말 모달 추가하기 */}
						{/* <Pressable>
							<Icon
								as={CircleHelp}
								size="lg"
								className="color-typography-600"
							/>
						</Pressable> */}
					</HStack>
					<VStack className="gap-8">
						<Pressable onPress={() => setStep('CONTENT_ICEBREAKING')}>
							<HStack className="py-3 items-center justify-between w-full">
								<Heading size="xl">아이스 브레이킹</Heading>
								<HStack space="md" className="items-center">
									<Text size="lg" className="text-typography-600">
										{content.iceBreaking.length}개
									</Text>
									<Icon
										as={ChevronRight}
										size="lg"
										className="color-typography-600"
									/>
								</HStack>
							</HStack>
						</Pressable>
						<Pressable onPress={() => setStep('CONTENT_SERMON')}>
							<HStack className="py-3 items-center justify-between w-full">
								<Heading size="xl">설교 나눔</Heading>
								<HStack space="md" className="items-center">
									<Text size="lg" className="text-typography-600">
										{content.sermonTopic.length}개
									</Text>
									<Icon
										as={ChevronRight}
										size="lg"
										className="color-typography-600"
									/>
								</HStack>
							</HStack>
						</Pressable>

						<HStack className="items-center justify-between mt-2">
							<VStack space="xs">
								<Heading size="xl">기도 제목</Heading>
								<Text className="text-typography-600">
									소그룹원과 기도 제목을 나눠보세요
								</Text>
							</VStack>
							<Switch
								size="md"
								isDisabled={false}
								defaultValue={content.prayerRequest.isActive}
								onChange={() => {
									updateFellowshipContent({
										prayerRequest: {
											...content.prayerRequest,
											isActive: !content.prayerRequest.isActive,
										},
									});
								}}
							/>
						</HStack>
						<Divider />

						<HStack className="items-center justify-between">
							<VStack space="xs">
								<Heading size="xl">그룹원도 나눔 답변 작성</Heading>
								<Text className="text-typography-600">
									활성화하면 그룹원도 함께 나눔 답변을 작성할 수 있어요
								</Text>
							</VStack>
							<Switch
								size="md"
								isDisabled={false}
								defaultValue={options.enableMemberReply}
								onChange={() => {
									updateFellowshipOptions({
										enableMemberReply: !options.enableMemberReply,
									});
								}}
							/>
						</HStack>
					</VStack>
				</VStack>
				<HStack space="sm" className="mb-6 mx-5">
					<Button
						size="lg"
						variant="outline"
						className="flex-1"
						onPress={() => {
							setStep('INFO');
						}}
					>
						<ButtonText>이전으로</ButtonText>
					</Button>
					<Button
						size="lg"
						variant="solid"
						className="flex-1"
						onPress={async () => {
							await completeFellowship({
								type,
								groupId: currentGroup?.groupId || '',
								fellowshipId,
							});
						}}
					>
						<ButtonText>
							{type === 'CREATE' ? '생성하기' : '저장하기'}
						</ButtonText>
					</Button>
				</HStack>
			</VStack>
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
										key={fellowship.id}
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
													{fellowship.info.preachTitle || '제목 없음'}
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
									{selectedFellowship?.content.iceBreaking.length > 0 && (
										<Text size="lg" className="font-pretendard-bold">
											아이스브레이킹
										</Text>
									)}
									{selectedFellowship?.content.iceBreaking.map(
										(item: { question: string; answer?: string }) => (
											<AnimatedPressable
												key={`ice-${item.question}`}
												onPress={() => {
													setSelectedQuestions((prev) => {
														const isSelected = prev.iceBreaking.includes(
															item.question,
														);
														return {
															...prev,
															iceBreaking: isSelected
																? prev.iceBreaking.filter(
																	(q) => q !== item.question,
																)
																: [...prev.iceBreaking, item.question],
														};
													});
												}}
												className="w-full"
											>
												<HStack className="w-full justify-between items-center p-3 border border-neutral-200 rounded-lg">
													<Text className="flex-1" size="md">
														{item.question}
													</Text>
													{selectedQuestions.iceBreaking.includes(
														item.question,
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
									{selectedFellowship.content.sermonTopic.length > 0 && (
										<Text size="lg" className="font-pretendard-bold">
											설교 나눔
										</Text>
									)}
									{selectedFellowship.content.sermonTopic.map(
										(item: { question: string; answer?: string }) => (
											<AnimatedPressable
												key={`preach-${item.question}`}
												onPress={() => {
													setSelectedQuestions((prev) => {
														const isSelected = prev.sermonTopic.includes(
															item.question,
														);
														return {
															...prev,
															sermonTopic: isSelected
																? prev.sermonTopic.filter(
																	(q) => q !== item.question,
																)
																: [...prev.sermonTopic, item.question],
														};
													});
												}}
												className="w-full"
											>
												<HStack className="w-full justify-between items-center p-3 border border-neutral-200 rounded-lg">
													<Text className="flex-1" size="md">
														{item.question}
													</Text>
													{selectedQuestions.sermonTopic.includes(
														item.question,
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
												selectedFellowship.content.iceBreaking.filter(
													(item: { question: string }) =>
														selectedQuestions.iceBreaking.includes(
															item.question,
														),
												).map(({ question }) => ({ id: uuidv4(), question, answers: [] }));

											const selectedSermonTopic =
												selectedFellowship.content.sermonTopic.filter(
													(item: { question: string }) =>
														selectedQuestions.sermonTopic.includes(
															item.question,
														),
												).map(({ question }) => ({ id: uuidv4(), question, answers: [] }));

											// 현재 Fellowship 콘텐츠에 선택된 질문들 추가
											updateFellowshipContent({
												iceBreaking: [
													...content.iceBreaking,
													...selectedIceBreaking,
												],
												sermonTopic: [
													...content.sermonTopic,
													...selectedSermonTopic,
												],
											});

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
		</>
	);
}
