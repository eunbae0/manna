import { VStack } from '#/components/ui/vstack';
import { ScrollView } from 'react-native-gesture-handler';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  TextInput,
  View,
} from 'react-native';
import { Icon } from '#/components/ui/icon';
import { Text } from '@/shared/components/text';
import {
  AlignJustify,
  BookText,
  CalendarCog,
  ChevronDown,
  Edit,
  Megaphone,
  Trash,
} from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import { useCallback, useEffect, useState } from 'react';
import { useToastStore } from '@/store/toast';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { Note } from '@/api/notes/types';
import { useWorshipStore } from '@/store/worship';
import type { ClientWorshipType } from '@/api/worship-types/types';
import {
  useNote,
  useUpdateNote,
  useDeleteNote,
} from '@/features/notes/hooks/useNote';
import { Keyboard } from 'react-native';
import Animated from 'react-native-reanimated';
import { cn } from '@/shared/utils/cn';
import { KeyboardToolbar } from '@/shared/components/KeyboardToolbar';
import { usePreventBackWithConfirm } from '@/shared/hooks/usePreventBackWithConfirm';
import { ExitConfirmModal } from '@/components/common/exit-confirm-modal';
import { KeyboardAwareScrollView } from '@/shared/components/KeyboardAwareScrollView';
import FilterTag from '@/shared/components/filter-tag';
import { formatLocalDate } from '@/shared/utils/date';
import { useExpandAnimation } from '@/shared/hooks/animation/useExpandAnimation';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Divider } from '#/components/ui/divider';
import { useCreateNote } from '../hooks/useCreateNote';
import { Box } from '#/components/ui/box';

export default function NoteScreen({ screen }: { screen: 'create' | 'view' }) {
  const isCreateScreen = screen === 'create';
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isEditing, setIsEditing] = useState(isCreateScreen);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWorshipType, setSelectedWorshipType] =
    useState<ClientWorshipType | null>(null);

  const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();

  const { showSuccess } = useToastStore();

  // Get worship types from global store
  const { worshipTypes } = useWorshipStore();

  // Use custom hooks for API operations
  const { note, isLoading: isLoadingNote } = useNote(id);
  const { updateNote, isLoading: isUpdating } = useUpdateNote(id, {
    onSuccess: () => {
      setIsEditing(false);
      showSuccess('노트가 수정되었어요');
    },
    onError: () => {
      showSuccess('노트 수정에 실패했어요. 다시 시도해주세요');
    },
  });
  const { createNote, isLoading: isLoadingCreate } = useCreateNote({
    onSuccess: (noteId) => {
      showSuccess('노트가 생성되었어요');
      handleExit();
      router.replace(`/(app)/(note)/${noteId}`);
    },
    onError: () => {
      showSuccess('노트 생성에 실패했어요. 다시 시도해주세요');
    },
  });

  const {
    toggle: toggleDetail,
    isExpanded: detailExpanded,
    containerStyle: detailContainerStyle,
    iconStyle: detailIconStyle,
    onContentLayout: onDetailContentLayout
  } = useExpandAnimation({
    initiallyExpanded: true,
  });

  // Local state for editing
  const [editableNote, setEditableNote] = useState<Partial<Note>>({});

  // Initialize editable note and date when note data is loaded
  useEffect(() => {
    if (note) {
      setEditableNote(note);
      if (note.date) {
        setSelectedDate(note.date.toDate());
      }
      if (note.worshipType) {
        // Find the matching worship type from the global store
        const matchingType = worshipTypes.find(
          (type) => type.name === note.worshipType.name,
        );
        if (matchingType) {
          setSelectedWorshipType(matchingType);
        }
      }
    }
  }, [note, worshipTypes]);

  const { deleteNote, isLoading: isDeleting } = useDeleteNote(id, {
    onSuccess: () => {
      showSuccess('노트가 삭제되었어요');
      router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/note');
    },
    onError: () => {
      showSuccess('노트 삭제에 실패했어요. 다시 시도해주세요');
    },
  });

  const handleDeleteNote = () => {
    Alert.alert(
      '노트 삭제',
      '정말 이 노트를 삭제할까요?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => deleteNote(),
        },
      ],
      { cancelable: true },
    );
  };

  const handleEditButton = () => {
    if (!detailExpanded) toggleDetail();
    setIsEditing(true);
  };

  const handleUpdateNoteSubmit = () => {
    if (!editableNote.title) {
      showSuccess('설교 제목을 입력해주세요.');
      return;
    }

    if (!selectedWorshipType) {
      showSuccess('예배 유형을 선택해주세요.');
      return;
    }

    const noteData = {
      title: editableNote.title || '',
      date: selectedDate,
      content: editableNote.content || '',
      sermon: editableNote.sermon || '',
      preacher: editableNote.preacher || '',
      worshipType: {
        name: selectedWorshipType?.name || '',
        id: selectedWorshipType?.id || '',
      },
    }

    if (isCreateScreen) {
      createNote(noteData);
      return;
    }

    updateNote(noteData);
  };

  // 뒤로가기 방지 및 확인 모달 훅 사용
  const { bottomSheetProps, handleExit } = usePreventBackWithConfirm({
    condition: isEditing,
  });


  const TextAreaBox = useCallback(() => {
    return isEditing ? (
      <TextInput
        placeholder="설교 노트를 적어보세요..."
        className="text-xl pb-6 min-h-80 font-pretendard-Regular"
        multiline={true}
        textAlignVertical="top"
        scrollEnabled={false}
        value={editableNote.content}
        onChangeText={(content) =>
          setEditableNote((prev: Partial<Note>) => ({
            ...prev,
            content,
          }))
        }
      />
    ) : (
      <Text className="text-xl pb-6">{note?.content}</Text>
    );
  }, [isEditing, editableNote.content, note?.content])

  const isLoading = isLoadingNote || isUpdating || isDeleting || isLoadingCreate;

  if (!isCreateScreen && (isLoadingNote || !note)) {
    return <ActivityIndicator />;
  }

  const handlePressDate = () => {
    handleOpen();
    Keyboard.dismiss();
  };

  return (
    <>
      <SafeAreaView className="h-full">
        <VStack space="md" className="h-full">
          <Header className="justify-between pr-4">
            {isEditing ? (
              <Button
                size="lg"
                variant="text"
                onPress={handleUpdateNoteSubmit}
                disabled={isLoading}
              >
                <ButtonText>저장하기</ButtonText>
              </Button>
            ) : (
              <HStack space="xs">
                <Button variant="icon" onPress={handleEditButton}>
                  <ButtonIcon as={Edit} />
                </Button>
                <Button variant="icon" onPress={() => handleDeleteNote()}>
                  <ButtonIcon as={Trash} className="text-red-600" />
                </Button>
              </HStack>
            )}
          </Header>
          <KeyboardAwareScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <VStack className="flex-1">
              <VStack space="xs" className="px-5">
                <AnimatedPressable scale="sm" onPress={handlePressDate}>
                  <HStack space="sm" className="items-center">
                    <Text size="lg" weight="medium" className="text-typography-500">
                      {formatLocalDate(selectedDate)}
                    </Text>
                    {isEditing && (
                      <Icon as={CalendarCog} size="sm" className="text-typography-500" />
                    )}
                  </HStack>
                </AnimatedPressable>
                <HStack space="sm" className="items-center justify-between">
                  {isEditing ? (
                    <TextInput
                      placeholder="설교 제목"
                      className="text-3xl font-pretendard-bold text-typography-800 flex-1"
                      value={editableNote.title}
                      onChangeText={(title) =>
                        setEditableNote((prev: Partial<Note>) => ({
                          ...prev,
                          title,
                        }))
                      }
                    />
                  ) : (
                    <Text className="text-3xl font-pretendard-bold text-typography-900 flex-1">
                      {note?.title}
                    </Text>
                  )}
                  <AnimatedPressable onPress={() => toggleDetail()}>
                    <Animated.View style={[detailIconStyle]}>
                      <Icon
                        as={ChevronDown}
                        // @ts-ignore
                        size="2xl"
                        className="text-typography-500"
                      />
                    </Animated.View>
                  </AnimatedPressable>
                </HStack>
              </VStack>
              <Animated.View style={[detailContainerStyle]} className="px-5">
                <VStack space="xl" className="pt-6" onLayout={onDetailContentLayout}>
                  <VStack space="xs">
                    <HStack space="sm" className="items-center">
                      <Icon
                        as={BookText}
                        size="sm"
                        className="text-typography-600"
                      />
                      <Text size="lg" weight="medium" className="text-typography-500">
                        설교 본문
                      </Text>
                    </HStack>
                    {isEditing ? (
                      <TextInput
                        placeholder="ex. 창세기 1장 1절"
                        className="w-full h-8 text-xl ml-6 font-pretendard-Regular"
                        value={editableNote.sermon}
                        onChangeText={(sermon) =>
                          setEditableNote((prev) => ({
                            ...prev,
                            sermon,
                          }))
                        }
                      />
                    ) : (
                      <Text
                        size="xl"
                        className={cn(
                          'ml-6',
                          !note?.sermon && 'text-typography-500',
                        )}
                      >
                        {note?.sermon || '비어 있음'}
                      </Text>
                    )}
                  </VStack>
                  <VStack space="xs">
                    <HStack space="sm" className="items-center">
                      <Icon
                        as={Megaphone}
                        size="sm"
                        className="text-typography-600"
                      />
                      <Text size="lg" weight="medium" className="text-typography-500">
                        설교자
                      </Text>
                    </HStack>
                    {isEditing ? (
                      <TextInput
                        placeholder="ex. 홍길동 목사"
                        className="w-full h-8 text-xl ml-6 font-pretendard-Regular"
                        value={editableNote.preacher}
                        onChangeText={(preacher) =>
                          setEditableNote((prev) => ({
                            ...prev,
                            preacher,
                          }))
                        }
                      />
                    ) : (
                      <Text
                        size="xl"
                        className={cn(
                          'ml-6',
                          !note?.preacher && 'text-typography-500',
                        )}
                      >
                        {note?.preacher || '비어 있음'}
                      </Text>
                    )}
                  </VStack>
                  <VStack space="sm">
                    <HStack space="sm" className="items-center">
                      <Icon
                        as={AlignJustify}
                        size="sm"
                        className="text-typography-600"
                      />
                      <Text size="lg" weight="medium" className="text-typography-500">
                        예배 유형
                      </Text>
                    </HStack>
                    {isEditing ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="ml-6"
                      >
                        <HStack space="sm">
                          {worshipTypes.map((type) => (
                            <FilterTag
                              key={type.id}
                              label={type.name}
                              isSelected={
                                selectedWorshipType?.id === type.id
                              }
                              onPress={() => setSelectedWorshipType(type)}
                            />
                          ))}
                          <FilterTag
                            label="+"
                            onPress={() => {
                              router.push('/(app)/selectWorshipTypeModal');
                            }}
                          />
                        </HStack>
                      </ScrollView>
                    ) : (
                      <Box className="ml-6 items-start">
                        <FilterTag
                          label={note?.worshipType?.name || '비어 있음'}
                          isSelected={true}
                        />
                      </Box>
                    )}
                  </VStack>
                </VStack>
              </Animated.View>
              <Divider className="bg-background-100 my-6" />
              {/* 노트 내용 영역 - 애니메이션과 분리하여 깜빡임 방지 */}
              <VStack className="px-5 pb-12">
                <TextAreaBox />
              </VStack>
            </VStack>
          </KeyboardAwareScrollView>
        </VStack>
        {/* Bottom Sheet for Date Picker */}
        <BottomSheetContainer snapPoints={['50%']}>
          <View
            className="items-center justify-center pt-5 pb-10"
            style={{ marginBottom: insets.bottom }}
          >
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="inline"
              locale="ko"
              onChange={(event, date) => {
                if (date) {
                  setSelectedDate(date);
                  handleClose();
                }
              }}
            />
          </View>
        </BottomSheetContainer>
        {/* 뒤로가기 확인 모달 */}
        <ExitConfirmModal {...bottomSheetProps} onExit={handleExit} />
      </SafeAreaView>
      <KeyboardToolbar />
    </>
  );
}
