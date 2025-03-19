import { useMemo } from 'react';
import { Pressable } from 'react-native';

import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Divider } from '#/components/ui/divider';
import { Text } from '#/components/ui/text';

import type { YYYYMMDD } from '@/types/date';
import { cn } from '@/utils/cn';
import { getKSTDate } from '../../utils/date';
import { Box } from '#/components/ui/box';
import { useIsFocused } from '@react-navigation/native';

type Props = {
	selectedDate: YYYYMMDD;
	onDateChange: (date: YYYYMMDD) => void;
};

const CalendarTab = ({ selectedDate, onDateChange }: Props) => {
	const isFocused = useIsFocused();
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const days = useMemo(() => generateDays(), [isFocused]);

	const handleSelectDate = (day: DayInfo) => {
		onDateChange(day.fullDate);
	};

	return (
		<VStack className="relative">
			<HStack className="w-full px-4">
				{days.map((day) => {
					const isActive = day.fullDate === selectedDate;

					return (
						<Pressable
							key={day.fullDate}
							className="items-center w-full flex-1"
							onPress={() => handleSelectDate(day)}
						>
							<VStack className="items-center w-full gap-[4px]">
								<Text
									size="md"
									className={cn(
										isActive ? 'text-primary-500' : 'text-typography-500',
									)}
								>
									{day.dayOfWeek}
								</Text>
								<Box
									className={cn(
										'px-[10px] py-[1px] items-center justify-center',
										isActive ? 'bg-primary-500 rounded-full' : '',
									)}
								>
									<Text
										size="lg"
										className={cn(
											isActive
												? 'text-typography-0 font-pretendard-semi-bold'
												: 'text-typography-500',
										)}
									>
										{day.date}
									</Text>
								</Box>
								{isActive && (
									<Divider className="bg-primary-500 w-full h-[2px]" />
								)}
							</VStack>
						</Pressable>
					);
				})}
			</HStack>
			<Divider className="absolute bottom-0 left-0" />
		</VStack>
	);
};

export default CalendarTab;

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

type DayInfo = {
	dayOfWeek: string;
	date: string;
	fullDate: YYYYMMDD;
};

function generateDays(): DayInfo[] {
	const today = new Date();
	const days: DayInfo[] = [];

	// 오늘 포함 이전 6일을 추가 (총 7일)
	for (let i = 6; i >= 0; i--) {
		const date = new Date();
		date.setDate(today.getDate() - i);

		days.push({
			dayOfWeek: getDayName(date.getDay()),
			date: date.getDate().toString().padStart(2, '0'),
			fullDate: getKSTDate(date),
		});
	}
	return days;
}

function getDayName(dayIndex: number): string {
	return DAYS_KR[dayIndex];
}
