import React, { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import Header from '@/components/common/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Alert } from 'react-native';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { Button, ButtonText } from '@/components/common/button';
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import {
  GripVertical,
  HelpingHand,
  MessageSquare,
  Presentation,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Heading from '@/shared/components/heading';
import { cn } from '@/shared/utils/cn';
import { useToastStore } from '@/store/toast';
import { Icon } from '#/components/ui/icon';
import { goBackOrReplaceHome } from '@/shared/utils/router';

// 섹션 타입 정의
interface SectionItem {
  id: string;
  title: string;
  key: 'fellowship' | 'prayerRequest' | 'board';
  enabled: boolean;
}

// 기본 섹션 순서
const DEFAULT_SECTIONS: SectionItem[] = [
  {
    id: '1',
    title: '최근 나눔',
    key: 'fellowship',
    enabled: true,
  },
  {
    id: '2',
    title: '최근 기도 제목',
    key: 'prayerRequest',
    enabled: true,
  },
  {
    id: '3',
    title: '게시판 최근 글',
    key: 'board',
    enabled: true,
  },
];

// AsyncStorage 키
const SECTIONS_ORDER_KEY = '@manna-client/main-screen-sections-order';

export default function MainOrderSetting() {
  const [sections, setSections] = useState<SectionItem[]>(DEFAULT_SECTIONS);
  const [hasChanges, setHasChanges] = useState(false);

  const { showSuccess, showError } = useToastStore();

  const getSectionIcon = useCallback((key: SectionItem['key']) => {
    switch (key) {
      case 'fellowship':
        return MessageSquare;
      case 'prayerRequest':
        return HelpingHand;
      case 'board':
        return Presentation;
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    const loadSectionsOrder = async () => {
      try {
        const savedSectionsJson =
          await AsyncStorage.getItem(SECTIONS_ORDER_KEY);
        if (savedSectionsJson) {
          const savedSections = JSON.parse(savedSectionsJson);
          setSections(savedSections);
        }
      } catch (error) {
        console.error('Failed to load sections order:', error);
      }
    };

    loadSectionsOrder();
  }, []);

  // 순서 변경 핸들러
  const handleDragEnd = useCallback(({ data }: { data: SectionItem[] }) => {
    setSections(data);
    setHasChanges(true);
  }, []);

  // 섹션 활성화/비활성화 토글
  const toggleSectionEnabled = useCallback((id: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, enabled: !section.enabled } : section,
      ),
    );
    setHasChanges(true);
  }, []);

  // 변경사항 저장
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const saveChanges = useCallback(async () => {
    try {
      await AsyncStorage.setItem(SECTIONS_ORDER_KEY, JSON.stringify(sections));

      router.replace('/(app)/(tabs)');

      showSuccess('메인 화면 설정이 저장되었어요.');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save sections order:', error);
      showError('설정을 저장하는 중 오류가 발생했어요.');
    }
  }, [sections]);

  // 기본 설정으로 초기화
  const resetToDefault = useCallback(() => {
    Alert.alert(
      '초기화',
      '메인 화면 설정을 기본값으로 되돌릴까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => {
            setSections(DEFAULT_SECTIONS);
            setHasChanges(true);
          },
        },
      ],
      { cancelable: true },
    );
  }, []);

  // 섹션 렌더링 함수
  const renderItem = useCallback(
    ({ item, drag }: { item: SectionItem; drag: () => void }) => {
      return (
        <ScaleDecorator activeScale={1.03}>
          <HStack className="px-2 py-4 items-center justify-between">
            <HStack space="sm" className="items-center">
              <Icon as={getSectionIcon(item.key)} size="md" className="text-primary-400" />
              <Text
                size="lg"
                weight={item.enabled ? 'bold' : 'semi-bold'}
                className={cn(
                  item.enabled ? 'text-typography-900' : 'text-typography-500',
                )}
              >
                {item.title}
              </Text>
            </HStack>
            <HStack space="md" className="items-center">
              <Button
                size="sm"
                variant={item.enabled ? 'outline' : 'solid'}
                onPress={() => toggleSectionEnabled(item.id)}
              >
                <ButtonText>{item.enabled ? '숨기기' : '표시하기'}</ButtonText>
              </Button>
              <View onTouchStart={drag}>
                <GripVertical size={24} color="#666" />
              </View>
            </HStack>
          </HStack>
        </ScaleDecorator>
      );
    },
    [toggleSectionEnabled, getSectionIcon],
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />
      <VStack className="flex-1 px-4">
        <VStack space="lg" className="py-4">
          <Heading size="2xl">메인 화면 편집하기</Heading>
          <VStack space="xs">
            <Text size="md" className="text-typography-500">
              섹션을 드래그하여 메인 화면의 순서를 변경하거나,
            </Text>
            <Text size="md" className="text-typography-500">
              표시 여부를 설정해보세요.
            </Text>
          </VStack>
        </VStack>

        <DraggableFlatList
          data={sections}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          containerStyle={{ flex: 1 }}
        />

        <HStack space="sm" className="mt-6 mb-2">
          <Button
            variant="outline"
            action="secondary"
            size="lg"
            onPress={resetToDefault}
            className="flex-1"
          >
            <ButtonText>초기화</ButtonText>
          </Button>
          <Button
            variant="solid"
            action="primary"
            size="lg"
            onPress={saveChanges}
            disabled={!hasChanges}
            className="flex-1"
          >
            <ButtonText>완료</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </SafeAreaView>
  );
}
