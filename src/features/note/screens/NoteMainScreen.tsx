import { useEffect, useMemo, useState, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { Heading } from '@/shared/components/heading';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { ListFilter, PlusIcon } from 'lucide-react-native';
import { NoteCard } from '@/features/note/components/NoteCard';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Divider } from '#/components/ui/divider';
import { useWorshipStore } from '@/store/worship';
import { WorshipTypeSelector } from '@/features/worship/WorshipTypeSelector';
import { useWorshipTypes } from '@/features/note/hooks/useWorshipTypes';
import { cn } from '@/shared/utils/cn';
import { isIOS } from '@/shared/utils/platform';
import { SyncButton } from '@/components/common/sync-button';
import { NoteStorageService } from '@/features/note/storage';
import { useAuthStore } from '@/store/auth';
import { formatNotesByMonth } from '../utils/formatNotesByMonth';
import type { Note } from '../types';

export default function NoteMainScreen() {
  const { setWorshipTypes, selectedWorshipType } = useWorshipStore();
  const { user } = useAuthStore();

  if (!user?.id) return null;
  const noteStorage = NoteStorageService.getInstance(user.id);

  // 노트 데이터를 상태로 관리
  const [notesByWorshipType, setNotesByWorshipType] = useState<Note[]>([]);
  const notesByMonth = useMemo(
    () => formatNotesByMonth(notesByWorshipType),
    [notesByWorshipType],
  );

  // 노트 데이터 로드 함수
  const loadNotes = useCallback(() => {
    const notes = noteStorage.getNotesByWorshipType(selectedWorshipType);
    setNotesByWorshipType(notes);
  }, [noteStorage, selectedWorshipType]);

  // 화면이 포커스될 때마다 데이터 로드
  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes]),
  );

  const { worshipTypes } = useWorshipTypes();

  useEffect(() => {
    if (worshipTypes.length > 0) {
      setWorshipTypes(worshipTypes);
    }
  }, [worshipTypes, setWorshipTypes]);

  // 예배 타입이 변경될 때마다 노트 다시 로드
  useEffect(() => {
    loadNotes();
  }, [selectedWorshipType, loadNotes]);

  const handleCreateNote = () => {
    router.push('/(app)/(note)/create')
  }

  return (
    <View className="relative">
      <VStack space="xl" className="h-full">
        <VStack space="sm">
          <VStack space="xl">
            <HStack
              className={cn(
                'justify-between items-center',
                isIOS ? 'pt-7' : 'pt-8',
                'pl-4 pr-2',
              )}
            >
              <Heading size="2xl">설교 노트</Heading>
              <SyncButton onSyncComplete={loadNotes} />
            </HStack>
            <HStack space="md" className="pl-4 items-center">
              <Icon as={ListFilter} size="lg" className="text-primary-500" />
              <WorshipTypeSelector />
            </HStack>
          </VStack>
          <Divider />
        </VStack>
        <ScrollView
          className="flex-1 h-full px-4"
          showsVerticalScrollIndicator={false}
        >
          <VStack space="lg" className="pb-20">
            {notesByWorshipType.length === 0 ? (
              <Text className="text-center py-4">노트가 없어요.</Text>
            ) : (
              Object.entries(notesByMonth)
                .map(([month, monthNotes]) => (
                  <VStack key={month} space="md" className="mb-4">
                    <Heading size="xl" className="font-pretendard-semi-bold">
                      {month}
                    </Heading>
                    <VStack space="lg">
                      {monthNotes.map((note) => (
                        <NoteCard key={note.id} note={note} />
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
        onPress={handleCreateNote}
        rounded
      >
        <ButtonIcon as={PlusIcon} />
        <ButtonText>새 노트 만들기</ButtonText>
      </Button>
    </View>
  );
}
