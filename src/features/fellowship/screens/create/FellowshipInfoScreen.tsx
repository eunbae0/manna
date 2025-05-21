import { useMemo, useRef, useState } from 'react';
import { Keyboard, TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { Box } from '#/components/ui/box';
import { Button, ButtonText } from '@/components/common/button';
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
} from 'lucide-react-native';
import { useToastStore } from '@/store/toast';
import type {
	ClientFellowshipMember,
} from '@/features/fellowship/api/types';
import { Avatar } from '@/components/common/avatar';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';
import { useGroup } from '@/features/home/group/hooks/useGroup';
import { KeyboardAwareScrollView } from '@/shared/components/KeyboardAwareScrollView';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import AnimatedPressable from '@/components/common/animated-pressable';
import { cn } from '@/shared/utils/cn';
import { isAndroid } from '@/shared/utils/platform';

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

	const preachTitleRef = useRef<TextInput>(null);
	const preachTextRef = useRef<TextInput>(null);
	const preacherRef = useRef<TextInput>(null);

	const { info, setStep, updateFellowshipInfo, clearFellowship } =
		useFellowshipStore();
	const [selectedDate, setSelectedDate] = useState(info.date || new Date());
	const [preachTitle, setPreachTitle] = useState(info.preachTitle || '');
	const [preachTextExpanded, setPreachTextExpanded] = useState(false);
	const [preacherExpanded, setPreacherExpanded] = useState(false);
	const [membersExpanded, setMembersExpanded] = useState(false);

	// 애니메이션 값
	const preachTextHeight = useSharedValue(0);
	const preachTextRotate = useSharedValue(0);
	const preacherHeight = useSharedValue(0);
	const preacherRotate = useSharedValue(0);
	const membersHeight = useSharedValue(0);
	const membersRotate = useSharedValue(0);

	// 애니메이션 스타일
	const preachTextContainerStyle = useAnimatedStyle(() => {
		return {
			height: preachTextHeight.value,
			overflow: 'hidden',
		};
	});

	const preachTextIconStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					rotate: `${preachTextRotate.value * 180}deg`,
				},
			],
		};
	});

	const preacherContainerStyle = useAnimatedStyle(() => {
		return {
			height: preacherHeight.value,
			overflow: 'hidden',
		};
	});

	const preacherIconStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					rotate: `${preacherRotate.value * 180}deg`,
				},
			],
		};
	});

	const membersContainerStyle = useAnimatedStyle(() => {
		return {
			height: membersHeight.value,
			overflow: 'hidden',
		};
	});

	const membersIconStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					rotate: `${membersRotate.value * 180}deg`,
				},
			],
		};
	});

	const [preachText, setPreachText] = useState<string>(info.preachText?.value || '');
	const [preacher, setPreacher] = useState<string>(info.preacher?.value || '');
	const [members, setMembers] = useState<ClientFellowshipMember[]>(
		info.members.length === 0
			? [
				{
					id: user?.id || '1',
					displayName: user?.displayName || '',
					photoUrl: user?.photoUrl || '',
					isLeader: true,
					isGuest: false,
				},
			]
			: info.members,
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
	const toggleSelectGroupMember = (member: ClientFellowshipMember) => {
		// 멤버가 이미 선택되어 있는지 확인
		const isAlreadySelected = members.some((m) => m.id === member.id);

		if (isAlreadySelected) {
			// 이미 선택된 멤버라면 제거 (리더는 제거 불가)
			if (!member.isLeader) {
				setMembers((prev) => prev.filter((m) => m.id !== member.id));
			}
		} else {
			// 선택되지 않은 멤버라면 추가
			setMembers((prev) => [...prev, member]);
		}
	};

	// 직접 입력한 이름으로 멤버 추가
	const handleAddMemberByName = () => {
		if (!memberNameInput.trim()) return;

		// 새로운 멤버 생성
		const newMember: ClientFellowshipMember = {
			id: `custom-${Date.now()}`,
			displayName: memberNameInput.trim(),
			isLeader: false,
			isGuest: true,
		};

		// 선택된 멤버로 추가 (리스트에 표시되도록)
		setMembers((prev) => [...prev, newMember]);

		setMemberNameInput('');

		handleCloseCreate();

		// 다음 렌더링 사이클에서 ScrollView를 맨 아래로 스크롤
		setTimeout(() => {
			membersScrollViewRef.current?.scrollToEnd({ animated: true });
		}, 100);
	};

	// 그룹 멤버 리스트
	const allFellowshipMembers = useMemo<ClientFellowshipMember[]>(() => {
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
						isLeader: false,
						isGuest: false,
					},
					member.displayName ? { displayName: member.displayName } : {},
					member.photoUrl ? { photoUrl: member.photoUrl } : {},
				),
			);

		const customMembers = members.filter(
			(member) => member.id.startsWith('custom-'),
		);

		return [...groupMembers, ...customMembers];
	}, [group, user?.id, members]);

	const addMemberInputRef = useRef<TextInput>(null);
	const membersScrollViewRef = useRef<ScrollView>(null);

	return (
		<KeyboardDismissView style={{ flex: 1 }}>
			<VStack className="flex-1">
				<Header onPressBackButtonWithRouter={() => clearFellowship()} />
				<KeyboardAwareScrollView>
					<VStack className="px-5 py-4 flex-1">
						<VStack space="xl">
							<TextInput
								ref={preachTitleRef}
								placeholder="나눔 또는 설교 제목을 입력해주세요."
								value={preachTitle}
								onChangeText={(value) => setPreachTitle(value)}
								autoFocus
								returnKeyType="next"
								onSubmitEditing={() => {
									if (!preachTextExpanded) {
										setPreachTextExpanded(true);
										preachTextHeight.value = withTiming(74, { duration: 200 });
										preachTextRotate.value = withTiming(1, { duration: 200 });
									}
									setTimeout(() => {
										preachTextRef.current?.focus();
									}, 100);
								}}
								className="mb-4 text-2xl text-typography-700 placeholder:text-typography-400 font-pretendard-semi-bold py-3"
							/>
							<AnimatedPressable
								scale={0.98}
								onPress={handlePressOpenDate}
							>
								<HStack className="items-center justify-between">
									<HStack space="md" className="items-center">
										<Icon
											as={Calendar}
											size="lg"
											className="text-primary-500"
										/>
										<Text size="lg" weight="medium" className="text-typography-700">
											나눔 날짜
										</Text>
									</HStack>
									<HStack space="md" className="items-center">
										<Text size="lg" weight="medium" className="text-typography-700">
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
										setPreachTextExpanded(!preachTextExpanded);
										preachTextRef.current?.focus();
										// 애니메이션 실행
										if (preachTextExpanded) {
											// 닫힐 때
											preachTextHeight.value = withTiming(0, { duration: 200 });
											preachTextRotate.value = withTiming(0, { duration: 200 });
										} else {
											// 열릴 때
											preachTextHeight.value = withTiming(74, { duration: 200 });
											preachTextRotate.value = withTiming(1, { duration: 200 });
										}
									}}
								>
									<HStack className="items-center justify-between">
										<HStack space="md" className="items-center">
											<Icon
												as={BookOpen}
												size="lg"
												className="text-primary-500"
											/>
											<Text size="lg" weight="medium" className="text-typography-700">
												설교 본문
											</Text>
										</HStack>
										<HStack space="md" className="items-center">
											<Text size="lg" weight="medium" className="text-typography-700">
												{preachText || '없음'}
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
									<VStack space="sm" className="mt-6">
										<Input
											variant="outline"
											size="xl"
											className="rounded-xl"
										>
											<InputField
												ref={preachTextRef}
												placeholder="ex. 창세기 1장 1~7절"
												value={preachText}
												onChangeText={setPreachText}
												returnKeyType="next"
												onSubmitEditing={() => {
													if (!preacherExpanded) {
														setPreacherExpanded(true);
														preacherHeight.value = withTiming(74, { duration: 200 });
														preacherRotate.value = withTiming(1, { duration: 200 });
													}
													setTimeout(() => {
														preacherRef.current?.focus();
													}, 100);
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
										setPreacherExpanded(!preacherExpanded);
										preacherRef.current?.focus();
										// 애니메이션 실행
										if (preacherExpanded) {
											// 닫힐 때
											preacherHeight.value = withTiming(0, { duration: 200 });
											preacherRotate.value = withTiming(0, { duration: 200 });
										} else {
											// 열릴 때
											preacherHeight.value = withTiming(74, { duration: 200 });
											preacherRotate.value = withTiming(1, { duration: 200 });
										}
									}}
								>
									<HStack className="items-center justify-between">
										<HStack space="md" className="items-center">
											<Icon
												as={Megaphone}
												size="lg"
												className="text-primary-500"
											/>
											<Text size="lg" weight="medium" className="text-typography-700">
												설교자
											</Text>
										</HStack>
										<HStack space="md" className="items-center">
											<Text size="lg" weight="medium" className="text-typography-700">
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
									<VStack space="sm" className="mt-6">
										<Input
											variant="outline"
											size="xl"
											className="rounded-xl"
										>
											<InputField
												ref={preacherRef}
												placeholder="설교자를 입력해주세요."
												value={preacher}
												onChangeText={setPreacher}
												returnKeyType="next"
												onSubmitEditing={() => {
													if (!membersExpanded) {
														setMembersExpanded(true);
														membersHeight.value = withTiming(400, { duration: 200 });
														membersRotate.value = withTiming(1, { duration: 200 });
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
										setMembersExpanded(!membersExpanded);
										// 애니메이션 실행
										if (membersExpanded) {
											// 닫힐 때
											membersHeight.value = withTiming(0, { duration: 200 });
											membersRotate.value = withTiming(0, { duration: 200 });
										} else {
											// 열릴 때
											membersHeight.value = withTiming(400, { duration: 200 });
											membersRotate.value = withTiming(1, { duration: 200 });
										}
									}}
								>
									<HStack className="items-center justify-between">
										<HStack space="md" className="items-center">
											<Icon
												as={Users}
												size="lg"
												className="text-primary-500"
											/>
											<Text size="lg" weight="medium" className="text-typography-700">
												나눔 인원
											</Text>
										</HStack>
										<HStack space="md" className="items-center">
											<Text size="lg" weight="medium" className="text-typography-700">
												{members.length > 0 ? `${members.length}명` : '0명'}
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
									<VStack space="sm" className="mt-2">
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
												<ScrollView ref={membersScrollViewRef} className="py-3 max-h-72">
													{allFellowshipMembers.map((member) => {
														const isSelected = members.some((m) => m.id === member.id);
														const isMe = member.id === user?.id;
														return (
															<VStack key={member.id}>
																<AnimatedPressable
																	scale={isMe ? 1 : 0.98}
																	onPress={() => !isMe && toggleSelectGroupMember(member)}
																	className="py-4"
																>
																	<HStack className="items-center justify-between">
																		<HStack space="sm" className="items-center">
																			<Avatar
																				size="sm"
																				photoUrl={member.photoUrl || undefined}
																			/>
																			<Text size="md">{member.displayName}</Text>
																		</HStack>
																		{isSelected ? (
																			<Box className={cn("bg-primary-500 rounded-full p-1 w-6 h-6 mr-2", isMe && "bg-background-400")}>
																				<Icon
																					as={CheckIcon}
																					size="sm"
																					color="white"
																				/>
																			</Box>
																		) : (
																			<Box className="border border-primary-500 rounded-full p-1 w-6 h-6 mr-2" />
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
												<ButtonText className="text-primary-500">이름으로 추가하기</ButtonText>
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
						if (!preachTitle) {
							showInfo('나눔 제목을 입력해주세요');

							// 첫 번째 비어있는 필드에 포커스 이동
							if (!preachTitle) {
								preachTitleRef.current?.focus();
								return;
							}
							return;
						}
						updateFellowshipInfo({
							date: selectedDate,
							preachTitle,
							preachText: {
								value: preachText,
								isActive: preachText !== '',
							},
							preacher: {
								value: preacher,
								isActive: preacher !== '',
							},
							members,
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
							<ButtonText>
								추가하기
							</ButtonText>
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
		</KeyboardDismissView>
	);
}
