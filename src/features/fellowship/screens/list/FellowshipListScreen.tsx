import React, { useCallback, useState } from 'react';
import { useDelayedValue } from '@/hooks/useDelayedValue';
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	TouchableOpacity,
	View,
	StyleSheet,
	Dimensions,
	Pressable,
	ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { ChevronRight, Plus, Check, Rows3, Calendar, ChevronLeft } from 'lucide-react-native';

import Header from '@/components/common/Header';
import { useToastStore } from '@/store/toast';

import { Box } from '#/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '@/shared/components/text';
import { VStack } from '#/components/ui/vstack';
import { Avatar, AvatarGroup } from '@/components/common/avatar';
import AnimatedPressable from '@/components/common/animated-pressable';

import { FellowshipSkeleton } from '../../components/FellowshipSkeleton';
import { useInfiniteFellowships } from '../../hooks/useInfiniteFellowships';
import type { ClientFellowship, ClientFellowshipMember, ClientFellowshipParticipantV2, ClientFellowshipV2 } from '../../api/types';
import { useFellowshipStore } from '@/store/createFellowship';
import { cn } from '@/shared/utils/cn';

type ViewMode = 'list' | 'calendar';

// 화면 너비를 캘린더에 맞게 계산하기 위한 크기 정의
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CALENDER_WIDTH = SCREEN_WIDTH - 14;
const DAY_CELL_WIDTH = Math.floor(CALENDER_WIDTH / 7);

// 스타일 정의
const styles = StyleSheet.create({
	calendarGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		width: '100%',
	},
	dayCell: {
		width: DAY_CELL_WIDTH,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	weekdayHeader: {
		width: DAY_CELL_WIDTH,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 8,
	}
});

export default function FellowshipListScreen() {
	const { showSuccess, showError } = useToastStore();
	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [showLeader, setShowLeader] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

	// 뷰 모드 전환 함수
	const toggleViewMode = () => {
		setViewMode((prev) => (prev === 'list' ? 'calendar' : 'list'));
	};

	// 이전 달로 이동
	const goToPreviousMonth = () => {
		setCurrentMonth((prevMonth) => {
			const newMonth = new Date(prevMonth);
			newMonth.setMonth(newMonth.getMonth() - 1);
			return newMonth;
		});
	};

	// 다음 달로 이동
	const goToNextMonth = () => {
		setCurrentMonth((prevMonth) => {
			const newMonth = new Date(prevMonth);
			newMonth.setMonth(newMonth.getMonth() + 1);
			return newMonth;
		});
	};
	const { setType } = useFellowshipStore();

	const {
		data,
		isLoading,
		isError,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteFellowships(8);

	// 모든 페이지의 나눔 기록을 하나의 배열로 합치기
	const fellowships = data?.pages.flatMap((page) => page.items) || [];

	// 특정 날짜에 해당하는 소그룹 나눔 찾기
	const getFellowshipsByDate = (date: Date) => {
		return fellowships.filter((fellowship) => {
			const fellowshipDate = fellowship.info.date;
			return (
				date.getDate() === fellowshipDate.getDate() &&
				date.getMonth() === fellowshipDate.getMonth() &&
				date.getFullYear() === fellowshipDate.getFullYear()
			);
		});
	};

	// 특정 월에 나눔이 있는 날짜 목록 가져오기
	const getFellowshipDatesInMonth = (year: number, month: number) => {
		return fellowships.reduce<number[]>((dates, fellowship) => {
			const fellowshipDate = fellowship.info.date;
			if (
				fellowshipDate.getFullYear() === year &&
				fellowshipDate.getMonth() === month
			) {
				const day = fellowshipDate.getDate();
				if (!dates.includes(day)) {
					dates.push(day);
				}
			}
			return dates;
		}, []);
	};

	// 선택된 날짜에 해당하는 소그룹 나눔 목록
	const selectedDateFellowships = selectedDate ? getFellowshipsByDate(selectedDate) : [];

	useFocusEffect(
		useCallback(() => {
			refetch();
		}, [refetch]),
	);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await refetch();
		} catch (error) {
			console.error('Error refreshing fellowships:', error);
			showError('나눔 기록을 새로고침하는 중 오류가 발생했습니다.');
		} finally {
			setRefreshing(false);
		}
	}, [refetch, showError]);

	// 스크롤 끝에 도달했을 때 다음 페이지 로드
	const handleLoadMore = () => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	};

	const handlePressFellowship = (fellowshipId: string) => {
		router.push(`/(app)/(fellowship)/${fellowshipId}`);
	};

	const handlePressCreateFellowship = () => {
		setType('CREATE');
		router.push('/(app)/(fellowship)/create');
	};

	// 나눔장(리더) 찾기 함수
	const findLeader = (members: ClientFellowshipParticipantV2[], leaderId: string) => {
		return members.find((member) => member.id === leaderId);
	};

	// 나눔 아이템 렌더링 함수
	const renderFellowshipItem = ({ item }: { item: ClientFellowshipV2 }) => {
		// 나눔장(리더) 찾기
		const leader = findLeader(item.info.participants, item.roles.leaderId);

		return (
			<AnimatedPressable
				key={item.identifiers.id}
				onPress={() => handlePressFellowship(item.identifiers.id)}
				className="mb-3 mx-4"
			>
				<Box className="border border-gray-300 rounded-2xl px-4 py-4">
					{/* 상단 영역: 날짜와 나눔장 정보 */}
					<HStack className="justify-between items-center">
						<VStack space="xs">
							<VStack space="xs">
								<Text size="xl" className="font-pretendard-semi-bold">
									{item.info.title}
								</Text>
								<Text size="md" className="text-typography-400">
									{item.info.date
										.toLocaleDateString('ko-KR', {
											year: 'numeric',
											month: '2-digit',
											day: '2-digit',
										})
										.replace(/\. /g, '.')
										.replace(/\.$/, '')}
								</Text>
							</VStack>
							{showLeader && leader ? (
								<HStack space="xs" className="items-center">
									<Avatar size="2xs" photoUrl={leader.photoUrl || ''} />
									<Text
										size="sm"
										className="text-typography-500 font-pretendard-semi-bold"
									>
										{leader.displayName}
									</Text>
								</HStack>
							) : <HStack className="items-center gap-[1px]">
								{item.info.participants.map((member) => (
									<Avatar key={member.id} photoUrl={member.photoUrl || ''} size='2xs' />
								))}
							</HStack>}
						</VStack>
						<Icon as={ChevronRight} className="color-typography-400" />
					</HStack>
				</Box>
			</AnimatedPressable>
		);
	};

	// 리스트 푸터 렌더링 함수
	const renderFooter = () => {
		if (!isFetchingNextPage) return null;

		return (
			<Box className="py-4 items-center justify-center">
				<ActivityIndicator size="small" color="#6366f1" />
			</Box>
		);
	};

	// 로딩 상태를 지연시켜 최소한의 스켈레톤 UI 표시 시간 보장
	const showSkeleton = useDelayedValue(isLoading);

	// 빈 리스트 렌더링 함수
	const renderEmptyList = () => {
		if (showSkeleton) return <FellowshipSkeleton />;

		if (isError) {
			return (
				<HStack className="justify-center py-8">
					<Text className="text-danger-500">
						나눔 기록을 불러오는 중 오류가 발생했어요
					</Text>
				</HStack>
			);
		}

		return (
			<VStack space="xl" className="items-center py-8">
				<Text className="text-typography-500">아직 소그룹의 나눔이 없어요</Text>
				<Button
					size="md"
					variant="outline"
					className="rounded-xl"
					onPress={handlePressCreateFellowship}
				>
					<ButtonText>나눔 작성하기</ButtonText>
				</Button>
			</VStack>
		);
	};

	// 캘린더 헤더 렌더링 함수
	const renderCalendarHeader = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth() + 1; // getMonth()는 0-11 반환

		return (
			<HStack className="justify-between items-center pl-4 pr-2">
				<HStack space="lg" className="items-center">
					<Heading size="xl">{`${year}년 ${month}월`}</Heading>
				</HStack>
				<HStack>
					<Button variant="icon" onPress={goToPreviousMonth}>
						<ButtonIcon as={ChevronLeft} />
					</Button>
					<Button variant="icon" onPress={goToNextMonth}>
						<ButtonIcon as={ChevronRight} />
					</Button>
				</HStack>
			</HStack>
		);
	};

	// 달력 렌더링 함수
	const renderCalendar = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();

		// 현재 월의 시작일과 마지막일 가져오기
		const firstDayOfMonth = new Date(year, month, 1);
		const lastDayOfMonth = new Date(year, month + 1, 0);

		// 이번 달의 첫째 요일(0: 일요일 ~ 6: 토요일)
		const firstDayOfWeek = firstDayOfMonth.getDay();

		// 캘린더 데이터 배열 생성
		const calendarDays: (number | null)[] = [];

		// 이전 달의 날짜를 null로 채움
		for (let i = 0; i < firstDayOfWeek; i++) {
			calendarDays.push(null);
		}

		// 현재 달의 날짜 추가
		for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
			calendarDays.push(i);
		}

		// 나눔이 있는 날짜 목록
		const datesWithFellowships = getFellowshipDatesInMonth(year, month);

		// 요일 표시
		const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

		return (
			<VStack>
				{/* 요일 해더 */}
				<View style={styles.calendarGrid}>
					{weekdays.map((day) => {
						// 요일은 고유하기 때문에 요일 이름을 키로 사용
						const isSunday = day === '일';
						const isSaturday = day === '토';
						return (
							<View
								key={`weekday-${day}`}
								style={styles.weekdayHeader}
							>
								<Text
									size="md"
									className={cn(isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-typography-900')}
								>
									{day}
								</Text>
							</View>
						);
					})}
				</View>

				{/* 달력 그리드 */}
				<View style={styles.calendarGrid}>
					{calendarDays.map((day, index) => {
						// null이면 비어있는 셀 표시
						if (day === null) {
							// 경고를 피하기 위해 절대 위치(1일보다 앞에 있는 비어있는 칸의 위치)를 계산
							const emptyDayPosition = -Math.abs(firstDayOfWeek - index);
							return <View key={`empty-${year}-${month}-position-${emptyDayPosition}`} style={styles.dayCell} />;
						}

						// 해당 날짜에 나눔이 있는지 확인
						const hasFellowship = datesWithFellowships.includes(day);

						// 오늘 날짜 확인
						const today = new Date();
						const isToday =
							day === today.getDate() &&
							month === today.getMonth() &&
							year === today.getFullYear();

						// 선택된 날짜 확인
						const isSelected = selectedDate &&
							day === selectedDate.getDate() &&
							month === selectedDate.getMonth() &&
							year === selectedDate.getFullYear();

						// 요일 인덱스 계산 (0: 일요일)
						const dayOfWeek = (index + 7 - firstDayOfWeek) % 7;
						const isSunday = dayOfWeek === 0;

						return (
							<AnimatedPressable
								key={`day-${year}-${month}-${day}`}
								style={styles.dayCell}
								onPress={() => {
									if (hasFellowship) {
										const newSelectedDate = new Date(year, month, day);
										setSelectedDate(isSelected ? null : newSelectedDate);
									}
								}}
							>
								<View style={[styles.dayCell, { justifyContent: "flex-start" }]}>
									<View className={`
										w-8 h-8 rounded-full items-center justify-center
										${isSelected ? 'bg-primary-500' : isToday ? 'bg-primary-100' : ''}
									`}>
										<Text
											size="lg"
											className={`font-pretendard-Medium
												${isSelected ? 'text-white' : isSunday ? 'text-danger-500' : 'text-typography-900'}
												${!hasFellowship ? 'opacity-40' : ''}
											`}
										>
											{day}
										</Text>
									</View>
									{/* 나눔 표시 점 */}
									{hasFellowship && (
										<View className="w-1 h-1 rounded-full bg-primary-500 mt-1" />
									)}
								</View>
							</AnimatedPressable>
						);
					})}
				</View>
			</VStack>
		);
	};

	// 선택된 날짜의 나눔 목록 렌더링
	const renderSelectedDateFellowships = () => {
		if (!selectedDate || selectedDateFellowships.length === 0) return null;

		return (
			<VStack space="md" className="mt-4 px-4">
				<HStack className="items-center justify-between">
					<HStack className="items-center">
						<View className="w-1 h-1 rounded-full bg-primary-500 mr-2" />
						<Text size="lg" className="font-pretendard-semi-bold">
							{selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 나눔
						</Text>
					</HStack>
					<AnimatedPressable
						onPress={() => setShowLeader(!showLeader)}
						className="self-end"
					>
						<HStack space="sm" className="items-center mr-2">
							<Text size="md" className="text-typography-600">나눔장 보기</Text>
							<Box
								className={`w-4 h-4 rounded-sm border items-center justify-center ${showLeader ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}
							>
								{showLeader && (
									<Icon as={Check} size="xs" className="text-white" />
								)}
							</Box>
						</HStack>
					</AnimatedPressable>
				</HStack>

				<VStack space="sm">
					{selectedDateFellowships.map((fellowship) => {
						const leader = findLeader(fellowship.info.participants, fellowship.roles.leaderId);
						return (
							<AnimatedPressable
								key={fellowship.identifiers.id}
								onPress={() => handlePressFellowship(fellowship.identifiers.id)}
							>
								<Box
									className="p-4 border border-gray-300 rounded-xl">
									<HStack className="justify-between items-center">
										<VStack space="xs">
											<Text size="lg" className="flex-1">
												{fellowship.info.title}
											</Text>
											{showLeader && leader ? (
												<HStack space="xs" className="items-center">
													<Avatar size="2xs" photoUrl={leader.photoUrl || ''} />
													<Text
														size="sm"
														className="text-typography-500 font-pretendard-semi-bold"
													>
														{leader.displayName}
													</Text>
												</HStack>
											) : <HStack className="items-center gap-[1px]">
												{fellowship.info.participants.map((member) => (
													<Avatar key={member.id} photoUrl={member.photoUrl || ''} size='2xs' />
												))}
											</HStack>}
										</VStack>
										<Icon as={ChevronRight} className="color-typography-400" />
									</HStack>
								</Box>
							</AnimatedPressable>
						)
					})}
				</VStack>
			</VStack>
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-white">
			<VStack className="flex-1">
				<Header />
				<VStack space="md" className="flex-1">
					<HStack className="pt-2 px-5 gap-4 items-center justify-between">
						<Heading className="text-[24px]">나눔 기록</Heading>
						<HStack className="bg-background-200 rounded-2xl p-1">
							<AnimatedPressable
								onPress={() => setViewMode('list')}
								withHaptic
								className={cn(
									"px-3 py-2 rounded-xl",
									viewMode === 'list' ? "bg-white" : "bg-transparent"
								)}
							>
								<Icon
									as={Rows3}
									size="lg"
									className={viewMode === 'list' ? "text-primary-500" : "text-white"}
								/>
							</AnimatedPressable>
							<AnimatedPressable
								onPress={() => setViewMode('calendar')}
								withHaptic
								className={cn(
									"px-3 py-2 rounded-xl",
									viewMode === 'calendar' ? "bg-white" : "bg-transparent"
								)}
							>
								<Icon
									as={Calendar}
									size="lg"
									className={viewMode === 'calendar' ? "text-primary-500" : "text-white"}
								/>
							</AnimatedPressable>
						</HStack>
					</HStack>
					{viewMode === 'list' ? (
						// 리스트 뷰
						showSkeleton && !isFetchingNextPage ? (
							<Box className="pt-5">
								<FellowshipSkeleton />
							</Box>
						) : (
							<FlatList
								data={fellowships}
								renderItem={renderFellowshipItem}
								keyExtractor={(item) => item.identifiers.id}
								ListHeaderComponent={
									<AnimatedPressable
										onPress={() => setShowLeader(!showLeader)}
										className="self-end"
									>
										<HStack space="sm" className="items-center mr-5 py-2">
											<Text size="md" className="text-typography-600">나눔장 보기</Text>
											<Box
												className={`w-4 h-4 rounded-sm border items-center justify-center ${showLeader ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}
											>
												{showLeader && (
													<Icon as={Check} size="xs" className="text-white" />
												)}
											</Box>
										</HStack>
									</AnimatedPressable>
								}
								ListEmptyComponent={renderEmptyList}
								ListFooterComponent={renderFooter}
								onEndReached={handleLoadMore}
								onEndReachedThreshold={0.5}
								refreshControl={
									<RefreshControl
										refreshing={refreshing}
										onRefresh={handleRefresh}
										tintColor="#6366f1"
										title="새로고침 중..."
										titleColor="#4B5563"
									/>
								}
								showsVerticalScrollIndicator={false}
								className="flex-1"
							/>
						)
					) : (
						// 캘린더 뷰
						<ScrollView
							showsVerticalScrollIndicator={false}
							refreshControl={
								<RefreshControl
									refreshing={refreshing}
									onRefresh={handleRefresh}
									tintColor="#6366f1"
									title="새로고침 중..."
									titleColor="#4B5563"
								/>
							}
							contentContainerStyle={{ paddingBottom: 60 }} // 하단 여백을 더 늘려서 스크롤 범위 확보
						>
							<VStack className="pb-4">
								{/* 캘린더 헤더 */}
								{renderCalendarHeader()}

								{/* 캘린더 그리드 */}
								<Box style={{ paddingHorizontal: 7 }}>
									{renderCalendar()}
								</Box>
								{/* 선택된 날짜의 나눔 목록 */}
								{renderSelectedDateFellowships()}
							</VStack>
						</ScrollView>
					)}
					<Box className="absolute bottom-6 left-0 w-full">
						<Button
							size="lg"
							variant="solid"
							className="w-full items-center justify-center"
							rounded
							onPress={handlePressCreateFellowship}
						>
							<ButtonText>나눔 만들기</ButtonText>
							<ButtonIcon as={Plus} />
						</Button>
					</Box>
				</VStack>
			</VStack>
		</SafeAreaView>
	);
}
