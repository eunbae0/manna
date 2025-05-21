import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { Heading } from '@/shared/components/heading';
import { Button, ButtonText, ButtonIcon } from '@/components/common/button';
import { useFellowship } from '@/features/fellowship/hooks/useFellowship';
import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';
import { useToastStore } from '@/store/toast';
import { Mic, PencilLine } from 'lucide-react-native';
import { router } from 'expo-router';
import Header from '@/components/common/Header';
import type {
  ClientFellowshipContentField,
} from '@/features/fellowship/api/types';
import {
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { Divider } from '#/components/ui/divider';
import { KeyboardAwareScrollView } from '@/shared/components/KeyboardAwareScrollView';
import { KeyboardToolbar } from '@/shared/components/KeyboardToolbar';
import { usePreventBackWithConfirm } from '@/shared/hooks/usePreventBackWithConfirm';
import { ExitConfirmModal } from '@/components/common/exit-confirm-modal';
import { useAnswerRecordingStore } from '@/store/fellowship/answer-recording';
import { useAnswerDataStore } from '@/store/fellowship/answer-data';
import { AnswerField } from '@/features/fellowship/components/AnswerField';

export default function AnswerScreen() {
  const { id, contentType, index } = useLocalSearchParams<{
    id: string;
    contentType: 'iceBreaking' | 'sermonTopic' | 'prayerRequest';
    index?: string;
  }>();

  const { fellowship, isLoading, error, updateFellowship } = useFellowship(id as string);
  const { showInfo } = useToastStore();

  // 스토어 접근
  const answerRecordingStore = useAnswerRecordingStore();
  const answerDataStore = useAnswerDataStore();

  // 뒤로가기 방지
  const { bottomSheetProps, handleExit } = usePreventBackWithConfirm({
    condition: true,
  });

  const isPrayerRequest = contentType === 'prayerRequest';

  // 저장 버튼 핸들러
  const handlePressSaveButton = () => {
    if (!fellowship || !contentType) return;

    const fellowshipContents = isPrayerRequest ? undefined : fellowship.content[contentType];
    const filteredAnswers = answerDataStore.getFilteredAnswers();

    const newContent = {
      id: answerDataStore.contentId as string,
      question: answerDataStore.question as string,
      answers: filteredAnswers,
    } satisfies ClientFellowshipContentField;

    // 콘텐츠 업데이트
    const newContents =
      isPrayerRequest
        ? { answers: filteredAnswers }
        : fellowshipContents?.map((topic) =>
          topic.id === newContent.id ? newContent : topic,
        );

    updateFellowship({ content: { [contentType]: newContents } });
    router.dismissTo(`/(app)/(fellowship)/${id}`);
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (fellowship && contentType && index !== undefined) {
      const existedPrayerRequest = fellowship.content.prayerRequest?.answers;
      const existedContents = isPrayerRequest ? undefined : fellowship.content[contentType][Number(index)];
      console.log(fellowship.content)
      answerDataStore.setInitialData({
        members: fellowship.info.members,
        existingContent: isPrayerRequest ? undefined : existedContents,
        existingPrayerRequestAnswers: isPrayerRequest ? existedPrayerRequest : undefined,
        contentType,
      });
    }

    // 컴포넌트 언마운트 시 스토어 초기화
    return () => {
      answerRecordingStore.reset();
      answerDataStore.reset();
    };
  }, [isPrayerRequest, fellowship, contentType, index]);

  // 음성 인식 이벤트 리스너
  useSpeechRecognitionEvent('start', () => {
    answerRecordingStore.setIsRecording(true);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const currentMember = answerRecordingStore.currentMember;
    if (!currentMember) return;

    if (event.results && event.results.length > 0) {
      const transcript = event.results[0]?.transcript || '';
      answerRecordingStore.updateTranscript(currentMember, transcript);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    answerRecordingStore.setIsRecording(false);
    answerRecordingStore.setCurrentMember(null);
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.log('error code:', event.error, 'error message:', event.message);
    showInfo('음성 인식 중 오류가 발생했어요');
    answerRecordingStore.setIsRecording(false);
  });

  // 로딩 상태
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <VStack
          space="md"
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text>로딩 중...</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (error || !fellowship) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <VStack
          space="md"
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text>나눔 정보를 불러올 수 없어요</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView className="flex-1">
          <VStack space="xs" className="flex-1">
            <Header className="justify-between pr-3">
              <Button variant='text' size="lg" onPress={handlePressSaveButton}>
                <ButtonText>저장하기</ButtonText>
              </Button>
            </Header>
            {!isPrayerRequest && (
              <>
                <VStack space="md" className="px-4 pt-2 pb-6">
                  <Heading size="2xl">현재 질문</Heading>
                  <Text size="lg">
                    {answerDataStore.question}
                  </Text>
                </VStack>

                <Divider />
              </>
            )}
            <VStack space="4xl" className="mx-4 mt-2 mb-4 flex-1">
              <VStack space="xl" className="flex-1">
                <KeyboardAwareScrollView showsVerticalScrollIndicator={false} className="flex-1">
                  <VStack space="2xl" className="pt-2">
                    <HStack className="justify-between items-center">
                      <Heading size="2xl">{isPrayerRequest ? '기도제목 작성' : '나눔 답변 작성'}</Heading>
                      <Button
                        variant="text"
                        onPress={() => answerRecordingStore.toggleRecordingMode()}
                      >
                        <ButtonText>
                          {answerRecordingStore.isRecordingMode
                            ? '텍스트 모드로 전환'
                            : '녹음 모드로 전환'
                          }
                        </ButtonText>
                        <ButtonIcon
                          as={answerRecordingStore.isRecordingMode ? PencilLine : Mic}
                        />
                      </Button>
                    </HStack>
                    <VStack space="3xl">
                      {fellowship.info.members.map((member) => (
                        <AnswerField
                          key={member.id}
                          member={member}
                        />
                      ))}
                    </VStack>
                  </VStack>
                </KeyboardAwareScrollView>
              </VStack>
            </VStack>
          </VStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <KeyboardToolbar />
      <ExitConfirmModal {...bottomSheetProps} onExit={handleExit} />
    </>
  );
}
