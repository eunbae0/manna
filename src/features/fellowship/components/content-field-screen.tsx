import { Box } from '#/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '@/shared/components/text';
import { Textarea, TextareaInput } from '#/components/ui/textarea';
import { VStack } from '#/components/ui/vstack';
import type { ServerFellowshipContentField } from '@/features/fellowship/api/types';
import Header from '@/components/common/Header';
import { useFellowshipStore } from '@/store/createFellowship';
import { Check, Plus, ThumbsUp, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, TextInput } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';
import { KeyboardAwareScrollView } from '@/shared/components/KeyboardAwareScrollView';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useBackHandler } from '@/shared/hooks/useBackHandler';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';
import { cn } from '@/shared/utils/cn';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { BottomSheetListHeader, BottomSheetListLayout } from '@/components/common/bottom-sheet';

import type { QuestionCategory } from '@/features/fellowship/constants/question';
import { ICEBREAKING_CATEGORIES, SERMON_CATEGORIES } from '@/features/fellowship/constants/question';

interface ContentFieldScreenProps {
  title: string;
  fieldKey: 'iceBreaking' | 'sermonTopic';
  placeholder: string;
}

export default function ContentFieldScreen({
  title,
  fieldKey,
  placeholder,
}: ContentFieldScreenProps) {
  const { setStep, updateFellowshipContent, content } = useFellowshipStore();
  const [fields, setFields] = useState<ServerFellowshipContentField[]>(
    content[fieldKey].length === 0
      ? [{ id: uuidv4(), question: '', answers: [] }]
      : content[fieldKey],
  );
  const textareaRef = useRef<TextInput>(null);

  const handlePressDelete = (id: string) => {
    const updatedFields = fields.filter((item) => item.id !== id);
    setFields(updatedFields);
  };

  const handlePressAdd = () => {
    const updatedFields = [...fields];
    updatedFields.push({ id: uuidv4(), question: '', answers: [] });
    setFields(updatedFields);

    // focus keyboard
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    if (fields.length === 1) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [fields.length]);

  const handlePressFinish = () => {
    updateFellowshipContent({
      [fieldKey]: fields.filter(({ question }) => question !== ''),
    });
    setStep('CONTENT');
  };

  const { BottomSheetContainer: RecommendedQuestionsBottomSheetContainer, handleOpen: handleOpenRecommendedQuestions, handleClose: handleCloseRecommendedQuestions } = useBottomSheet();

  const [activeCategoryId, setActiveCategoryId] = useState<string>('1');
  const [recommendedQuestions, setRecommendedQuestions] = useState<QuestionCategory[]>(
    fieldKey === 'iceBreaking' ? ICEBREAKING_CATEGORIES : SERMON_CATEGORIES
  );

  // 선택된 질문 개수 계산
  const selectedQuestionsCount = useMemo(() => {
    return recommendedQuestions.reduce((count, category) => {
      return count + category.questions.filter(q => q.selected).length;
    }, 0);
  }, [recommendedQuestions]);

  const handlePressRecommendedQuestions = () => {
    Keyboard.dismiss();
    handleOpenRecommendedQuestions();
  };

  const handleToggleQuestion = (categoryId: string, questionId: string) => {
    setRecommendedQuestions(prev => {
      return prev.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            questions: category.questions.map(question => {
              if (question.id === questionId) {
                return { ...question, selected: !question.selected };
              }
              return question;
            })
          };
        }
        return category;
      });
    });
  };

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
  };

  const handleAddSelectedQuestions = () => {
    // 모든 카테고리에서 선택된 질문들 수집
    const selectedQuestions = recommendedQuestions
      .flatMap(category => category.questions)
      .filter(question => question.selected)
      .map(question => ({
        id: uuidv4(),
        question: question.text,
        answers: []
      }));

    if (selectedQuestions.length === 0) {
      // 선택된 질문이 없으면 바텀시트만 닫기
      handleCloseRecommendedQuestions();
      return;
    }

    // 기존 필드에 선택된 질문들 추가
    const updatedFields = [...fields.filter(({ question }) => question !== ''), ...selectedQuestions];
    setFields(updatedFields);

    // 선택 상태 초기화
    setRecommendedQuestions(prev => {
      return prev.map(category => ({
        ...category,
        questions: category.questions.map(question => ({
          ...question,
          selected: false
        }))
      }));
    });

    // 바텀시트 닫기
    handleCloseRecommendedQuestions();

    // 포커스 설정 (마지막 필드로)
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  useBackHandler(() => {
    setStep('CONTENT');
    return true;
  });

  return (
    <>
      <KeyboardAvoidingView>
        <Header onPressBackButton={() => setStep('CONTENT')} />
        <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
          <VStack className="px-5 py-6 gap-8 flex-1">
            <HStack className="items-center justify-between">
              <Heading className="text-[24px]">{title}</Heading>
              {/* TODO: 도움말 모달 추가하기 */}
              {/* <Pressable>
              <Icon
                as={CircleHelp}
                size="lg"
                className="color-typography-600"
              />
            </Pressable> */}
            </HStack>
            <VStack space="sm">
              <VStack space="xl">
                {fields.map(({ id, question }, index) => (
                  <HStack key={id} space="lg" className="w-full items-center">
                    <Box className="w-2 h-2 bg-background-400 rounded-full" />

                    <TextInput
                      ref={index === fields.length - 1 ? textareaRef : null}
                      value={question}
                      onChangeText={(text) => {
                        const updatedFields = [...fields];
                        updatedFields[index] = {
                          id,
                          question: text,
                          answers: [],
                        };
                        setFields(updatedFields);
                      }}
                      multiline
                      placeholder={placeholder}
                      textAlignVertical="top"
                      className={cn(
                        TEXT_INPUT_STYLE,
                        'text-lg placeholder:text-typography-400 flex-1',
                      )}
                    />
                    {fields.length > 1 && (
                      <Pressable
                        onPress={() => {
                          handlePressDelete(id);
                        }}
                      >
                        <Icon as={X} size="lg" />
                      </Pressable>
                    )}
                  </HStack>
                ))}
              </VStack>
              <AnimatedPressable onPress={handlePressAdd}>
                <HStack space="xl" className="items-center py-3 w-full">
                  <Box className="border-[1px] border-primary-300 rounded-full p-2">
                    <Icon as={Plus} size="lg" className="color-primary-700" />
                  </Box>
                  <Text
                    size="lg"
                    className="font-pretendard-semi-bold text-typography-600"
                  >
                    추가하기
                  </Text>
                </HStack>
              </AnimatedPressable>
            </VStack>
          </VStack>
        </KeyboardAwareScrollView>
        <HStack space="sm" className="mx-5 mb-6">
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onPress={handlePressRecommendedQuestions}
          >
            <ButtonText>추천 질문 보기</ButtonText>
            <ButtonIcon as={ThumbsUp} />
          </Button>
          <Button size="lg" className="flex-1" onPress={handlePressFinish}>
            <ButtonText>완료</ButtonText>
          </Button>
        </HStack>
      </KeyboardAvoidingView>
      <RecommendedQuestionsBottomSheetContainer>
        <BottomSheetListLayout>
          <BottomSheetListHeader
            label={fieldKey === 'iceBreaking' ? '아이스 브레이킹 추천 질문' : '설교 나눔 추천 질문'}
            onPress={handleCloseRecommendedQuestions}
          />
          <VStack>
            {/* 카테고리 탭 */}
            <HStack className="mb-4 border-b border-background-200">
              {recommendedQuestions.map((category) => (
                <AnimatedPressable
                  key={category.id}
                  scale={0.98}
                  onPress={() => handleSelectCategory(category.id)}
                  className={cn(
                    "py-3 px-4",
                    activeCategoryId === category.id && "border-b-2 border-primary-500"
                  )}
                >
                  <Text
                    size="md"
                    weight="medium"
                    className={cn(
                      activeCategoryId === category.id ? "text-primary-500" : "text-typography-500"
                    )}
                  >
                    {category.title}
                  </Text>
                </AnimatedPressable>
              ))}
            </HStack>

            {/* 현재 선택된 카테고리의 질문 목록 */}
            <VStack space="md" className="mb-4">
              {recommendedQuestions
                .find(category => category.id === activeCategoryId)?.questions
                .map((question) => {
                  const isSelected = question.selected;
                  return (
                    <AnimatedPressable
                      key={question.id}
                      scale={0.98}
                      onPress={() => handleToggleQuestion(activeCategoryId, question.id)}
                      className="py-3"
                    >
                      <HStack className="items-center justify-between">
                        <HStack space="sm" className="items-center flex-1">
                          <Box className="w-2 h-2 bg-background-400 rounded-full" />
                          <Text size="md" className="flex-1">{question.text}</Text>
                        </HStack>
                        {isSelected ? (
                          <Box className="bg-primary-500 rounded-full p-1 w-6 h-6 mr-2">
                            <Icon
                              as={Check}
                              size="sm"
                              color="white"
                            />
                          </Box>
                        ) : (
                          <Box className="border border-primary-500 rounded-full p-1 w-6 h-6 mr-2" />
                        )}
                      </HStack>
                    </AnimatedPressable>
                  );
                })
              }
            </VStack>

            {/* 추가하기 버튼 */}
            <Button
              size="lg"
              className="mt-2"
              onPress={handleAddSelectedQuestions}
            >
              <ButtonText>
                {selectedQuestionsCount > 0
                  ? `${selectedQuestionsCount}개 추가하기`
                  : '닫기'}
              </ButtonText>
            </Button>
          </VStack>
        </BottomSheetListLayout>
      </RecommendedQuestionsBottomSheetContainer>
    </>
  );
}
