import { VStack } from '#/components/ui/vstack';
import { ScrollView } from 'react-native-gesture-handler';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, TextInput, View } from 'react-native';
import { Icon } from '#/components/ui/icon';
import { Text } from '@/shared/components/text';
import {
  AlignJustify,
  BookText,
  CalendarCog,
  ChevronDown,
  ChevronRight,
  Edit,
  Megaphone,
  Trash,
} from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToastStore } from '@/store/toast';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { Note, NoteInput } from '@/features/note/types';
import { useWorshipStore } from '@/store/worship';
import type { ClientWorshipType } from '@/api/worship-types/types';
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
import { Box } from '#/components/ui/box';
import { useAuthStore } from '@/store/auth';
import { NoteStorageService } from '../storage';
import { SelectedBibleList } from '@/shared/components/bible';
import type { SelectedBible } from '@/features/bible/types/selectedBible';
import { BibleSelector } from '@/features/bible/components/BibleSelector';

export default function NoteScreen({ screen }: { screen: 'create' | 'view' }) {
  const isCreateScreen = screen === 'create';
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { user } = useAuthStore();

  if (!user?.id) return null;
  const noteStorage = useMemo(
    () => NoteStorageService.getInstance(user.id),
    [user.id],
  );

  const [isEditing, setIsEditing] = useState(isCreateScreen);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWorshipType, setSelectedWorshipType] =
    useState<ClientWorshipType | null>(null);

  const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();

  const { showSuccess } = useToastStore();

  // Get worship types from global store
  const { worshipTypes } = useWorshipStore();

  const existedNote = useMemo(
    () => (id ? noteStorage.getNote(id) : undefined),
    [id, noteStorage],
  );

  const createNote = (note: NoteInput) => {
    const createdNote = noteStorage.saveNote(note);
    showSuccess('노트가 생성되었어요');
    handleExit();
    router.replace(`/(app)/(note)/${createdNote.id}`);
  };

  const updateNote = (note: NoteInput) => {
    noteStorage.saveNote(note);
    showSuccess('노트가 수정되었어요');
    setIsEditing(false);
  };

  // _local 항목 삭제시 pending 중인 변경사항에서 삭제
  const deleteNote = (noteId: string) => {
    noteStorage.deleteNote(noteId);
    showSuccess('노트가 삭제되었어요');
    router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/note');
  };

  const {
    toggle: toggleDetail,
    isExpanded: detailExpanded,
    containerStyle: detailContainerStyle,
    iconStyle: detailIconStyle,
    onContentLayout: onDetailContentLayout,
  } = useExpandAnimation({
    initiallyExpanded: true,
  });

  // Local state for editing
  const [editableNote, setEditableNote] = useState<Partial<Note>>({});

  // Initialize editable note and date when note data is loaded
  useEffect(() => {
    if (existedNote) {
      setEditableNote(existedNote);
      if (existedNote.date) {
        setSelectedDate(new Date(existedNote.date));
      }
      if (existedNote.worshipType) {
        // Find the matching worship type from the global store
        const matchingType = worshipTypes.find(
          (type) => type.name === existedNote.worshipType.name,
        );
        if (matchingType) {
          setSelectedWorshipType(matchingType);
        }
      }
    }
  }, [existedNote, worshipTypes]);

  const handleDeleteNote = (id: string) => {
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
          onPress: () => deleteNote(id),
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

    const noteData: NoteInput = {
      id,
      title: editableNote.title,
      date: selectedDate.toUTCString(),
      content: editableNote.content,
      sermon: editableNote.sermon,
      preacher: editableNote.preacher,
      worshipType: selectedWorshipType,
    };

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

  if (!isCreateScreen && !existedNote) {
    return <ActivityIndicator />;
  }

  const handlePressDate = () => {
    handleOpen();
    Keyboard.dismiss();
  };

  const {
    BottomSheetContainer: BibleSelectorBottomSheetContainer,
    handleOpen: handleOpenBibleSelector,
    handleClose: handleCloseBibleSelector,
  } = useBottomSheet();


  return (
    <>
      <SafeAreaView className="h-full">
        <VStack space="md" className="h-full">
          <Header className="justify-between pr-4">
            {isEditing ? (
              <Button size="lg" variant="text" onPress={handleUpdateNoteSubmit}>
                <ButtonText>저장하기</ButtonText>
              </Button>
            ) : (
              <HStack space="xs">
                <Button variant="icon" onPress={handleEditButton}>
                  <ButtonIcon as={Edit} />
                </Button>
                <Button
                  variant="icon"
                  onPress={() => handleDeleteNote(editableNote?.id || '')}
                >
                  <ButtonIcon as={Trash} className="text-red-600" />
                </Button>
              </HStack>
            )}
          </Header>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <VStack className="flex-1">
              <VStack space="xs" className="px-5">
                <AnimatedPressable scale="sm" onPress={handlePressDate}>
                  <HStack space="sm" className="items-center">
                    <Text
                      size="lg"
                      weight="medium"
                      className="text-typography-500"
                    >
                      {formatLocalDate(selectedDate)}
                    </Text>
                    {isEditing && (
                      <Icon
                        as={CalendarCog}
                        size="sm"
                        className="text-typography-500"
                      />
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
                      {editableNote?.title}
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
                <VStack
                  space="xl"
                  className="pt-6"
                  onLayout={onDetailContentLayout}
                >
                  <VStack space="xs">
                    <HStack space="sm" className="items-center">
                      <Icon
                        as={BookText}
                        size="sm"
                        className="text-typography-600"
                      />
                      <Text
                        size="lg"
                        weight="medium"
                        className="text-typography-500"
                      >
                        설교 본문
                      </Text>
                    </HStack>
                    {typeof editableNote.sermon === 'string' ? (
                      // <TextInput
                      //   placeholder="ex. 창세기 1장 1절"
                      //   className="w-full h-8 text-xl ml-6 font-pretendard-Regular"
                      //   value={editableNote.sermon}
                      //   onChangeText={(sermon) =>
                      //     setEditableNote((prev) => ({
                      //       ...prev,
                      //       sermon,
                      //     }))
                      //   }
                      // />
                      isEditing ? (
                        <HStack className="items-center justify-between">
                          <TextInput
                            placeholder="ex. 창세기 1장 1절"
                            className="w-2/3 h-8 text-xl ml-6 font-pretendard-Regular flex-1"
                            value={editableNote.sermon}
                            onChangeText={(sermon) =>
                              setEditableNote((prev) => ({
                                ...prev,
                                sermon,
                              }))
                            }
                          />
                          <Button variant="text" size="md" onPress={handleOpenBibleSelector}>
                            <ButtonText>성경에서 선택하기</ButtonText>
                            <ButtonIcon as={ChevronRight} />
                          </Button>
                        </HStack>
                      ) : (
                        <Text
                          size="xl"
                          className={cn(
                            'ml-6',
                            !editableNote?.sermon && 'text-typography-500',
                          )}
                        >
                          {editableNote?.sermon || '비어 있음'}
                        </Text>
                      )
                    ) : (
                      <SelectedBibleList
                        selectedBible={editableNote.sermon || []}
                        deleteBible={(selectedBible) =>
                          setEditableNote((prev) => ({
                            ...prev,
                            sermon: (prev.sermon as SelectedBible[])?.filter(
                              (v) => v.title !== selectedBible.title,
                            ),
                          }))
                        }
                        handleOpenBibleSelector={handleOpenBibleSelector}
                        isReadonly={!isEditing}
                        className='mt-1'
                      />
                    )}

                  </VStack>
                  <VStack space="xs">
                    <HStack space="sm" className="items-center">
                      <Icon
                        as={Megaphone}
                        size="sm"
                        className="text-typography-600"
                      />
                      <Text
                        size="lg"
                        weight="medium"
                        className="text-typography-500"
                      >
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
                          !editableNote?.preacher && 'text-typography-500',
                        )}
                      >
                        {editableNote?.preacher || '비어 있음'}
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
                      <Text
                        size="lg"
                        weight="medium"
                        className="text-typography-500"
                      >
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
                              isSelected={selectedWorshipType?.id === type.id}
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
                          label={existedNote?.worshipType?.name || '비어 있음'}
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
                {isEditing ? (
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
                  <Text className="text-xl pb-6">{editableNote?.content}</Text>
                )}
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
        <BibleSelector
          BibleSelectorBottomSheetContainer={BibleSelectorBottomSheetContainer}
          closeSelector={handleCloseBibleSelector}
          mode="select"
          setSelectedBible={(selectedBible) => {
            if (typeof editableNote.sermon === 'string') {
              setEditableNote((prev) => ({
                ...prev,
                sermon: [selectedBible],
              }));
              return;
            }
            setEditableNote((prev) => ({
              ...prev,
              sermon: prev.sermon ? [...(prev.sermon as SelectedBible[]), selectedBible] : [selectedBible],
            }));
          }}
        />
        {/* 뒤로가기 확인 모달 */}
        <ExitConfirmModal {...bottomSheetProps} onExit={handleExit} />
      </SafeAreaView>
      <KeyboardToolbar />
    </>
  );
}
