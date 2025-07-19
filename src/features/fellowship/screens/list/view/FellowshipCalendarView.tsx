import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Button, ButtonIcon } from '@/components/common/button';
import { Box } from '#/components/ui/box';
import { Text } from '@/shared/components/text';
import { cn } from '@/shared/utils/cn';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { View, RefreshControl, Dimensions, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useState } from 'react';
import type {
	ClientFellowshipParticipantV2,
	ClientFellowshipV2,
} from '@/features/fellowship/api/types';
import { Icon } from '#/components/ui/icon';
import {
	useCalendarFellowshipDates,
	useSelectedDateFellowships,
} from '@/features/fellowship/hooks/useCalendarFellowships';
import Heading from '@/shared/components/heading';
import FellowshipListItem from '@/features/fellowship/components/FellowshipListItem';
import { useDelayedValue } from '@/hooks/useDelayedValue';
import {
	FellowshipListSkeleton,
	FellowshipListSkeletonGroup,
} from '@/features/fellowship/components/FellowshipListSkeleton';

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
	},
});

type Props = {
	handlePressFellowship: (fellowshipId: string) => void;
};

export default function FellowshipCalendarView({
	handlePressFellowship,
}: Props) {
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
	const [showLeader, setShowLeader] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const { data: fellowshipDates, refetch: refetchFellowshipDates } =
		useCalendarFellowshipDates(
			currentMonth.getFullYear(),
			currentMonth.getMonth() + 1,
		);

	const {
		data: selectedDateFellowships,
		refetch: refetchSelectedDateFellowships,
		isLoading: isLoadingSelectedDateFellowships,
	} = useSelectedDateFellowships(selectedDate);

	const showSkeleton = useDelayedValue(isLoadingSelectedDateFellowships);

	useEffect(() => {
		if (fellowshipDates && fellowshipDates.length > 0 && !selectedDate) {
			const day = fellowshipDates.sort((a, b) => b - a)[0];
			const date = new Date(
				currentMonth.getFullYear(),
				currentMonth.getMonth(),
				day,
			);
			setSelectedDate(date);
		}
	}, [fellowshipDates, currentMonth, selectedDate]);

	const handleRefreshCalendar = useCallback(async () => {
		setRefreshing(true);
		await Promise.all([
			refetchFellowshipDates(),
			refetchSelectedDateFellowships(),
		]);
		setRefreshing(false);
	}, [refetchFellowshipDates, refetchSelectedDateFellowships]);

	// 이전 달로 이동
	const handlePrevMonth = useCallback(() => {
		setCurrentMonth((prevMonth) => {
			const newMonth = new Date(prevMonth);
			newMonth.setMonth(newMonth.getMonth() - 1);
			return newMonth;
		});
	}, []);

	// 다음 달로 이동
	const handleNextMonth = useCallback(() => {
		setCurrentMonth((prevMonth) => {
			const newMonth = new Date(prevMonth);
			newMonth.setMonth(newMonth.getMonth() + 1);
			return newMonth;
		});
	}, []);

	// 특정 월에 나눔이 있는 날짜 목록 가져오기
	const getFellowshipDatesInMonth = useCallback(
		(year: number, month: number) => {
			return fellowshipDates?.reduce<number[]>((dates, day) => {
				const fellowshipDate = new Date(year, month, day);
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
		},
		[fellowshipDates],
	);

	// 캘린더 헤더 렌더링 함수
	const renderCalendarHeader = useCallback(() => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth() + 1; // getMonth()는 0-11 반환

		return (
			<HStack className="justify-between items-center pl-4 pr-2">
				<HStack space="lg" className="items-center">
					<Heading size="xl">{`${year}년 ${month}월`}</Heading>
				</HStack>
				<HStack>
					<Button variant="icon" onPress={handlePrevMonth}>
						<ButtonIcon as={ChevronLeft} />
					</Button>
					<Button variant="icon" onPress={handleNextMonth}>
						<ButtonIcon as={ChevronRight} />
					</Button>
				</HStack>
			</HStack>
		);
	}, [currentMonth, handlePrevMonth, handleNextMonth]);

	// 달력 렌더링 함수
	const renderCalendar = useCallback(() => {
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
							<View key={`weekday-${day}`} style={styles.weekdayHeader}>
								<Text
									size="md"
									className={cn(
										isSunday
											? 'text-red-500'
											: isSaturday
												? 'text-blue-500'
												: 'text-typography-900',
									)}
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
							return (
								<View
									key={`empty-${year}-${month}-position-${emptyDayPosition}`}
									style={styles.dayCell}
								/>
							);
						}

						// 해당 날짜에 나눔이 있는지 확인
						const hasFellowship = datesWithFellowships?.includes(day);

						// 오늘 날짜 확인
						const today = new Date();
						const isToday =
							day === today.getDate() &&
							month === today.getMonth() &&
							year === today.getFullYear();

						// 선택된 날짜 확인
						const isSelected =
							selectedDate &&
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
								<View
									style={[styles.dayCell, { justifyContent: 'flex-start' }]}
								>
									<View
										className={`
										w-8 h-8 rounded-full items-center justify-center
										${isSelected ? 'bg-primary-500' : isToday ? 'bg-primary-100' : ''}
									`}
									>
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
	}, [currentMonth, selectedDate, getFellowshipDatesInMonth]);

	// 선택된 날짜의 나눔 목록 헤더 렌더링
	const renderFellowshipListHeader = useCallback(() => {
		if (
			!selectedDate ||
			!selectedDateFellowships ||
			selectedDateFellowships.length === 0
		)
			return null;

		return (
			<HStack className="items-center justify-between px-4 mt-8 mb-4">
				<Text size="xl" weight="semi-bold">
					{selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 나눔
				</Text>
				<AnimatedPressable
					onPress={() => setShowLeader((prev) => !prev)}
					className="self-end"
				>
					<HStack space="sm" className="items-center mr-2">
						<Text size="md" className="text-typography-600">
							나눔 리더만 보기
						</Text>
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
		);
	}, [selectedDate, selectedDateFellowships, showLeader]);

	// 캘린더 헤더 컴포넌트 (고정될 부분)
	const CalendarHeader = useCallback(() => {
		return (
			<VStack>
				{/* 월 선택 헤더 */}
				{renderCalendarHeader()}
				{/* 캘린더 그리드 */}
				<Box style={{ paddingHorizontal: 7 }}>{renderCalendar()}</Box>

				{/* 선택된 날짜의 나눔 목록 헤더 */}
				{renderFellowshipListHeader()}
			</VStack>
		);
	}, [renderCalendarHeader, renderCalendar, renderFellowshipListHeader]);

	// 나눔 아이템 렌더링 함수
	const renderFellowshipItem = useCallback(
		({ item }: { item: ClientFellowshipV2 }) => {
			return (
				<FellowshipListItem
					item={item}
					showOnlyLeader={showLeader}
					showDate={false}
					onPress={handlePressFellowship}
				/>
			);
		},
		[showLeader, handlePressFellowship],
	);

	return (
		<FlashList<ClientFellowshipV2>
			data={
				selectedDate && selectedDateFellowships ? selectedDateFellowships : []
			}
			renderItem={renderFellowshipItem}
			estimatedItemSize={100}
			extraData={showLeader}
			keyExtractor={(item) => item.identifiers.id}
			showsVerticalScrollIndicator={false}
			ListHeaderComponent={CalendarHeader}
			ListEmptyComponent={
				showSkeleton ? (
					<FellowshipListSkeletonGroup />
				) : selectedDate && selectedDateFellowships?.length === 0 ? (
					<VStack className="items-center justify-center py-8">
						<Text className="text-typography-500">
							선택한 날짜에 나눔이 없어요.
						</Text>
					</VStack>
				) : null
			}
			contentContainerStyle={{ paddingBottom: 60 }}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={handleRefreshCalendar}
					tintColor="#6366f1"
					title="새로고침 중..."
					titleColor="#4B5563"
				/>
			}
		/>
	);
}
