import React, { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Button, ButtonIcon } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import { Icon } from '#/components/ui/icon';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import {
	ChevronRight,
	HandHelping,
	Library,
	PlusIcon,
} from 'lucide-react-native';
import { Divider } from '#/components/ui/divider';
import { Box } from '#/components/ui/box';
import { Spinner } from '@/components/common/spinner';
import CalendarTab from './CalanderTab';
import type { YYYYMMDD } from '@/shared/types/date';
import { getKSTDate } from '@/shared/utils/date';
import { Pressable, RefreshControl, ScrollView } from 'react-native';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import {
	BottomSheetListHeader,
	BottomSheetListItem,
	BottomSheetListLayout,
} from '@/components/common/bottom-sheet';
import { usePrayerRequestsByDate } from '@/features/home/hooks/usePrayerRequestsByDate';
import { useFellowshipsByDate } from '@/features/home/hooks/useFellowshipsByDate';
import type { ClientPrayerRequest } from '@/api/prayer-request/types';
import { PrayerRequestCard } from './PrayerRequestCard';
import { useAuthStore } from '@/store/auth';

function HomeList() {
	const [selectedDate, setSelectedDate] = useState<YYYYMMDD>(
		getKSTDate(new Date()),
	);

	// State for pull-to-refresh functionality
	const [refreshing, setRefreshing] = useState(false);

	// Hardcoded group ID for now - in a real app, you would get this from user context or props
	const groupId = 'oVgiDT2gRRuFUWuUV0Ya';

	const { user } = useAuthStore();

	const {
		data: fellowships,
		isLoading,
		isError,
		refetch,
	} = useFellowshipsByDate(selectedDate);

	const {
		data: prayerRequests,
		isLoading: isPrayerRequestsLoading,
		isError: isPrayerRequestsError,
		refetch: refetchPrayerRequests,
	} = usePrayerRequestsByDate(groupId, selectedDate);

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
			await Promise.all([refetch(), refetchPrayerRequests()]);
		} finally {
			setRefreshing(false);
		}
	}, [refetch, refetchPrayerRequests]);

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
							{isPrayerRequestsLoading ? (
								<Box className="items-center justify-center py-8">
									<Spinner size="large" />
								</Box>
							) : isPrayerRequestsError ? (
								<Text className="text-center py-8 text-danger-500">
									기도 제목을 불러오는 중 오류가 발생했어요
								</Text>
							) : prayerRequests && prayerRequests.length > 0 ? (
								<VStack space="3xl">
									{prayerRequests.map((prayerRequest: ClientPrayerRequest) => (
										<PrayerRequestCard
											key={prayerRequest.id}
											prayerRequest={prayerRequest}
											member={{
												id: user?.id || '',
												displayName: user?.displayName || '',
												photoUrl: user?.photoUrl || '',
											}}
											selectedDate={selectedDate}
										/>
									))}
								</VStack>
							) : (
								<Text className="text-center py-8 text-gray-500">
									기도 제목이 없어요
								</Text>
							)}
						</VStack>
					</VStack>
				</VStack>
				<Box className="h-32" />
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
