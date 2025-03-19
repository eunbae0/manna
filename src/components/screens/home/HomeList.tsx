import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Button, ButtonIcon, ButtonText } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import { Icon } from '#/components/ui/icon';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import { Avatar } from '#/components/ui/avatar';
import {
	ChevronRight,
	HandHelping,
	Heart,
	Library,
	PlusIcon,
	UserRound,
} from 'lucide-react-native';
import { Divider } from '#/components/ui/divider';
import { Card } from '#/components/ui/card';
import CalendarTab from './CalanderTab';
import type { YYYYMMDD } from '@/types/date';
import { getKSTDate, parseKSTDate } from '@/utils/date';
import { Pressable, RefreshControl, ScrollView } from 'react-native';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import {
	BottomSheetListHeader,
	BottomSheetListItem,
	BottomSheetListLayout,
} from '@/components/common/BottomSheet';
import { useQuery } from '@tanstack/react-query';
import { fetchFellowshipsByDateRange } from '@/api/fellowship';

function useFellowshipsByDate(date: YYYYMMDD) {
	const startDate = parseKSTDate(date);
	const endDate = new Date(startDate);
	endDate.setHours(23, 59, 59, 999);

	// Hardcoded group ID for now - in a real app, you would get this from user context or props
	const groupId = 'oVgiDT2gRRuFUWuUV0Ya';

	return useQuery({
		queryKey: ['fellowships', groupId, date],
		queryFn: () => fetchFellowshipsByDateRange(groupId, startDate, endDate),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

function HomeList() {
	const [selectedDate, setSelectedDate] = useState<YYYYMMDD>(
		getKSTDate(new Date()),
	);

	// State for pull-to-refresh functionality
	const [refreshing, setRefreshing] = useState(false);

	const {
		data: fellowships,
		isLoading,
		isError,
		refetch,
	} = useFellowshipsByDate(selectedDate);

	const handleDateChange = (date: YYYYMMDD) => {
		setSelectedDate(date);
	};

	useFocusEffect(
		useCallback(() => {
			setSelectedDate(getKSTDate(new Date()));
		}, []),
	);

	// Handle pull-to-refresh
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await refetch();
		} finally {
			setRefreshing(false);
		}
	}, [refetch]);

	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();

	// Get the first fellowship for the selected date (if any)
	const todaysFellowship =
		fellowships && fellowships.length > 0 ? fellowships[0] : null;

	return (
		<VStack className="relative h-full">
			<CalendarTab
				selectedDate={selectedDate}
				onDateChange={handleDateChange}
			/>
			<ScrollView
				showsVerticalScrollIndicator={false}
				className="h-full flex-1"
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor="#4F46E5" // Primary color for the refresh indicator
						title="새로고침 중..."
						titleColor="#4B5563"
					/>
				}
			>
				<VStack space="4xl" className="px-4 py-6">
					{/* 오늘의 나눔 */}
					<VStack className="gap-12">
						<VStack space="md">
							<HStack className="justify-between items-center">
								<Heading size="xl">오늘의 나눔</Heading>
							</HStack>
							<VStack space="3xl">
								{isLoading ? (
									<HStack className="bg-background-0 rounded-2xl justify-between items-center px-4 py-5">
										<Text size="md">로딩 중...</Text>
									</HStack>
								) : isError ? (
									<HStack className="bg-background-0 rounded-2xl justify-between items-center px-4 py-5">
										<Text size="md" className="text-red-500">
											데이터를 불러오는 중 오류가 발생했어요.
										</Text>
									</HStack>
								) : todaysFellowship ? (
									<Pressable
										onPress={() =>
											router.push(`/(app)/(fellowship)/${todaysFellowship.id}`)
										}
									>
										<HStack className="bg-background-0 rounded-2xl justify-between items-center px-4 py-5">
											<VStack>
												<HStack space="sm" className="items-center">
													<Text size="md" className="text-typography-400">
														{todaysFellowship.info.date
															.toLocaleDateString('ko-KR', {
																year: 'numeric',
																month: '2-digit',
																day: '2-digit',
															})
															.replace(/\. /g, '.')
															.replace(/\.$/, '')}{' '}
														QT
													</Text>
												</HStack>
												<Text size="xl" className="">
													{todaysFellowship.info.preachTitle}
												</Text>
											</VStack>
											<Icon
												as={ChevronRight}
												className="color-typography-400"
											/>
										</HStack>
									</Pressable>
								) : (
									<HStack className="bg-background-0 rounded-2xl justify-between items-center px-4 py-5">
										<Text size="lg">나눔이 없어요.</Text>
									</HStack>
								)}
							</VStack>
						</VStack>
					</VStack>
					{/* 오늘의 기도 제목 */}
					<VStack className="gap-12">
						<VStack space="md">
							<HStack className="justify-between items-center">
								<Heading size="xl">오늘의 기도 제목</Heading>
							</HStack>
							<VStack space="3xl">
								<Card variant="filled" className="bg-background-0 rounded-2xl">
									<VStack space="lg" className="pb-4">
										<HStack space="sm" className="items-center">
											<Avatar size="sm" className="bg-primary-400">
												<Icon as={UserRound} className="stroke-white" />
											</Avatar>
											<Text size="lg" className="font-pretendard-bold">
												김철수
											</Text>
										</HStack>
										<Text size="lg" className="">
											모든 결정가운데 하나님의 말씀보다 앞서지 않게 해주세요.
										</Text>
									</VStack>
									<Button
										variant="outline"
										size="xs"
										className="z-10 absolute -bottom-4 right-4 rounded-full bg-white"
									>
										<ButtonIcon size="sm" as={Heart} className="color-black" />
										<HStack space="xs">
											<ButtonText size="sm">1</ButtonText>
										</HStack>
									</Button>
								</Card>
							</VStack>
						</VStack>
					</VStack>
				</VStack>
			</ScrollView>
			<Button
				size="xl"
				variant="solid"
				className="absolute bottom-14 right-4 rounded-full"
				onPress={() => handleOpen()}
			>
				<ButtonIcon as={PlusIcon} />
			</Button>

			{/* BOTTOM SHEET */}
			<BottomSheetContainer>
				<BottomSheetListLayout>
					<BottomSheetListHeader
						label="무엇을 추가할까요?"
						onPress={handleClose}
					/>
					<BottomSheetListItem
						label="기도 제목 작성하기"
						icon={HandHelping}
						onPress={() => {
							router.navigate('/(app)/createPrayerRequestModal');
							handleClose();
						}}
					/>
					<Divider />
					<BottomSheetListItem
						label="소그룹 나눔 작성하기"
						icon={Library}
						onPress={() => {
							router.push('/(app)/(fellowship)/create');
							handleClose();
						}}
					/>
				</BottomSheetListLayout>
			</BottomSheetContainer>
		</VStack>
	);
}

export default HomeList;
