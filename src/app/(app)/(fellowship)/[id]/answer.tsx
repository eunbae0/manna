import { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Pressable, View, ActivityIndicator } from 'react-native';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import { Heading } from '@/shared/components/heading';
import { Button, ButtonText, ButtonIcon } from '@/components/common/button';
import { useFellowship } from '@/features/fellowship/hooks/useFellowship';
import { Avatar } from '@/components/common/avatar';
import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import { cn } from '@/shared/utils/cn'; // 올바른 유틸리티 경로로 수정
import { useToastStore } from '@/store/toast';
import * as Clipboard from 'expo-clipboard';
import { Mic, MicOff, Copy, ArrowLeft } from 'lucide-react-native';
import { Icon } from '#/components/ui/icon';
import { router } from 'expo-router';
import Header from '@/components/common/Header'; // default import로 수정
import type { ClientFellowshipMember, ClientFellowshipContentField } from '@/features/fellowship/api/types';
import AnimatedPressable from '@/components/common/animated-pressable';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { Divider } from '#/components/ui/divider';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { BottomSheetListHeader, BottomSheetListLayout } from '@/components/common/bottom-sheet';

// Speech Recognition 타입 정의
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  isTrusted: boolean;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

const SpeechRecognition = {
  startListening: async (): Promise<boolean> => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted", result);
      return false;
    }
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "ko-KR",
      interimResults: true,
      continuous: false,
    });
    console.log('녹음 시작');
    return true;
  },
  stopListening: async (): Promise<boolean> => {
    ExpoSpeechRecognitionModule.stop();
    console.log('녹음 중지');
    return true;
  },
  isListening: false,
  onResult: null as ((event: SpeechRecognitionEvent) => void) | null,
};


interface Transcript {
  memberId: string;
  text: string;
  timestamp: Date;
  id?: string; // 고유 식별자 추가
}


export default function AnswerScreen() {
  const { id, contentType, index } = useLocalSearchParams<{ id: string; contentType: 'iceBreaking' | 'sermonTopic'; index?: string }>();
  const { fellowship, isLoading, error } = useFellowship(id as string);

  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { showInfo, showSuccess } = useToastStore();
  const [currentAnswer, setCurrentAnswer] = useState('');

  const {
    handleOpen,
    handleClose,
    BottomSheetContainer,
  } = useBottomSheet();

  useEffect(() => {
    // 컴포넌트 마운트 시 첫 번째 멤버 선택
    if (fellowship?.info.members && fellowship.info.members.length > 0) {
      setSelectedMemberId(fellowship.info.members[0].id);
    }
  }, [fellowship]);

  useEffect(() => {
    // 스크롤 뷰 자동 스크롤
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timer);
  }, []);  // 의존성 제거

  // transcripts가 변경될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    if (transcripts.length > 0) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [transcripts.length]);  // transcripts 전체 대신 length만 의존성으로 사용

  // 음성 인식 이벤트 처리
  useSpeechRecognitionEvent("start", () => {
    setIsRecording(true);
    setCurrentTranscript('');
  });

  useSpeechRecognitionEvent("result", (event) => {
    // 인식 결과가 있을 때마다 현재 텍스트 업데이트
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0]?.transcript || '';
      setCurrentTranscript(transcript);
    }
  });

  useSpeechRecognitionEvent("end", () => {
    // 음성 인식이 끝났을 때 transcripts 배열에 결과 추가
    if (currentTranscript) {
      const now = new Date();
      setTranscripts(prev => [
        ...prev,
        {
          memberId: selectedMemberId,
          text: currentTranscript,
          timestamp: now,
          id: `${selectedMemberId}-${now.getTime()}` // 고유 ID 생성
        }
      ]);
      setCurrentTranscript('');
    }
    setIsRecording(false);
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.log("error code:", event.error, "error message:", event.message);
    showInfo('음성 인식 중 오류가 발생했어요');
    setIsRecording(false);
  });

  const handlePressMember = async (memberId: string) => {
    // 녹음 중이라면 현재 트랜스크립트를 저장하고 새 발화자로 계속 녹음
    if (isRecording && selectedMemberId !== memberId) {
      // 현재 음성 인식 세션 중단
      await SpeechRecognition.stopListening();

      // 현재 트랜스크립트를 저장 (내용이 있는 경우에만)
      if (currentTranscript) {
        const newTranscript: Transcript = {
          memberId: selectedMemberId,
          text: currentTranscript,
          timestamp: new Date(),
          id: `${Date.now()}-${selectedMemberId}`
        };
        setTranscripts(prev => [...prev, newTranscript]);
      }

      // 발화자 변경
      setSelectedMemberId(memberId);
      setCurrentTranscript(''); // 새 발화자를 위해 현재 트랜스크립트 초기화

      // 새 음성 인식 세션 시작
      setTimeout(async () => {
        await SpeechRecognition.startListening();
      }, 100); // 약간의 지연 시간을 두고 다시 시작
    } else {
      // 녹음 중이 아니라면 단순히 발화자만 변경
      setSelectedMemberId(memberId);
    }
  };

  const startRecording = async () => {
    try {
      const started = await SpeechRecognition.startListening();
      if (!started) {
        showInfo('음성 인식을 시작할 수 없어요');
      }
    } catch (error) {
      console.error('녹음 시작 오류:', error);
      showInfo('음성 인식을 시작할 수 없어요');
    }
  };

  const stopRecording = async () => {
    try {
      await SpeechRecognition.stopListening();
      setIsRecording(false);
      setCurrentTranscript('');
    } catch (error) {
      console.error('녹음 중지 오류:', error);
    }
  };

  // AI 요약 기능 (실제 API 호출은 추후 구현)
  const generateSummary = async () => {
    setIsProcessingSummary(true);
    // 여기에 실제 AI API 호출 로직이 추가될 예정
    setTimeout(() => {
      setIsProcessingSummary(false);
      showSuccess('요약이 완료되었어요! 각 멤버의 답변에 추가되었습니다.');
      // 여기서 fellowship 답변 업데이트 로직이 추가될 예정
      router.back();
    }, 2000);
  };

  const handleOpenSelect = (script: string) => {
    handleOpen();
    setCurrentAnswer(script);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <VStack space="md" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>로딩 중...</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  if (error || !fellowship) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <VStack space="md" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>나눔 정보를 불러올 수 없어요</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView>
          <VStack space="md">
            <Header />
            <VStack space="md" className="px-4 pb-4">
              <Heading size="2xl">현재 질문</Heading>
              <Text size="lg">
                {fellowship.content?.[contentType]?.[Number(index)]?.question || '질문이 없습니다'}
              </Text>
            </VStack>

            <Divider />
            {/* 녹음 결과 영역 - 스크롤 가능한 영역 */}
            <VStack space="4xl" className="px-4 mb-4">
              <VStack space="xl">
                <Heading size="2xl">녹음 내용</Heading>
                <ScrollView
                  ref={scrollViewRef}
                  className="max-h-72" // 높이 제한을 두어 스크롤 되도록 함
                  showsVerticalScrollIndicator={false}
                >
                  <VStack space="lg">
                    {transcripts.map((transcript) => {
                      const speaker = fellowship.info.members?.find((m: ClientFellowshipMember) => m.id === transcript.memberId);
                      // timestamp와 memberId를 조합한 고유 키 생성
                      const uniqueKey = transcript.id || `${transcript.timestamp.getTime()}-${transcript.memberId}`;
                      return (
                        <VStack key={uniqueKey} space="md">
                          <HStack space="sm" className="items-center">
                            <Avatar
                              size="2xs"
                              photoUrl={speaker?.photoUrl || undefined}
                            />
                            <Text size="md">{speaker?.displayName}</Text>
                          </HStack>
                          <HStack space="md" className="justify-between">
                            <Text size="md" className="pl-3 flex-1">{transcript.text}</Text>
                            <Button variant="icon" onPress={() => handleOpenSelect(transcript.text)}>
                              <ButtonIcon as={Mic} />
                            </Button>
                          </HStack>
                        </VStack>
                      );
                    })}

                    {currentTranscript && (
                      <VStack space="md">
                        <HStack space="sm" className="items-center">
                          <Avatar
                            size="xs"
                            photoUrl={fellowship.info.members?.find((m: ClientFellowshipMember) => m.id === selectedMemberId)?.photoUrl || undefined}
                          />
                          <Text size="md" className="font-pretendard-semi-bold">
                            {fellowship.info.members?.find((m: ClientFellowshipMember) => m.id === selectedMemberId)?.displayName}
                          </Text>
                        </HStack>
                        <Text size="md" className="pl-3">{currentTranscript}</Text>
                      </VStack>
                    )}
                  </VStack>
                </ScrollView>
              </VStack>
            </VStack>
          </VStack>
        </KeyboardAvoidingView>
        <VStack space="4xl" className="px-4 pt-6 mb-4 border-t border-x rounded-2xl border-background-300">
          {/* 멤버 선택 */}
          <VStack space="xl">
            <Heading size="xl">발화자 선택</Heading>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always">
              <HStack space="sm">
                {fellowship.info.members?.map((member: ClientFellowshipMember) => (
                  <AnimatedPressable
                    key={member.id}
                    onPress={() => handlePressMember(member.id)}
                  >
                    <HStack
                      space="sm"
                      className={`pb-2 ${selectedMemberId === member.id ? 'border-b-2 border-primary-500' : ''}`}
                    >
                      <Avatar size="xs" photoUrl={member.photoUrl || undefined} />
                      <Text size="md">{member.displayName}</Text>
                    </HStack>
                  </AnimatedPressable>
                ))}
              </HStack>
            </ScrollView>
          </VStack>
          {/* 버튼 영역 */}
          {isRecording ? (
            <Button
              size="lg"
              variant="outline"
              onPress={stopRecording}
            >
              <ButtonIcon as={MicOff} color="#ef4444" />
              <ButtonText>녹음 종료하기</ButtonText>
            </Button>
          ) : (
            <Button
              size="lg"
              variant="outline"
              onPress={startRecording}
            >
              <ButtonIcon as={Mic} />
              <ButtonText>대화 녹음하기</ButtonText>
            </Button>
          )}
        </VStack>
      </SafeAreaView>
      <BottomSheetContainer>
        <BottomSheetListLayout>
          <BottomSheetListHeader
            label="답변 관리"
            onPress={handleClose}
          />
          <VStack>
            <Heading>
              답변
            </Heading>
            <Text>
              {currentAnswer}
            </Text>
          </VStack>

          {transcripts.length > 0 && !isRecording && (
            <Button
              size="lg"
              onPress={generateSummary}
              disabled={isProcessingSummary}
            >
              {isProcessingSummary ? (
                <HStack space="xs" style={{ alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <ButtonText>요약 중...</ButtonText>
                </HStack>
              ) : (
                <ButtonText>AI로 요약하기</ButtonText>
              )}
            </Button>
          )}
        </BottomSheetListLayout>
      </BottomSheetContainer>
    </>
  );
}