import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, TextInput, InteractionManager, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import DateTimePicker, {
	DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';

import { Box } from '#/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Divider } from '#/components/ui/divider';
import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Input, InputField } from '#/components/ui/input';
import { Text } from '@/shared/components/text';
import { VStack } from '#/components/ui/vstack';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import Header from '@/components/common/Header';
import { useAuthStore } from '@/store/auth';
import { useFellowshipStore } from '@/store/createFellowship';
import {
	BookOpen,
	Calendar,
	CheckIcon,
	ChevronDown,
	ChevronRight,
	Megaphone,
	Plus,
	Users,
	X,
} from 'lucide-react-native';
import { useToastStore } from '@/store/toast';
import type { ClientFellowshipParticipantV2 } from '@/features/fellowship/api/types';
import { Avatar } from '@/components/common/avatar';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';
import { useGroup } from '@/features/group/hooks/useGroup';
import { KeyboardAwareScrollView } from '@/shared/components/KeyboardAwareScrollView';
import Animated from 'react-native-reanimated';
import AnimatedPressable from '@/components/common/animated-pressable';
import { cn } from '@/shared/utils/cn';
import { isAndroid } from '@/shared/utils/platform';
import { v4 as uuidv4 } from 'uuid';
import { useExpandAnimation } from '@/shared/hooks/animation/useExpandAnimation';
import { BibleSelector } from '@/features/bible/components/BibleSelector';
import type { SelectedBible } from '@/features/bible/types/selectedBible';
import { SelectedBibleList } from '@/shared/components/bible';

export default function FellowshipInfoScreen() {
	const { user, currentGroup } = useAuthStore();
	// useGroup 훅을 사용하여 그룹 정보를 가져옵니다
	const { group, isLoading: isGroupsLoading } = useGroup(currentGroup?.groupId);

	const {
		BottomSheetContainer: CreateBottomSheetContainer,
		handleOpen: handleOpenCreate,
		handleClose: handleCloseCreate,
	} = useBottomSheet();

	const {
		BottomSheetContainer: DateBottomSheetContainer,
		handleOpen: handleOpenDate,
		handleClose: handleCloseDate,
	} = useBottomSheet();

	const { showInfo } = useToastStore();

	const titleRef = useRef<TextInput>(null);
	const preachTextRef = useRef<TextInput>(null);
	const preacherRef = useRef<TextInput>(null);

	const {
		info,
		setStep,
		updateFellowshipInfo,
		updateFellowshipRoles,
		clearFellowship,
		isFirstRender,
		setIsFirstRender,
	} = useFellowshipStore();
	const [selectedDate, setSelectedDate] = useState(info.date || new Date());
	const [title, setTitle] = useState(info.title || '');

	const {
		toggle: togglePreachText,
		isExpanded: preachTextExpanded,
		containerStyle: preachTextContainerStyle,
		iconStyle: preachTextIconStyle,
		onContentLayout: onPreachTextContentLayout,
	} = useExpandAnimation();
	const {
		toggle: togglePreacher,
		isExpanded: preacherExpanded,
		containerStyle: preacherContainerStyle,
		iconStyle: preacherIconStyle,
		onContentLayout: onPreacherContentLayout,
	} = useExpandAnimation();
	const {
		toggle: toggleMembers,
		isExpanded: membersExpanded,
		containerStyle: membersContainerStyle,
		iconStyle: membersIconStyle,
	} = useExpandAnimation({
		expandedHeight: 360,
		onToggle: () => {
			Keyboard.isVisible() && Keyboard.dismiss();
		},
	});

	// const [preachText, setPreachText] = useState<string>(info.preachText || '');
	const [preachText, setPreachText] = useState<string | SelectedBible[]>(
		info.preachText || [],
	);
	const [preacher, setPreacher] = useState<string>(info.preacher || '');
	const [participants, setParticipants] = useState<
		ClientFellowshipParticipantV2[]
	>(
		info.participants.length === 0
			? [
					{
						id: user?.id || '1',
						displayName: user?.displayName || '',
						photoUrl: user?.photoUrl || '',
						isGuest: false,
					},
				]
			: info.participants,
	);
	const [memberNameInput, setMemberNameInput] = useState('');

	const handleOpenCreateMemberButton = () => {
		handleOpenCreate();
		setTimeout(() => {
			addMemberInputRef.current?.focus();
		}, 100);
	};

	const handlePressOpenDate = () => {
		if (Keyboard.isVisible()) {
			Keyboard.dismiss();
		}
		if (isAndroid) {
			DateTimePickerAndroid.dismiss('date');
			DateTimePickerAndroid.open({
				mode: 'date',
				value: selectedDate,
				onChange: (event, date) => {
					if (event.type === 'set') {
						setSelectedDate(date ?? new Date());
					}
				},
			});
			return;
		}
		handleOpenDate();
	};

	// 그룹 멤버를 선택하거나 선택 해제하는 함수
	const toggleSelectGroupMember = (member: ClientFellowshipParticipantV2) => {
		// 멤버가 이미 선택되어 있는지 확인
		const isAlreadySelected = participants.some((m) => m.id === member.id);

		if (isAlreadySelected) {
			// 이미 선택된 멤버라면 제거 (리더는 제거 불가)
			if (member.id !== user?.id) {
				setParticipants((prev) => prev.filter((m) => m.id !== member.id));
			}
		} else {
			// 선택되지 않은 멤버라면 추가
			setParticipants((prev) => [...prev, member]);
		}
	};

	// 직접 입력한 이름으로 멤버 추가
	const handleAddMemberByName = () => {
		if (!memberNameInput.trim()) return;

		// 새로운 멤버 생성
		const newMember: ClientFellowshipParticipantV2 = {
			id: uuidv4(),
			displayName: memberNameInput.trim(),
			isGuest: true,
		};

		// 선택된 멤버로 추가 (리스트에 표시되도록)
		setParticipants((prev) => [...prev, newMember]);

		setMemberNameInput('');

		handleCloseCreate();

		// 다음 렌더링 사이클에서 ScrollView를 맨 아래로 스크롤
		setTimeout(() => {
			membersScrollViewRef.current?.scrollToEnd({ animated: true });
		}, 100);
	};

	// 그룹 멤버 리스트
	const allFellowshipMembers = useMemo<ClientFellowshipParticipantV2[]>(() => {
		if (!group || !group.members) return [];

		const groupMembers = group.members
			.sort((a, b) => {
				if (a.id === user?.id) return -1;
				if (b.id === user?.id) return 1;
				return 0;
			})
			.map((member) =>
				Object.assign(
					{
						id: member.id,
						isGuest: false,
					},
					member.displayName ? { displayName: member.displayName } : {},
					member.photoUrl ? { photoUrl: member.photoUrl } : {},
				),
			);

		const customMembers = participants.filter((member) => member.isGuest);

		return [...groupMembers, ...customMembers];
	}, [group, user?.id, participants]);

	const addMemberInputRef = useRef<TextInput>(null);
	const membersScrollViewRef = useRef<ScrollView>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (isFirstRender) {
			// 화면이 렌더링되고 애니메이션이 완료된 후 포커스 설정
			const timer = setTimeout(() => {
				setIsFirstRender(false);
				// 화면 렌더링 후 포커스 설정
				InteractionManager.runAfterInteractions(() => {
					// 키보드 애니메이션이 완료된 후 포커스 설정
					titleRef.current?.focus();
				});
			}, 600); // 충분한 지연 시간 설정

			return () => clearTimeout(timer);
		}
	}, [isFirstRender]);

	const {
		BottomSheetContainer: BibleSelectorBottomSheetContainer,
		handleOpen: handleOpenBibleSelector,
		handleClose: handleCloseBibleSelector,
	} = useBottomSheet();

	return (
		<KeyboardDismissView style={{ flex: 1 }}>
			<VStack className="flex-1">
				<Header onPressBackButtonWithRouter={() => clearFellowship()} />
				<KeyboardAwareScrollView
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<VStack className="px-5 pt-4 pb-20 flex-1">
						<VStack space="xl">
							<TextInput
								ref={titleRef}
								placeholder="나눔 또는 설교 제목을 입력해주세요."
								value={title}
								onChangeText={(value) => setTitle(value)}
								returnKeyType="next"
								onSubmitEditing={() => {
									if (!preachTextExpanded) {
										togglePreachText();
									}
									setTimeout(() => {
										preachTextRef.current?.focus();
									}, 100);
								}}
								className="mb-4 text-2xl text-typography-700 placeholder:text-typography-400 font-pretendard-semi-bold py-3"
							/>
							<AnimatedPressable scale={0.98} onPress={handlePressOpenDate}>
								<HStack className="items-center justify-between">
									<HStack space="md" className="items-center">
										<Icon
											as={Calendar}
											size="xl"
											className="text-primary-500"
										/>
										<Text
											size="xl"
											weight="medium"
											className="text-typography-700"
										>
											나눔 날짜
										</Text>
									</HStack>
									<HStack space="md" className="items-center">
										<Text
											size="xl"
											weight="medium"
											className="text-typography-700"
										>
											{selectedDate.toLocaleDateString('ko-KR', {
												month: 'long',
												day: 'numeric',
												weekday: 'long',
											})}
										</Text>
										<Icon
											as={ChevronRight}
											size="md"
											className="text-typography-500"
										/>
									</HStack>
								</HStack>
							</AnimatedPressable>
							<Divider className="bg-background-100" />
							<VStack>
								<AnimatedPressable
									scale={0.98}
									onPress={() => {
										if (!preachTextExpanded && preachText.length === 0) {
											Keyboard.dismiss();
											handleOpenBibleSelector();
										}
										togglePreachText();
									}}
								>
									<HStack className="items-center justify-between w-full">
										<HStack space="md" className="items-center">
											<Icon
												as={BookOpen}
												size="xl"
												className="text-primary-500"
											/>
											<Text
												size="xl"
												weight="medium"
												className="text-typography-700"
											>
												설교 본문
											</Text>
										</HStack>
										<HStack space="md" className="items-center justify-end">
											<Text
												size="xl"
												weight="medium"
												className="text-typography-700 w-2/3 text-right"
												numberOfLines={1}
											>
												{typeof preachText === 'string'
													? preachText
													: preachText.length === 0
														? '없음'
														: preachText.length === 1
															? preachText[0].title
															: `${preachText.length}개`}
											</Text>
											<Animated.View style={[preachTextIconStyle]}>
												<Icon
													as={ChevronDown}
													size="md"
													className="text-typography-500"
												/>
											</Animated.View>
										</HStack>
									</HStack>
								</AnimatedPressable>
								<Animated.View style={[preachTextContainerStyle]}>
									<VStack
										space="md"
										className="pt-6"
										onLayout={onPreachTextContentLayout}
									>
										<SelectedBibleList
											selectedBible={
												typeof preachText === 'string' ? [] : preachText
											}
											setSelectedBible={setPreachText}
											handleOpenBibleSelector={handleOpenBibleSelector}
										/>
									</VStack>
								</Animated.View>
							</VStack>
							<Divider className="bg-background-100" />
							<VStack>
								<AnimatedPressable
									scale={0.98}
									onPress={() => {
										togglePreacher(preacherRef);
									}}
								>
									<HStack className="items-center justify-between">
										<HStack space="md" className="items-center">
											<Icon
												as={Megaphone}
												size="xl"
												className="text-primary-500"
											/>
											<Text
												size="xl"
												weight="medium"
												className="text-typography-700"
											>
												설교자
											</Text>
										</HStack>
										<HStack space="md" className="items-center">
											<Text
												size="xl"
												weight="medium"
												className="text-typography-700"
											>
												{preacher || '없음'}
											</Text>
											<Animated.View style={[preacherIconStyle]}>
												<Icon
													as={ChevronDown}
													size="md"
													className="text-typography-500"
												/>
											</Animated.View>
										</HStack>
									</HStack>
								</AnimatedPressable>
								<Animated.View style={[preacherContainerStyle]}>
									<VStack
										space="sm"
										className="pt-6"
										onLayout={onPreacherContentLayout}
									>
										<Input variant="outline" size="xl" className="rounded-xl">
											<InputField
												ref={preacherRef}
												placeholder="설교자를 입력해주세요."
												value={preacher}
												onChangeText={setPreacher}
												returnKeyType="next"
												onSubmitEditing={() => {
													if (!membersExpanded) {
														toggleMembers();
													}
												}}
												className="font-pretendard-Regular"
											/>
										</Input>
									</VStack>
								</Animated.View>
							</VStack>
							<Divider className="bg-background-100" />
							<VStack>
								<AnimatedPressable
									scale={0.98}
									onPress={() => {
										toggleMembers();
									}}
								>
									<HStack className="items-center justify-between">
										<HStack space="md" className="items-center">
											<Icon as={Users} size="xl" className="text-primary-500" />
											<Text
												size="xl"
												weight="medium"
												className="text-typography-700"
											>
												나눔 인원
											</Text>
										</HStack>
										<HStack space="md" className="items-center">
											<Text
												size="xl"
												weight="medium"
												className="text-typography-700"
											>
												{participants.length > 0
													? `${participants.length}명`
													: '0명'}
											</Text>
											<Animated.View style={[membersIconStyle]}>
												<Icon
													as={ChevronDown}
													size="md"
													className="text-typography-500"
												/>
											</Animated.View>
										</HStack>
									</HStack>
								</AnimatedPressable>
								<Animated.View style={[membersContainerStyle]}>
									<VStack space="sm" className="mt-6">
										{/* 멤버 선택 리스트 */}
										<VStack>
											{isGroupsLoading ? (
												<VStack className="items-center justify-center py-4">
													<Text>그룹 멤버를 불러오는 중...</Text>
												</VStack>
											) : allFellowshipMembers.length === 0 ? (
												<VStack className="items-center justify-center py-4">
													<Icon
														as={Users}
														size="xl"
														className="mb-2 text-typography-400"
													/>
													<Text className="text-typography-500">
														그룹 멤버가 없어요
													</Text>
												</VStack>
											) : (
												<ScrollView
													ref={membersScrollViewRef}
													className="pb-4 max-h-72"
												>
													{allFellowshipMembers.map((member) => {
														const isSelected = participants.some(
															(m) => m.id === member.id,
														);
														const isMe = member.id === user?.id;
														return (
															<VStack key={member.id}>
																<AnimatedPressable
																	scale={isMe ? 1 : 0.98}
																	onPress={() =>
																		!isMe
																			? toggleSelectGroupMember(member)
																			: null
																	}
																	className="py-4"
																>
																	<HStack className="items-center justify-between">
																		<HStack space="sm" className="items-center">
																			<Avatar
																				size="sm"
																				photoUrl={member.photoUrl || undefined}
																			/>
																			<Text size="md">
																				{member.displayName}
																			</Text>
																		</HStack>
																		{isSelected ? (
																			<View
																				pointerEvents="none"
																				className={cn(
																					'bg-primary-500 rounded-full p-1 w-6 h-6 mr-2',
																					isMe && 'bg-background-400',
																				)}
																			>
																				<Icon
																					as={CheckIcon}
																					size="sm"
																					color="white"
																				/>
																			</View>
																		) : (
																			<View
																				pointerEvents="none"
																				className="border border-primary-500 rounded-full p-1 w-6 h-6 mr-2"
																			/>
																		)}
																	</HStack>
																</AnimatedPressable>
																{member.id !==
																	allFellowshipMembers[
																		allFellowshipMembers.length - 1
																	].id && <Divider />}
															</VStack>
														);
													})}
												</ScrollView>
											)}
										</VStack>
										{/* 이름으로 추가하기 버튼 */}
										<Button
											variant="outline"
											size="md"
											onPress={handleOpenCreateMemberButton}
										>
											<HStack space="sm" className="items-center">
												<ButtonText className="text-primary-500">
													이름으로 추가하기
												</ButtonText>
												<Icon
													as={Plus}
													size="md"
													className="text-primary-500"
												/>
											</HStack>
										</Button>
									</VStack>
								</Animated.View>
							</VStack>
						</VStack>
					</VStack>
				</KeyboardAwareScrollView>
				<Button
					size="lg"
					variant="solid"
					className="mb-6 mx-5"
					onPress={() => {
						if (!title) {
							showInfo('나눔 제목을 입력해주세요');

							// 첫 번째 비어있는 필드에 포커스 이동
							if (!title) {
								titleRef.current?.focus();
								return;
							}
							return;
						}
						updateFellowshipRoles({
							leaderId: user?.id || '',
						});
						updateFellowshipInfo({
							date: selectedDate,
							title,
							preachText,
							preacher,
							participants,
						});
						setStep('CONTENT');
					}}
				>
					<ButtonText>다음</ButtonText>
				</Button>
			</VStack>
			<CreateBottomSheetContainer>
				<VStack className="px-5 py-6 gap-6">
					<VStack space="2xl">
						<Heading size="2xl">이름으로 추가하기</Heading>
						<BottomSheetTextInput
							placeholder="이름을 입력해주세요"
							defaultValue={memberNameInput}
							onChangeText={setMemberNameInput}
							className={TEXT_INPUT_STYLE}
							// @ts-ignore
							ref={addMemberInputRef}
						/>
						<Button
							size="lg"
							action="primary"
							onPress={handleAddMemberByName}
							disabled={memberNameInput.trim() === ''}
							animation={true}
						>
							<ButtonText>추가하기</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</CreateBottomSheetContainer>
			<DateBottomSheetContainer snapPoints={['50%']}>
				<Box className="items-center justify-center pt-4 pb-10">
					<DateTimePicker
						value={selectedDate}
						mode="date"
						display="inline"
						locale="ko"
						onChange={(event, date) => {
							if (date) {
								setSelectedDate(date);
								handleCloseDate();
							}
						}}
					/>
				</Box>
			</DateBottomSheetContainer>
			<BibleSelector
				BibleSelectorBottomSheetContainer={BibleSelectorBottomSheetContainer}
				closeSelector={handleCloseBibleSelector}
				mode="select"
				setSelectedBible={(selectedBible) => {
					setPreachText((prev) => {
						if (typeof prev === 'string') {
							return [selectedBible];
						}
						return [...prev, selectedBible];
					});
				}}
			/>
		</KeyboardDismissView>
	);
}
