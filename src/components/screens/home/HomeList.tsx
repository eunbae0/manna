import { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ButtonIcon, ButtonText } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import {
	ChevronDownIcon,
	SettingsIcon,
	MenuIcon,
	Icon,
	ChevronRightIcon,
} from '#/components/ui/icon';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import {
	Avatar,
	AvatarGroup,
	AvatarBadge,
	AvatarFallbackText,
	AvatarImage,
} from '#/components/ui/avatar';
import {
	ChevronLeftIcon,
	ChevronRight,
	Edit3Icon,
	Flag,
	Heart,
	HeartIcon,
	MoreHorizontal,
	PlusIcon,
	UserRound,
} from 'lucide-react-native';
import { Divider } from '#/components/ui/divider';
import { Card } from '#/components/ui/card';
import CalendarTab from './CalanderTab';
import type { YYYYMMDD } from '@/types/date';
import { getKSTDate } from '@/utils/date';
import { ScrollView } from 'react-native';
import { Box } from '#/components/ui/box';

function HomeList() {
	const [selectedDate, setSelectedDate] = useState<YYYYMMDD>(
		getKSTDate(new Date()),
	);

	const handleDateChange = (date: YYYYMMDD) => {
		setSelectedDate(date);
	};

	return (
		<VStack className="relative h-full">
			<CalendarTab
				selectedDate={selectedDate}
				onDateChange={handleDateChange}
			/>
			<ScrollView
				showsVerticalScrollIndicator={false}
				className="h-full flex-1"
			>
				<VStack space="4xl" className="px-4 py-6">
					{/* 오늘의 나눔 */}
					<VStack className="gap-12">
						<VStack space="md">
							<HStack className="justify-between items-center">
								<Heading size="xl">오늘의 나눔</Heading>
							</HStack>
							<VStack space="3xl">
								<HStack className="shadow-sm bg-background-0 shadow-slate-300 rounded-2xl justify-between items-center px-4 py-5">
									<VStack>
										<HStack space="sm" className="items-center">
											<Text size="md" className="text-typography-400">
												2025.02.28 QT
											</Text>
										</HStack>
										<Text size="xl" className="">
											회개하라 종말의 때가 왔도다
										</Text>
									</VStack>
									<Icon as={ChevronRight} className="color-typography-400" />
								</HStack>
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
								<Card
									variant="filled"
									className="shadow-sm bg-background-0 shadow-slate-300 rounded-2xl"
								>
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
			>
				<ButtonIcon as={PlusIcon} />
			</Button>
		</VStack>
	);
}

export default HomeList;
