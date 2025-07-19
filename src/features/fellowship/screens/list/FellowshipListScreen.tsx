import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Rows3, Calendar } from 'lucide-react-native';

import Header from '@/components/common/Header';

import { Box } from '#/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { VStack } from '#/components/ui/vstack';
import AnimatedPressable from '@/components/common/animated-pressable';

import { useFellowshipStore } from '@/store/createFellowship';
import { cn } from '@/shared/utils/cn';
import FellowshipCalendarView from './view/FellowshipCalendarView';
import FellowshipListView from './view/FellowshipListView';

type ViewMode = 'list' | 'calendar';

export default function FellowshipListScreen() {
	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const { setType } = useFellowshipStore();

	// useFocusEffect(
	// 	useCallback(() => {
	// 		refetch();
	// 	}, [refetch]),
	// );

	const handlePressFellowship = (fellowshipId: string) => {
		router.push(`/(app)/(fellowship)/${fellowshipId}`);
	};

	const handlePressCreateFellowship = () => {
		setType('CREATE');
		router.push('/(app)/(fellowship)/create');
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
									'rounded-xl',
									viewMode === 'list' ? 'bg-white' : 'bg-transparent',
								)}
								pressableClassName="px-3 py-2 rounded-xl"
							>
								<Icon
									as={Rows3}
									size="lg"
									className={
										viewMode === 'list' ? 'text-primary-500' : 'text-white'
									}
								/>
							</AnimatedPressable>
							<AnimatedPressable
								onPress={() => setViewMode('calendar')}
								withHaptic
								className={cn(
									'px-3 py-2 rounded-xl',
									viewMode === 'calendar' ? 'bg-white' : 'bg-transparent',
								)}
							>
								<Icon
									as={Calendar}
									size="lg"
									className={
										viewMode === 'calendar' ? 'text-primary-500' : 'text-white'
									}
								/>
							</AnimatedPressable>
						</HStack>
					</HStack>
					{viewMode === 'list' ? (
						// 리스트 뷰
						<FellowshipListView handlePressFellowship={handlePressFellowship} />
					) : (
						// 캘린더 뷰
						<FellowshipCalendarView
							handlePressFellowship={handlePressFellowship}
						/>
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
