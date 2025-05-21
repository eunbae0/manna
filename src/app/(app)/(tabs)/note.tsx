import { useCallback, useEffect } from 'react';
import { useDelayedValue } from '@/hooks/useDelayedValue';
import { RefreshControl, ScrollView } from 'react-native';
import { router } from 'expo-router';

import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heading } from '@/shared/components/heading';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Filter, PlusIcon } from 'lucide-react-native';
import { NoteCard } from '@/features/notes/components/NoteCard';
import { NoteSkeleton } from '@/features/notes/components/NoteSkeleton';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Divider } from '#/components/ui/divider';
import { useWorshipStore } from '@/store/worship';
import { WorshipTypeSelector } from '@/features/worship/WorshipTypeSelector';
import { useNotes } from '@/features/notes/hooks/useNotes';
import { useWorshipTypes } from '@/features/notes/hooks/useWorshipTypes';
import { cn } from '@/shared/utils/cn';
import { isIOS } from '@/shared/utils/platform';

export default function NoteScreen() {
	const { setWorshipTypes, selectedWorshipType } = useWorshipStore();

	const {
		notes,
		notesByMonth,
		isLoading: loading,
		isRefetching: refreshing,
		refetch: refetchNotes,
	} = useNotes(selectedWorshipType);

	// 로딩 상태를 지연시켜 최소한의 스켈레톤 UI 표시 시간 보장
	const showSkeleton = useDelayedValue(loading);

	const { worshipTypes, refetch: refetchWorshipTypes } = useWorshipTypes();

	const onRefresh = useCallback(() => {
		refetchNotes();
		refetchWorshipTypes();
	}, [refetchNotes, refetchWorshipTypes]);

	useEffect(() => {
		if (worshipTypes.length > 0) {
			setWorshipTypes(worshipTypes);
		}
	}, [worshipTypes, setWorshipTypes]);

	return (
		<SafeAreaView className="relative bg-background-100">
			<VStack space="xl" className="px-4 h-full">
				<VStack space="sm">
					<VStack space="xl">
						<Heading size="2xl" className={cn(isIOS ? 'pt-5' : 'pt-6')}>
							설교 노트
						</Heading>
						<HStack space="lg" className="pl-2 items-center">
							<Icon as={Filter} size="lg" className="text-typography-600" />
							<WorshipTypeSelector />
						</HStack>
					</VStack>
					<Divider />
				</VStack>
				<ScrollView
					className="flex-1 h-full"
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
				>
					<VStack space="lg" className="">
						{showSkeleton ? (
							<NoteSkeleton />
						) : notes.length === 0 ? (
							<Text className="text-center py-4">노트가 없습니다.</Text>
						) : (
							Object.entries(notesByMonth).map(([month, monthNotes]) => (
								<VStack key={month} space="md" className="mb-4">
									<Heading size="xl" className="font-pretendard-semi-bold">
										{month}
									</Heading>
									<VStack space="md">
										{monthNotes.map((note) => (
											<NoteCard
												key={note.id}
												id={note.id}
												title={note.title}
												date={note.date}
												content={note.content}
											/>
										))}
									</VStack>
								</VStack>
							))
						)}
					</VStack>
				</ScrollView>
			</VStack>
			<Button
				size="lg"
				className="absolute bottom-5 right-4"
				onPress={() => router.push('/(app)/(note)/create')}
				rounded
			>
				<ButtonText>노트 추가하기</ButtonText>
				<ButtonIcon as={PlusIcon} />
			</Button>
		</SafeAreaView>
	);
}
