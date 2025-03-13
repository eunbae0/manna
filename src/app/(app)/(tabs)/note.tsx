import { useCallback, useEffect } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heading } from '#/components/ui/heading';
import { Button, ButtonIcon } from '#/components/ui/button';
import { Filter, PlusIcon } from 'lucide-react-native';
import { NoteCard } from '@/components/note/NoteCard';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Divider } from '#/components/ui/divider';
import { useWorshipStore } from '@/store/worship';
import { WorshipTypeSelector } from '@/components/worship/WorshipTypeSelector';
import { fetchUserNotes, fetchUserNotesByWorshipType } from '@/api/notes';
import { fetchUserWorshipTypes } from '@/api/worshipTypes';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';

export default function NoteScreen() {
	const { setWorshipTypes, selectedWorshipType } = useWorshipStore();

	const {
		data,
		isLoading: loading,
		isRefetching: refreshing,
		refetch: refetchNotes,
	} = useQuery({
		queryKey: ['notes', selectedWorshipType],
		queryFn: async () => {
			if (!selectedWorshipType) {
				const { notes, notesByMonth } = await fetchUserNotes();
				return { notes, notesByMonth };
			}
			const { notes, notesByMonth } = await fetchUserNotesByWorshipType(
				selectedWorshipType.name,
			);
			return { notes, notesByMonth };
		},
	});

	const { data: worshipTypes, refetch: refetchWorshipTypes } = useQuery({
		queryKey: ['worshipTypes'],
		queryFn: () => fetchUserWorshipTypes(),
	});

	const { notes, notesByMonth } = data || { notes: [], notesByMonth: {} };

	const onRefresh = useCallback(() => {
		refetchNotes();
		refetchWorshipTypes();
	}, [refetchNotes, refetchWorshipTypes]);

	useEffect(() => {
		if (worshipTypes) {
			setWorshipTypes(worshipTypes);
		}
	}, [worshipTypes, setWorshipTypes]);

	useRefreshOnFocus(refetchNotes); // TODO: invalidateQueries로 변경 가능한지 확인
	useRefreshOnFocus(refetchWorshipTypes);

	return (
		<SafeAreaView>
			<VStack space="xl" className="px-4 h-full">
				<VStack space="sm">
					<VStack space="xl">
						<Heading size="2xl" className="pt-5">
							설교 노트
						</Heading>
						<HStack space="md" className="pl-2 items-center">
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
						{loading ? (
							<Text className="text-center py-4">로딩 중...</Text>
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
				size="xl"
				variant="solid"
				className="absolute bottom-5 right-4 rounded-full"
				onPress={() => router.push('/(app)/(note)/create')}
			>
				<ButtonIcon as={PlusIcon} />
			</Button>
		</SafeAreaView>
	);
}
