import { VStack } from '#/components/ui/vstack';
import {
	SafeAreaView,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { router, useLocalSearchParams } from 'expo-router';
import {
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import {
	BookText,
	Calendar,
	Check,
	Edit,
	Megaphone,
	UserRound,
	Users,
} from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import { useState } from 'react';
import { useToastStore } from '@/store/toast';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import type {
	Fellowship,
	FellowshipContentField,
	FellowshipMember,
} from '@/store/createFellowship';
import { Divider } from '#/components/ui/divider';
import { Heading } from '#/components/ui/heading';
import { Avatar, AvatarBadge, AvatarGroup } from '#/components/ui/avatar';
import { useAuthStore } from '@/store/auth';
import { Button, ButtonText } from '#/components/ui/button';
import SermonContent from '@/components/screens/fellowship/SermonContent';
import PrayerRequestList from '@/components/screens/fellowship/PrayerRequest';

const member_mock: FellowshipMember = {
	id: '8silTNzjfhhgOH9UdQuZPWwLA072',
	displayName: '김정훈',
	isLeader: true,
};
const member_mock2: FellowshipMember = {
	id: '8silTNzjfhhH9UdQuZPWwLA072',
	displayName: '김태훈',
	isLeader: false,
};

const fellowship_mock: Fellowship = {
	info: {
		date: new Date(),
		preachTitle: { value: '회개하라 종말의 때가 왔도다', disabled: false },
		preacher: { value: '조우현 담임목사님', disabled: false },
		preachText: { value: '창세기 1장 1절 ~ 8절', disabled: false },
		members: [member_mock, member_mock2],
	},
	content: {
		iceBreaking: [
			{
				id: '1',
				question: '아이스브레이킹 질문 1입니다 dadsfasdf.',
				answers: [
					{
						member: member_mock,
						value: '아이스브레이킹 1',
					},
				],
			},
			{
				id: '2',
				question: '아이스브레이킹 질문 2입니다.',
				answers: [
					{
						member: member_mock,
						value: '아이스브레이킹 2',
					},
				],
			},
		],
		sermonTopic: [
			{
				id: '1',
				question: '설교 주제 1',
				answers: [
					{ member: member_mock, value: '설교 주제 1에 대한 나눔 어쩌구' },
				],
			},
			{
				id: '2',
				question: '설교 주제 2',
				answers: [
					{ member: member_mock, value: '설교 주제 2에 대한 나눔 어쩌구' },
					{ member: member_mock2, value: '설교 주제 2에 대한 나눔 어쩌구' },
				],
			},
			{
				id: '3',
				question: '설교 주제 3',
				answers: [
					{ member: member_mock, value: '설교 주제 3에 대한 나눔 어쩌구' },
					{ member: member_mock2, value: '설교 주제 3에 대한 나눔 어쩌구' },
				],
			},
		],
		prayerRequest: [{ member: member_mock, value: '기도하게 해주세요' }],
	},
};

type SelectedFellowshipAnswer = FellowshipContentField | null;

export default function FellowshipDetailScreen() {
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { user } = useAuthStore();

	const [isEditing, setIsEditing] = useState(false);

	const {
		handleOpen: handleOpenDate,
		handleClose: handleCloseDate,
		BottomSheetContainer: BottomSheetDateContainer,
	} = useBottomSheet();

	const { showSuccess } = useToastStore();

	const [fellowship, setFellowship] = useState<Fellowship>(fellowship_mock);
	const [selectedFellowshipContent, setSelectedFellowshipContent] =
		useState<SelectedFellowshipAnswer>(null);

	const isLeader =
		user?.id === fellowship.info.members.find((member) => member.isLeader)?.id;

	const handleUpdateNote = () => {
		setIsEditing(false);
		showSuccess('나눔 노트가 수정되었어요.');
	};

	return (
		<SafeAreaView className="h-full">
			<VStack space="xl" className="h-full">
				<Header
					label="나눔 노트"
					onPressBackButton={() => router.back()}
					className="justify-between pr-6"
				>
					{isLeader && (
						<Pressable
							onPress={() =>
								isEditing ? handleUpdateNote() : setIsEditing(true)
							}
						>
							{isEditing ? (
								<Icon as={Check} size="lg" className="text-typography-900" />
							) : (
								<Icon as={Edit} size="lg" className="text-typography-900" />
							)}
						</Pressable>
					)}
				</Header>
				<ScrollView>
					<VStack space="2xl" className="px-5 flex-1 pb-8">
						{!fellowship.info.preachTitle.disabled &&
							(isEditing ? (
								<TextInput
									placeholder="설교 제목"
									className="text-3xl font-pretendard-bold"
									value={fellowship.info.preachTitle.value}
									onChangeText={(title) =>
										setFellowship((prev) => ({
											...prev,
											info: {
												...prev.info,
												preachTitle: { value: title, disabled: false },
											},
										}))
									}
								/>
							) : (
								<Text className="text-3xl font-pretendard-bold">
									{fellowship.info.preachTitle.value}
								</Text>
							))}

						<VStack space="lg">
							<HStack space="sm" className="items-center w-full">
								<HStack space="sm" className="w-1/4 items-center">
									<Icon
										as={Calendar}
										size="lg"
										className="text-typography-600"
									/>
									<Text size="lg" className="text-typography-600">
										나눔 날짜
									</Text>
								</HStack>
								<TouchableOpacity
									className="w-full flex-row items-center"
									onPress={() => handleOpenDate()}
								>
									<Text size="lg" className="text-[16px] py-2 flex-1">
										{fellowship.info.date?.toLocaleDateString('ko-KR', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											weekday: 'long',
										})}
									</Text>
								</TouchableOpacity>
							</HStack>

							<HStack space="sm" className="items-center w-full">
								<HStack space="sm" className="w-1/4 items-center">
									<Icon
										as={BookText}
										size="lg"
										className="text-typography-600"
									/>
									<Text size="lg" className="text-typography-600">
										설교 본문
									</Text>
								</HStack>
								{!fellowship.info.preachText.disabled &&
									(isEditing ? (
										<TextInput
											placeholder="ex. 창세기 1장 1절"
											className="w-full text-[16px]"
											value={fellowship.info.preachText.value}
											onChangeText={(sermon) =>
												setFellowship((prev) => ({
													...prev,
													info: {
														...prev.info,
														preachText: { value: sermon, disabled: false },
													},
												}))
											}
										/>
									) : (
										<Text className="w-full text-[16px]">
											{fellowship.info.preachText.value}
										</Text>
									))}
							</HStack>

							<HStack space="sm" className="items-center w-full">
								<HStack space="sm" className="w-1/4 items-center">
									<Icon
										as={Megaphone}
										size="lg"
										className="text-typography-600"
									/>
									<Text size="lg" className="text-typography-600">
										설교자
									</Text>
								</HStack>
								{!fellowship.info.preacher.disabled &&
									(isEditing ? (
										<TextInput
											placeholder="비어 있음"
											className="w-full text-[16px]"
											value={fellowship.info.preacher.value}
											onChangeText={(preacher) =>
												setFellowship((prev) => ({
													...prev,
													info: {
														...prev.info,
														preacher: { value: preacher, disabled: false },
													},
												}))
											}
										/>
									) : (
										<Text className="w-full text-[16px]">
											{fellowship.info.preacher.value}
										</Text>
									))}
							</HStack>
							<HStack space="sm" className="items-center w-full">
								<HStack space="sm" className="w-1/4 items-center">
									<Icon as={Users} size="lg" className="text-typography-600" />
									<Text size="lg" className="w-full text-typography-600">
										참여자
									</Text>
								</HStack>
								<AvatarGroup className="justify-between items-center">
									{fellowship.info.members.map((member) => (
										<Avatar
											key={member.id}
											size="sm"
											className="bg-primary-400"
										>
											<Icon as={UserRound} size="sm" className="stroke-white" />
											<AvatarBadge className="bg-yellow-400" />
										</Avatar>
									))}
								</AvatarGroup>
							</HStack>
						</VStack>
						<Divider />
						<VStack className="gap-12">
							{fellowship.content.iceBreaking.length > 0 && (
								<VStack space="2xl">
									<Heading size="xl" className="text-typography-900">
										아이스 브레이킹
									</Heading>
									<VStack space="lg">
										{fellowship.content.iceBreaking.map((topic, index) => (
											<SermonContent
												key={topic.id}
												index={index}
												members={fellowship.info.members}
												sermonTopic={topic}
												setFellowship={setFellowship}
												contentType="iceBreaking"
												isEditing={isEditing}
											/>
										))}
									</VStack>
								</VStack>
							)}
							{fellowship.content.sermonTopic.length > 0 && (
								<VStack space="lg">
									<Heading size="xl" className="text-typography-900">
										설교 나눔
									</Heading>
									<VStack space="lg">
										{fellowship.content.sermonTopic.map((topic, index) => (
											<SermonContent
												key={topic.id}
												index={index}
												members={fellowship.info.members}
												sermonTopic={topic}
												setFellowship={setFellowship}
												contentType="sermonTopic"
												isEditing={isEditing}
											/>
										))}
									</VStack>
								</VStack>
							)}
							{fellowship.content.prayerRequest && (
								<VStack space="2xl">
									<Heading size="xl" className="text-typography-900">
										기도 제목
									</Heading>
									<PrayerRequestList
										members={fellowship.info.members}
										prayerRequests={fellowship.content.prayerRequest}
										setFellowship={setFellowship}
										isEditing={isEditing}
									/>
								</VStack>
							)}
						</VStack>
					</VStack>
				</ScrollView>
				{isEditing && (
					<Button
						size="lg"
						className="mx-6 mb-6 rounded-full"
						onPress={handleUpdateNote}
						// disabled={isLoading}
					>
						<ButtonText>수정 완료</ButtonText>
					</Button>
				)}
			</VStack>

			{/* Bottom Sheet for Date Picker */}
			<BottomSheetDateContainer snapPoints={['50%']}>
				<View className="items-center justify-center pt-5 pb-10">
					<DateTimePicker
						value={fellowship.info.date}
						mode="date"
						display="inline"
						locale="ko"
						onChange={(event, date) => {
							if (date) {
								setFellowship((prev) => ({
									...prev,
									info: { ...prev.info, date },
								}));
								handleCloseDate();
							}
						}}
					/>
				</View>
			</BottomSheetDateContainer>
		</SafeAreaView>
	);
}
