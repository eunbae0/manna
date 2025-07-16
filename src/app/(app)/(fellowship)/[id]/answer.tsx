import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { Heading } from '@/shared/components/heading';
import { useFellowship } from '@/features/fellowship/hooks/useFellowship';
import Header from '@/components/common/Header';
import { KeyboardAwareScrollView } from '@/shared/components/KeyboardAwareScrollView';
import { KeyboardToolbar } from '@/shared/components/KeyboardToolbar';
import { AnswerField } from '@/features/fellowship/components/answer/AnswerField';
import Divider from '@/shared/components/divider';

export default function AnswerScreen() {
  const { id, contentType, answerId } = useLocalSearchParams<{
    id: string;
    contentType: 'iceBreaking' | 'sermonTopic' | 'prayerRequest';
    answerId: string;
  }>();

  const { fellowship, isLoading, error, updateFellowship } = useFellowship(id as string);

  const isPrayerRequest = contentType === 'prayerRequest';

  const updateAnswer = (memberId: string, content: string) => {
    updateFellowship(
      {
        content: {
          categories: {
            [contentType]: {
              items: {
                [answerId]: {
                  answers: {
                    [memberId]: content,
                  },
                },
              },
            },
          },
        },
      },
    );
  };

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
        <VStack space="xs">
          <Header />
          <KeyboardAwareScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
            {!isPrayerRequest && (
              <>
                <VStack space="md" className="px-4 pt-2 pb-4">
                  <Heading size="2xl">현재 질문</Heading>
                  <Text size="lg">
                    {fellowship.content.categories[contentType].items[answerId].title}
                  </Text>
                </VStack>

                <Divider size="lg" className="my-2" />
              </>
            )}
            <VStack space="4xl" className="mx-4 mt-2 mb-32">
              <VStack space="xl">
                <VStack space="2xl" className="pt-2">
                  <Heading size="2xl">{isPrayerRequest ? '기도제목 작성' : '나눔 답변 작성'}</Heading>
                  <VStack className="gap-10">
                    {fellowship.info.participants.map((member) => (
                      <AnswerField
                        key={member.id}
                        member={member}
                        answer={fellowship.content.categories[contentType].items[answerId].answers[member.id] || ''}
                        updateAnswer={updateAnswer}
                      />
                    ))}
                  </VStack>
                </VStack>
              </VStack>
            </VStack>
          </KeyboardAwareScrollView>
        </VStack>
      </SafeAreaView>
      <KeyboardToolbar />
    </>
  );
}
