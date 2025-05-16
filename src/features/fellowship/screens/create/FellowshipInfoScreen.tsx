import { useMemo, useRef, useState } from 'react';
import { Pressable, type TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Box } from '#/components/ui/box';
import { Button, ButtonText, ButtonIcon } from '@/components/common/button';
import {
	Checkbox,
	CheckboxIndicator,
	CheckboxIcon,
	CheckboxLabel,
} from '#/components/ui/checkbox';
import { Divider } from '#/components/ui/divider';
import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Input, InputField } from '#/components/ui/input';
import { Text } from '#/components/ui/text';
import { VStack } from '#/components/ui/vstack';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import Header from '@/components/common/Header';
import { useAuthStore } from '@/store/auth';
import { useFellowshipStore } from '@/store/createFellowship';
import {
	CheckIcon,
	CircleHelp,
	Plus,
	Star,
	Trash,
	UserRound,
	Search,
	Users,
	Calendar,
} from 'lucide-react-native';
import { useToastStore } from '@/store/toast';
import type {
	ClientFellowshipMember,
	FellowshipInfoField,
	ServerFellowshipMember,
} from '@/features/fellowship/api/types';
import { Avatar } from '@/components/common/avatar';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';
import { useGroup } from '@/features/home/group/hooks/useGroup';
import type { GroupMember } from '@/api/group/types';
import { KeyboardToolbar } from '@/shared/components/KeyboardToolbar';
import { KeyboardAwareScrollView } from '@/shared/components/KeyboardAwareScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';

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
		BottomSheetContainer: MemberBottomSheetContainer,
		handleOpen: handleOpenMember,
		handleClose: handleCloseMember,
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
	const [preachText, setPreachText] = useState<FellowshipInfoField>({
		value: info.preachText?.value || '',
		isActive:
			info.preachText?.isActive === undefined
				? true
				: info.preachText?.isActive,
	});
	const [preacher, setPreacher] = useState<FellowshipInfoField>({
		value: info.preacher?.value || '',
		isActive:
			info.preacher?.isActive === undefined ? true : info.preacher?.isActive,
	});
	const [selectedMember, setSelectedMember] =
		useState<ClientFellowshipMember | null>(null);
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
	// 선택된 그룹 멤버를 저장하는 상태
	const [selectedGroupMembers, setSelectedGroupMembers] = useState<
		ClientFellowshipMember[]
	>([]);
	const handleCloseMemberSheet = () => {
		setSelectedMember(null);
		handleCloseMember();
	};

	const handleOpenCreateMemberButton = () => {
		// 그룹 멤버 선택 바텀시트를 엽니다
		handleOpenCreate();
	};

	// 그룹 멤버를 선택하거나 선택 해제하는 함수
	const toggleSelectGroupMember = (member: ClientFellowshipMember) => {
		setSelectedGroupMembers((prev) => {
			// 이미 선택된 멤버인지 확인
			const isAlreadySelected = prev.some((m) => m.id === member.id);

			if (isAlreadySelected) {
				// 이미 선택된 멤버라면 제거
				return prev.filter((m) => m.id !== member.id);
			}

			// 선택되지 않은 멤버라면 추가
			return [...prev, member];
		});
	};

	// 선택된 그룹 멤버를 나눔 인원으로 추가하는 함수
	const handlePressAddMember = () => {
		// 선택된 그룹 멤버들을 나눔 인원으로 추가
		const newMembers = selectedGroupMembers;

		setMembers((prev) => {
			// 중복 멤버 제거를 위해 ID 기준으로 필터링
			const existingMemberIds = prev.map((m) => m.id);
			const filteredNewMembers = newMembers.filter(
				(m) => !existingMemberIds.includes(m.id),
			);

			return [...prev, ...filteredNewMembers];
		});

		// 선택된 멤버 초기화 및 모달 닫기
		handleCloseCreate();
		setSelectedGroupMembers([]);
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
		setSelectedGroupMembers((prev) => [...prev, newMember]);

		setMemberNameInput('');

		// 다음 렌더링 사이클에서 ScrollView를 맨 아래로 스크롤
		setTimeout(() => {
			membersScrollViewRef.current?.scrollToEnd({ animated: true });
		}, 100);
	};

	// 그룹 멤버 리스트
	const allFellowshipMembers = useMemo<ClientFellowshipMember[]>(() => {
		if (!group || !group.members) return [];

		// 이미 추가된 멤버 ID 목록
		const existingMemberIds = members.map((m) => m.id);

		// 이미 추가된 멤버를 제외한 그룹 멤버 목록
		const groupMembers = group.members
			.filter((member) => !existingMemberIds.includes(member.id))
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

		// 사용자가 직접 추가한 커스텀 멤버들은 selectedGroupMembers에 있지만 아직 members에는 없음
		const customMembers = selectedGroupMembers.filter(
			(member) =>
				member.id.startsWith('custom-') &&
				!existingMemberIds.includes(member.id),
		);

		return [...groupMembers, ...customMembers];
	}, [group, members, selectedGroupMembers]);

	const addMemberInputRef = useRef<TextInput>(null);
	const membersScrollViewRef = useRef<ScrollView>(null);

	return (
		<>
			<SafeAreaView className="h-full">
				<KeyboardDismissView>
					<VStack className="flex-1">
						<Header onPressBackButtonWithRouter={() => clearFellowship()} />
						<KeyboardAwareScrollView>
							<VStack className="px-5 py-6 gap-10 flex-1">
								<HStack className="items-center justify-between">
									<Heading className="text-[24px]">
										나눔 정보를 입력해주세요
									</Heading>
									{/* <Pressable>
									<Icon
										as={CircleHelp}
										size="lg"
										className="color-typography-600"
									/>
								</Pressable> */}
								</HStack>
								<VStack space="4xl" className="">
									<VStack space="sm">
										<HStack className="items-center justify-between">
											<Text size="md" className="font-pretendard-semi-bold">
												제목
											</Text>
										</HStack>
										<Input variant="outline" size="xl" className="rounded-xl">
											<InputField
												ref={preachTitleRef}
												placeholder="제목 또는 설교 제목을 입력해주세요."
												value={preachTitle}
												onChangeText={(value) => setPreachTitle(value)}
												className="font-pretendard-Regular"
											/>
										</Input>
									</VStack>
									<VStack space="sm">
										<HStack className="items-center justify-between">
											<Text size="md" className="font-pretendard-semi-bold">
												나눔 날짜
											</Text>
										</HStack>
										<Pressable
											onPress={() => {
												handleOpenDate();
											}}
										>
											<HStack className="w-full rounded-xl border-[1px] border-typography-300 px-3 py-3 items-center justify-between">
												<Text size="xl" className="text-typography-700">
													{selectedDate.toLocaleDateString('ko-KR', {
														year: 'numeric',
														month: 'long',
														day: 'numeric',
														weekday: 'long',
													})}
												</Text>
												<Icon
													as={Calendar}
													size="lg"
													className="stroke-primary-500"
												/>
											</HStack>
										</Pressable>
									</VStack>

									<VStack space="sm">
										<HStack className="items-center justify-between">
											<Text size="md" className="font-pretendard-semi-bold">
												설교 본문
											</Text>
											<Checkbox
												size="sm"
												value={'설교 본문'}
												onChange={() => {
													setPreachText({
														...preachText,
														isActive: !preachText.isActive,
													});
													trackAmplitudeEvent('나눔 정보 Checkbox 클릭', {
														screen: 'Fellowship_Create',
														infoEnabled: !preachText.isActive,
														infoType: '설교 본문',
													});
												}}
												isChecked={!preachText.isActive}
											>
												<CheckboxIndicator>
													<CheckboxIcon as={CheckIcon} />
												</CheckboxIndicator>
												<CheckboxLabel className="font-pretendard-Regular">
													본문이 없어요
												</CheckboxLabel>
											</Checkbox>
										</HStack>
										<Input
											variant="outline"
											size="xl"
											className="rounded-xl"
											isDisabled={!preachText.isActive}
										>
											<InputField
												ref={preachTextRef}
												placeholder="ex. 창세기 1장 1~7절"
												value={preachText.value}
												onChangeText={(value) =>
													setPreachText({ ...preachText, value })
												}
												className="font-pretendard-Regular"
											/>
										</Input>
									</VStack>
									<VStack space="sm">
										<HStack className="items-center justify-between">
											<Text size="md" className="font-pretendard-semi-bold">
												설교자
											</Text>
											<Checkbox
												size="sm"
												value={'설교자'}
												onChange={() => {
													setPreacher({
														...preacher,
														isActive: !preacher.isActive,
													});
													trackAmplitudeEvent('나눔 정보 Checkbox 클릭', {
														screen: 'Fellowship_Create',
														infoEnabled: !preachText.isActive,
														infoType: '설교자',
													});
												}}
												isChecked={!preacher.isActive}
											>
												<CheckboxIndicator>
													<CheckboxIcon as={CheckIcon} />
												</CheckboxIndicator>
												<CheckboxLabel className="font-pretendard-Regular">
													설교자가 없어요
												</CheckboxLabel>
											</Checkbox>
										</HStack>
										<Input
											variant="outline"
											size="xl"
											className="rounded-xl"
											isDisabled={!preacher.isActive}
										>
											<InputField
												ref={preacherRef}
												placeholder="설교자를 입력해주세요."
												value={preacher.value}
												onChangeText={(value) =>
													setPreacher({ ...preacher, value })
												}
												className="font-pretendard-Regular"
											/>
										</Input>
									</VStack>
									<VStack space="lg">
										<HStack className="items-center justify-between">
											<Text size="md" className="font-pretendard-semi-bold">
												나눔 인원
											</Text>
										</HStack>
										<ScrollView
											horizontal
											className="pl-2"
										>
											<HStack space="md" className="items-start">
												{members.map((member) => (
													<Pressable
														key={member.id}
														onPress={() => {
															setSelectedMember(member);
															handleOpenMember();
														}}
													>
														<Avatar
															size="lg"
															type={member.isLeader ? 'leader' : 'member'}
															label={member.displayName || ''}
															photoUrl={member.photoUrl || ''}
														/>
													</Pressable>
												))}
												<Pressable
													onPress={handleOpenCreateMemberButton}
													className="p-3 border-[1px] border-primary-300 rounded-full"
												>
													<Icon
														as={Plus}
														size="lg"
														className="color-primary-700"
													/>
												</Pressable>
											</HStack>
										</ScrollView>
									</VStack>
								</VStack>
							</VStack>
						</KeyboardAwareScrollView>
						<Button
							size="lg"
							variant="solid"
							className="mb-6 mx-5"
							rounded
							onPress={() => {
								if (
									!preachTitle ||
									(!preachText.value && preachText.isActive) ||
									(!preacher.value && preacher.isActive)
								) {
									showInfo('나눔 정보를 모두 입력해주세요');

									// 첫 번째 비어있는 필드에 포커스 이동
									if (!preachTitle) {
										preachTitleRef.current?.focus();
										return;
									}

									if (preachText.isActive && !preachText.value) {
										preachTextRef.current?.focus();
										return;
									}

									if (preacher.isActive && !preacher.value) {
										preacherRef.current?.focus();
										return;
									}

									return;
								}
								updateFellowshipInfo({
									date: selectedDate,
									preachTitle,
									preachText,
									preacher,
									members,
								});
								setStep('CONTENT');
							}}
						>
							<ButtonText>다음</ButtonText>
						</Button>
					</VStack>

					{/* BOTTOM SHEET */}
					<MemberBottomSheetContainer>
						<VStack space="md" className="px-5 py-6">
							<HStack space="md" className="items-center">
								<Avatar size="sm" className="bg-primary-400">
									<Icon as={UserRound} size="sm" className="stroke-white" />
								</Avatar>
								<Heading size="xl">{selectedMember?.displayName}</Heading>
								{selectedMember?.isLeader && (
									<Box className="bg-primary-200 rounded-full px-3 py-1">
										<Text>인도자</Text>
									</Box>
								)}
							</HStack>
							<VStack space="sm" className="w-full py-5">
								{/* INFO: 나눔 인도자 만들기 기능 삭제 */}
								{/* <Pressable
									onPress={() => {
										setMembers((prev) =>
											prev.map((member) =>
												member.id !== selectedMember?.id
													? { ...member, isLeader: false }
													: {
															...member,
															isLeader: true,
														},
											),
										);
										handleCloseMemberSheet();
									}}
								>
									<HStack space="md" className="items-center py-2">
										<Icon
											size="xl"
											className="stroke-background-700"
											as={Star}
										/>
										<Text size="lg">나눔 인도자 만들기</Text>
									</HStack>
								</Pressable> */}
								<Divider />
								<Pressable
									onPress={() => {
										if (selectedMember?.isLeader) {
											showInfo('리더는 삭제할 수 없어요');
											return;
										}
										setMembers((prev) =>
											prev.filter((member) => member.id !== selectedMember?.id),
										);
										handleCloseMember();
									}}
								>
									<HStack space="md" className="items-center py-2">
										<Icon
											size="xl"
											className="stroke-background-700"
											as={Trash}
										/>
										<Text size="lg">삭제하기</Text>
									</HStack>
								</Pressable>
							</VStack>
						</VStack>
					</MemberBottomSheetContainer>
					<CreateBottomSheetContainer>
						<VStack className="px-5 py-6 gap-6">
							<VStack space="2xl">
								<Heading size="2xl">나눔 인원 추가하기</Heading>
								{/* 그룹 멤버 목록 */}
								<VStack className="">
									<Text size="sm" className="text-typography-600">
										그룹에서 추가
									</Text>
									<VStack className="px-2">
										{isGroupsLoading ? (
											<VStack className="items-center justify-center py-10">
												<Text>그룹 멤버를 불러오는 중...</Text>
											</VStack>
										) : allFellowshipMembers.length === 0 ? (
											<VStack className="items-center justify-center py-10">
												<Icon
													as={Users}
													size="xl"
													className="mb-2 text-typography-400"
												/>
												<Text className="text-typography-500">
													추가할 수 있는 멤버가 없어요
												</Text>
											</VStack>
										) : (
											<ScrollView ref={membersScrollViewRef} className="py-3 max-h-60">
												{allFellowshipMembers.map((item) => (
													<VStack key={item.id}>
														<Pressable
															onPress={() => toggleSelectGroupMember(item)}
															className="py-4"
														>
															<HStack className="items-center justify-between">
																<HStack space="sm" className="items-center">
																	<Avatar
																		size="sm"
																		photoUrl={item.photoUrl || undefined}
																	/>
																	<Text size="md">{item.displayName}</Text>
																</HStack>
																{selectedGroupMembers.some(
																	(m) => m.id === item.id,
																) ? (
																	<Box className="bg-primary-500 rounded-full p-1 w-6 h-6 mr-2">
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
														</Pressable>
														{item.id !==
															allFellowshipMembers[
																allFellowshipMembers.length - 1
															].id && <Divider />}
													</VStack>
												))}
											</ScrollView>
										)}
									</VStack>
								</VStack>

								{/* 직접 이름 입력 필드 */}
								<VStack space="md">
									<Text size="sm" className="text-typography-600">
										이름으로 추가
									</Text>
									<HStack space="xs" className="items-center">
										<BottomSheetTextInput
											placeholder="이름을 입력해주세요"
											defaultValue={memberNameInput}
											onChangeText={setMemberNameInput}
											className={`flex-1 ${TEXT_INPUT_STYLE}`}
											// @ts-ignore
											ref={addMemberInputRef}
										/>
										<Button
											size="lg"
											variant="icon"
											onPress={handleAddMemberByName}
											disabled={!memberNameInput.trim()}
											animation={true}
										>
											<ButtonIcon as={Plus} size="md" />
										</Button>
									</HStack>
								</VStack>

								{/* 추가 버튼 */}
								<Button
									size="lg"
									rounded
									action="primary"
									onPress={handlePressAddMember}
									disabled={selectedGroupMembers.length === 0}
									animation={true}
								>
									<ButtonText>
										{selectedGroupMembers.length > 0
											? `${selectedGroupMembers.length}명 추가하기`
											: '확인'}
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
			</SafeAreaView>
			<KeyboardToolbar />
		</>
	);
}
