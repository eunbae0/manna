import { useState, useMemo, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/common/Header';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { Divider } from '#/components/ui/divider';
import { Icon } from '#/components/ui/icon';
import { Pin } from 'lucide-react-native';
import { cn } from '@/shared/utils/cn';
import AnimatedPressable from '@/components/common/animated-pressable';
import { fetchAllNotices } from '@/api/notice';
import type { Notice } from '@/api/notice';
import { formatLocalDate } from '@/shared/utils/date';

export default function NoticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [expandedNotice, setExpandedNotice] = useState<string | null>(id || null);

  // React Query를 사용하여 공지사항 데이터 가져오기
  const { data: notices, isLoading, isError } = useQuery({
    queryKey: ['notices'],
    queryFn: fetchAllNotices,
  });

  // 공지사항을 핀 고정 여부와 날짜순으로 정렬
  const sortedNotices = useMemo(() => {
    if (!notices) return [];

    return [...notices].sort((a, b) => {
      // 핀 고정된 공지사항을 먼저 표시
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // 날짜 기준 내림차순 정렬 (최신순)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [notices]);

  // URL에서 전달된 id가 있으면 해당 공지사항을 펼침
  useEffect(() => {
    if (id && notices) {
      const noticeExists = notices.some(notice => notice.id === id);
      if (noticeExists) {
        setExpandedNotice(id);
      }
    }
  }, [id, notices]);

  // 공지사항 아이템 렌더링
  const renderNoticeItem = ({ item, index }: { item: Notice; index: number }) => {
    const isExpanded = expandedNotice === item.id;
    const formattedDate = formatLocalDate(item.date)

    return (
      <VStack>
        <AnimatedPressable
          scale="sm"
          onPress={() => setExpandedNotice(isExpanded ? null : item.id)}
          className="py-6"
        >
          <VStack space="xs">
            <HStack className="items-center justify-between">
              <HStack space="sm" className="items-center flex-1">
                {item.isPinned && (
                  <Icon as={Pin} size="md" className="text-primary-500" />
                )}
                <Text
                  size="xl"
                  weight="semi-bold"
                  className={cn(
                    "flex-1",
                    item.isPinned && "text-primary-600"
                  )}
                >
                  {item.title}
                </Text>
              </HStack>
              <Text size="sm" className="text-typography-400">
                {formattedDate}
              </Text>
            </HStack>

            {isExpanded && (
              <VStack space="sm" className="mt-2">
                <Text size="md" className="text-typography-600 leading-6">
                  {item.content}
                </Text>
              </VStack>
            )}
          </VStack>
        </AnimatedPressable>
        {index < sortedNotices.length - 1 && <Divider />}
      </VStack>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-50">
        <Header label="공지사항" className="mb-4" />
        <VStack className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4">공지사항을 불러오는 중이에요</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  if (isError || !notices) {
    return (
      <SafeAreaView className="flex-1 bg-background-50">
        <Header label="공지사항" className="mb-4" />
        <VStack className="flex-1 items-center justify-center p-4">
          <Text size="lg" weight="bold" className="text-error-500 mb-2">공지사항을 불러올 수 없어요</Text>
          <Text className="text-center">잠시 후 다시 시도해주세요</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-50">
      <Header label="공지사항" className="mb-4" />
      {sortedNotices.length === 0 ? (
        <VStack className="flex-1 items-center justify-center p-4">
          <Text size="lg" className="text-typography-400">등록된 공지사항이 없어요</Text>
        </VStack>
      ) : (
        <FlatList
          data={sortedNotices}
          renderItem={renderNoticeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}