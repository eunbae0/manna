import { useEffect, useRef, useState } from 'react';
import type { ClientFellowshipParticipantV2 } from '@/features/fellowship/api/types';
import { useAnswerRecordingStore } from '@/store/fellowship/answer-recording';
import { useToastStore } from '@/store/toast';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Avatar } from '@/components/common/avatar';
import { Text } from '@/shared/components/text';
import { TextInput, Pressable } from 'react-native';
import { ButtonText, ButtonIcon } from '@/components/common/button';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';
import { Brain, Check, ChevronLeft, ChevronRight, LoaderIcon } from 'lucide-react-native';
import { Button } from '@/components/common/button';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { BottomSheetListHeader, BottomSheetListLayout } from '@/components/common/bottom-sheet';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { cn } from '@/shared/utils/cn';
import { Icon } from '#/components/ui/icon';
import { Box } from '#/components/ui/box';
import { GEMINI_API_URL } from '@/shared/constants/url';
import { VolumeMeteringButton } from './VolumeMeteringButton';

// Gemini AI 요약을 위한 프롬프트
const SUMMARY_PROMPT = `
당신은 교회 소그룹 나눔 내용을 요약하는 AI 도우미입니다. 교회에서 설교 말씀을 듣고 한가지 나눔 주제 제시어에 대해 답변한 것입니다.
답변은 음성으로 인식했기 때문에 구문 오류가 있을 수 있습니다.
아래 입력한 내용을 두 가지 다른 스타일로 요약해주세요:

1. 입력한 내용을 기반에서 음성 인식 오류를 수정한 올바른 문장으로, 최대한 내용을 바뀌지 않도록 하는 요약 (50자 이내)
2. 간결하고 핵심만 담은 요약 (50자 이내)

녹음 내용:
{text}

각 요약에는 번호를 꼭 제거해주세요. 그리고 두가지 요약 내용을 plain text로, '+'로 구분해서 제공해주세요.
`;

export function AnswerField({ member, answer, updateAnswer }: { member: ClientFellowshipParticipantV2, answer: string, updateAnswer: (memberId: string, content: string) => void }) {
  const { showSuccess, showInfo } = useToastStore();

  const [localAnswer, setLocalAnswer] = useState(answer);
  const lastUpdateRef = useRef(answer);

  // 디바운스 타이머 참조
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 텍스트 변경 핸들러
  const handleTextChange = (text: string) => {
    setLocalAnswer(text);

    // 이전 타이머가 있으면 취소
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 새 타이머 설정
    timerRef.current = setTimeout(() => {
      if (lastUpdateRef.current !== text) {
        updateAnswer(member.id, text);
        lastUpdateRef.current = text;
      }
      timerRef.current = null;
    }, 500);
  };

  // 외부에서 answer가 변경되었을 때 로컬 상태 동기화
  useEffect(() => {
    if (answer !== lastUpdateRef.current) {
      setLocalAnswer(answer);
      lastUpdateRef.current = answer;
    }
  }, [answer]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);


  // 스토어 접근
  const {
    isRecording,
    isRecordingMode,
    currentMember,
    liveTranscript,
    startListening,
    stopListening,
    clearTranscriptForMember
  } = useAnswerRecordingStore();

  // 현재 멤버 관련 상태 추출
  const isCurrentMember = member.id === currentMember?.id;
  const transcript = liveTranscript.find(
    (item) => item.member.id === member.id,
  )?.transcript;

  // AI 요약 관련 상태
  const [summarizeText, setSummarizeText] = useState('');
  const [aiSummaries, setAiSummaries] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedSummaryIndex, setSelectedSummaryIndex] = useState<number>(-1);

  const isCompleteAiSummarize = selectedSummaryIndex !== -1;

  // AI 요약 생성 함수
  const handleGenerateAiSummaries = async () => {
    if (!summarizeText.trim()) {
      showInfo('요약할 내용이 없어요');
      return;
    }

    setIsLoadingAI(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: SUMMARY_PROMPT.replace('{text}', summarizeText)
            }]
          }]
        })
      });
      const data = await response.json();
      let summaries = [];
      try {
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          summaries = data.candidates[0].content.parts[0].text.split('+').map((text: string) => text.trim());
        } else {
          throw new Error('API 응답 형식이 올바르지 않습니다');
        }
      } catch (error) {
        console.error('AI 응답 처리 오류:', error);
        showInfo('요약 처리 중 오류가 발생했어요. 다시 시도해주세요.');
        return;
      }

      setAiSummaries(summaries);
      setSelectedSummaryIndex(0); // 기본적으로 첫 번째 요약 선택
      showSuccess('AI 요약이 완료되었어요!');
    } catch (error) {
      console.error('AI 요약 생성 오류:', error);
      showInfo('요약 생성 중 오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // 바텀시트 관련 함수
  const { BottomSheetContainer, handleOpen, handleClose } = useBottomSheet({
    onClose: () => {
      setSummarizeText('');
      setAiSummaries([]);
      setSelectedSummaryIndex(-1);
    }
  });

  const handleOpenSummarizeSheet = () => {
    handleOpen();
    setSummarizeText(transcript || '');
    setAiSummaries([]);
    setSelectedSummaryIndex(-1);
  }

  const handleCloseSummarizeSheet = () => {
    handleClose();
    setSummarizeText('');
    setAiSummaries([]);
    setSelectedSummaryIndex(-1);
  }

  // 선택한 요약 적용 및 트랜스크립트 초기화
  const handleApplyRecording = () => {
    // 답변 업데이트
    if (aiSummaries.length > 0 && selectedSummaryIndex >= 0) {
      updateAnswer(member.id, aiSummaries[selectedSummaryIndex]);
      showSuccess('AI 요약이 적용되었어요');
    } else {
      updateAnswer(member.id, summarizeText);
      showSuccess('녹음이 적용되었어요');
    }

    clearTranscriptForMember(member.id);

    handleCloseSummarizeSheet();
  }

  const handleUndoAiSummarize = () => {
    setAiSummaries([]);
    setSelectedSummaryIndex(-1);
  }

  return (
    <>
      <VStack space="md">
        <HStack space="sm" className="items-center">
          <Avatar size="2xs" photoUrl={member.photoUrl || undefined} />
          <Text size="md" className="font-pretendard-semi-bold">
            {member.displayName}
          </Text>
        </HStack>
        <VStack space="xs">
          <HStack space="lg" className="items-center">
            <TextInput
              value={localAnswer}
              placeholder="답변을 입력해주세요"
              onChangeText={handleTextChange}
              multiline
              textAlignVertical="top"
              className={cn(
                TEXT_INPUT_STYLE,
                'flex-1 min-h-28 text-lg py-2 rounded-lg',
              )}
            />
            {isRecordingMode && (
              <VolumeMeteringButton
                onPress={() => {
                  if (isRecording && isCurrentMember) {
                    // 현재 녹음 중인 멤버의 버튼을 누르면 녹음 중지
                    stopListening();
                  } else if (isRecording && !isCurrentMember) {
                    // 다른 멤버가 녹음 중이라면 알림 표시
                    const recordingMember = currentMember?.displayName || '다른 멤버';
                    showInfo(`${recordingMember}님을 녹음 중이에요. 완료 후 시도해주세요.`);
                  } else {
                    // 녹음 중이 아니면 녹음 시작
                    startListening(member);
                  }
                }}
                isRecording={isRecording && isCurrentMember}
                isCurrentMember={isCurrentMember}
                className="mr-3"
              />
            )}
          </HStack>
          {/* Real-time transcription display */}
          {isRecordingMode && (isRecording || transcript) && (
            <VStack space="sm" className="mt-2 p-3 bg-typography-50/80 rounded-md">
              {transcript && transcript.length > 0 ? (
                <Text size="md">{transcript}</Text>
              ) : (
                <VStack space="sm">
                  <Text size="md" className="text-typography-500">녹음 대기 중...</Text>
                  <Text size="md" className="text-typography-500">말을 하면 여기에 기록됩니다.</Text>
                </VStack>
              )}
            </VStack>
          )}
        </VStack>

        {/* Summarize recording button - 녹음이 완료된 후에만 표시 */}
        {isRecordingMode && transcript && !isRecording && (
          <HStack className="justify-end mt-1">
            <Button
              size="sm"
              variant="outline"
              onPress={handleOpenSummarizeSheet}
            >
              <ButtonText>녹음 적용하기</ButtonText>
              <ButtonIcon as={ChevronRight} />
            </Button>
          </HStack>
        )}
      </VStack>
      <BottomSheetContainer>
        <BottomSheetListLayout>
          <BottomSheetListHeader
            label="녹음 적용하기"
            onPress={handleCloseSummarizeSheet}
          />
          <VStack space="sm" className="pt-2 pb-4">
            <Text weight="medium">녹음 내용</Text>
            <BottomSheetTextInput
              defaultValue={summarizeText}
              onChangeText={setSummarizeText}
              multiline
              textAlignVertical="top"
              className={`${TEXT_INPUT_STYLE} min-h-24`}
            />
          </VStack>

          {/* AI 요약 결과 */}
          {aiSummaries.length > 0 && (
            <VStack space="sm" className="pb-4">
              <Text weight="medium">AI 요약 결과</Text>
              <VStack space="xs">
                {aiSummaries.map((summary, index) => (
                  <Pressable
                    key={index}
                    className={cn(
                      "p-3 border rounded-md",
                      selectedSummaryIndex === index ? "border-primary-500 bg-primary-50" : "border-gray-200"
                    )}
                    onPress={() => setSelectedSummaryIndex(index)}
                  >
                    <HStack space="sm" className="items-center">
                      <Text className={cn(selectedSummaryIndex === index ? "text-primary-800" : "text-typography-600", 'flex-1')}>
                        {summary}
                      </Text>
                      {selectedSummaryIndex === index ? (
                        <Box className='w-6 h-6 border border-primary-500 rounded-xl bg-primary-500 items-center justify-center'>
                          <Icon as={Check} size="sm" className="text-primary-50" />
                        </Box>
                      ) : (
                        <Box className='w-6 h-6 border border-primary-500 rounded-xl' />
                      )}
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </VStack>
          )}

          <HStack space="sm">
            <Button
              variant="outline"
              className="flex-1"
              onPress={isCompleteAiSummarize ? handleUndoAiSummarize : handleGenerateAiSummaries}
              disabled={isLoadingAI || !summarizeText.trim()}
            >
              {isCompleteAiSummarize && <ButtonIcon as={ChevronLeft} />}
              <ButtonText>{isLoadingAI ? '요약중...' : isCompleteAiSummarize ? '돌아가기' : 'AI로 요약하기'}</ButtonText>
              {!isCompleteAiSummarize && <ButtonIcon as={isLoadingAI ? LoaderIcon : Brain} />}
            </Button>
            <Button
              className="flex-1"
              onPress={handleApplyRecording}
              disabled={isLoadingAI}
            >
              <ButtonText>{isCompleteAiSummarize ? 'AI 요약 적용하기' : '나눔 답변에 적용하기'}</ButtonText>
              <ButtonIcon as={Check} />
            </Button>
          </HStack>
        </BottomSheetListLayout>
      </BottomSheetContainer>
    </>
  );
}
