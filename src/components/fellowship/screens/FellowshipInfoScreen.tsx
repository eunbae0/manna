import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Avatar, AvatarBadge } from '#/components/ui/avatar';
import { Box } from '#/components/ui/box';
import { Button, ButtonText } from '#/components/ui/button';
import {
	Checkbox,
	CheckboxIndicator,
	CheckboxIcon,
	CheckboxLabel,
} from '#/components/ui/checkbox';
import { Divider } from '#/components/ui/divider';
import { Heading } from '#/components/ui/heading';
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
} from 'lucide-react-native';
import { useToastStore } from '@/store/toast';
import type {
	FellowshipInfoField,
	FellowshipMember,
} from '@/api/fellowship/types';

export default function FellowshipInfoScreen() {
	const { user } = useAuthStore();

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

	const { info, setStep, updateFellowshipInfo, clearFellowship } =
		useFellowshipStore();
	const [selectedDate, setSelectedDate] = useState(info.date || new Date());
	const [preachTitle, setPreachTitle] = useState(info.preachTitle || '');
	const [preachText, setPreachText] = useState<FellowshipInfoField>({
		value: info.preachText?.value || '',
		isActive: info.preachText?.isActive || false,
	});
	const [preacher, setPreacher] = useState<FellowshipInfoField>({
		value: info.preacher?.value || '',
		isActive: info.preacher?.isActive || false,
	});

	const [selectedMember, setSelectedMember] = useState<FellowshipMember | null>(
		null,
	);
	const [members, setMembers] = useState<FellowshipMember[]>(
		info.members.length === 0
			? [
					{
						id: user?.id || '1',
						displayName: user?.displayName || '',
						photoUrl: user?.photoUrl || '',
						isLeader: true,
					},
				]
			: info.members,
	);
	const [memberNameInput, setMemberNameInput] = useState('');

	const handleCloseMemberSheet = () => {
		setSelectedMember(null);
		handleCloseMember();
	};

	return (
		<SafeAreaView className="h-full">
			<VStack className="flex-1">
				<Header onPressBackButtonWithRouter={() => clearFellowship()} />
				<VStack className="px-5 py-6 gap-10 flex-1">
					<HStack className="items-center justify-between">
						<Heading className="text-[24px]">나눔 정보를 입력해주세요</Heading>
						<Pressable>
							<Icon
								as={CircleHelp}
								size="lg"
								className="color-typography-600"
							/>
						</Pressable>
					</HStack>
					<VStack space="4xl" className="">
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
								<Box className="w-full rounded-xl border-[1px] border-typography-300 px-3 py-3">
									<Text size="xl" className="text-typography-700">
										{selectedDate.toLocaleDateString('ko-KR', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											weekday: 'long',
										})}
									</Text>
								</Box>
							</Pressable>
						</VStack>
						<VStack space="sm">
							<HStack className="items-center justify-between">
								<Text size="md" className="font-pretendard-semi-bold">
									설교 제목
								</Text>
							</HStack>
							<Input variant="outline" size="xl" className="rounded-xl">
								<InputField
									placeholder="설교 제목을 입력해주세요."
									value={preachTitle}
									onChangeText={(value) => setPreachTitle(value)}
								/>
							</Input>
						</VStack>
						<VStack space="sm">
							<HStack className="items-center justify-between">
								<Text size="md" className="font-pretendard-semi-bold">
									설교 본문
								</Text>
								<Checkbox
									size="sm"
									value={'설교 본문'}
									onChange={() =>
										setPreachText({
											...preachText,
											isActive: !preachText.isActive,
										})
									}
									isChecked={!preachText.isActive}
								>
									<CheckboxIndicator>
										<CheckboxIcon as={CheckIcon} />
									</CheckboxIndicator>
									<CheckboxLabel>본문이 없어요</CheckboxLabel>
								</Checkbox>
							</HStack>
							<Input
								variant="outline"
								size="xl"
								className="rounded-xl"
								isDisabled={!preachText.isActive}
							>
								<InputField
									placeholder="ex. 창세기 1장 1~7절"
									value={preachText.value}
									onChangeText={(value) =>
										setPreachText({ ...preachText, value })
									}
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
									onChange={() =>
										setPreacher({
											...preacher,
											isActive: !preacher.isActive,
										})
									}
									isChecked={!preacher.isActive}
								>
									<CheckboxIndicator>
										<CheckboxIcon as={CheckIcon} />
									</CheckboxIndicator>
									<CheckboxLabel>설교자가 없어요</CheckboxLabel>
								</Checkbox>
							</HStack>
							<Input
								variant="outline"
								size="xl"
								className="rounded-xl"
								isDisabled={!preacher.isActive}
							>
								<InputField
									placeholder="설교자를 입력해주세요."
									value={preacher.value}
									onChangeText={(value) => setPreacher({ ...preacher, value })}
								/>
							</Input>
						</VStack>

						<VStack space="lg">
							<HStack className="items-center justify-between">
								<Text size="md" className="font-pretendard-semi-bold">
									나눔 인원
								</Text>
							</HStack>
							<ScrollView horizontal className="pl-2">
								<HStack space="xl" className="items-start">
									{members.map((member) => (
										<Pressable
											key={member.id}
											onPress={() => {
												setSelectedMember(member);
												handleOpenMember();
											}}
										>
											<VStack space="xs" className="items-center">
												<Avatar size="md" className="bg-primary-400">
													<Icon
														as={UserRound}
														size="md"
														className="stroke-white"
													/>
													{member.isLeader && (
														<AvatarBadge className="bg-yellow-400" />
													)}
												</Avatar>
												<Text>{member.displayName}</Text>
											</VStack>
										</Pressable>
									))}
									<Pressable
										onPress={() => {
											handleOpenCreate();
										}}
										className="p-3 border-[1px] border-primary-300 rounded-full"
									>
										<Icon as={Plus} size="lg" className="color-primary-700" />
									</Pressable>
								</HStack>
							</ScrollView>
						</VStack>
					</VStack>
				</VStack>
				<Button
					size="lg"
					variant="solid"
					className="mb-6 mx-5 rounded-xl"
					onPress={() => {
						if (
							!preachTitle ||
							(!preachText.value && preachText.isActive) ||
							(!preacher.value && preacher.isActive)
						) {
							showInfo('나눔 정보를 모두 입력해주세요');
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
						<Pressable
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
								<Icon size="xl" className="stroke-background-700" as={Star} />
								<Text size="lg">나눔 인도자 만들기</Text>
							</HStack>
						</Pressable>
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
								<Icon size="xl" className="stroke-background-700" as={Trash} />
								<Text size="lg">삭제하기</Text>
							</HStack>
						</Pressable>
					</VStack>
				</VStack>
			</MemberBottomSheetContainer>
			<CreateBottomSheetContainer>
				<VStack className="px-5 py-6 gap-10">
					<VStack space="3xl">
						<Heading size="xl">나눔 인원 추가하기</Heading>
						<Input variant="outline" size="xl" className="rounded-xl">
							<InputField
								placeholder="이름을 입력해주세요"
								value={memberNameInput}
								onChangeText={setMemberNameInput}
							/>
						</Input>
					</VStack>
					<Button
						size="lg"
						variant="solid"
						className="rounded-xl"
						onPress={() => {
							setMembers((prev) => [
								...prev,
								{
									id: Math.random().toString(),
									displayName: memberNameInput,
									isLeader: false,
								},
							]);
							setMemberNameInput('');
							handleCloseCreate();
						}}
					>
						<ButtonText>추가하기</ButtonText>
					</Button>
				</VStack>
			</CreateBottomSheetContainer>
			<DateBottomSheetContainer>
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
		</SafeAreaView>
	);
}
