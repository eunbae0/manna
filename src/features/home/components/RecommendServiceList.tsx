import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { VStack } from '#/components/ui/vstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import Heading from '@/shared/components/heading';
import { FlashList } from '@shopify/flash-list';
import {
  ChevronRight,
  Info,
  MessageCircleReply,
  NotebookPen,
  type LucideIcon,
} from 'lucide-react-native';
import { Text } from '@/shared/components/text';
import { type Href, router } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '@/store/auth';

type ServiceListItem = {
  id: number;
  label: string;
  linkTo: Href;
  icon: LucideIcon;
  color: string;
};

const RECOMMEND_SERVICE_LIST: Array<ServiceListItem> = [
  {
    id: 1,
    label: '설교 노트 작성하기',
    linkTo: '/(app)/(tabs)/note',
    icon: NotebookPen,
    color: 'text-primary-400',
  },
  {
    id: 2,
    label: '만나 사용설명서 확인하기',
    linkTo: '/(app)/(more)/support',
    icon: Info,
    color: 'text-blue-500',
  },
  {
    id: 3,
    label: '개발자에게 피드백 보내기',
    linkTo: '/(app)/(more)/(feedback)/feedback-index',
    icon: MessageCircleReply,
    color: 'text-purple-600',
  },
];

export function RecommendServiceList() {
  const { user } = useAuthStore();
  return (
    <VStack space="lg" className="py-1 items-center justify-center w-full">
      <Heading size="2xl" className="px-5 w-full">
        {user?.displayName}님을 위한 추천 서비스
      </Heading>
      <View style={{ width: '100%' }}>
        <FlashList
          data={RECOMMEND_SERVICE_LIST}
          renderItem={({ item }) => <ServiceItem item={item} />}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={100}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </VStack>
  );
}

function ServiceItem({
  item,
}: { item: (typeof RECOMMEND_SERVICE_LIST)[number] }) {
  return (
    <AnimatedPressable className="rounded-2xl" onPress={() => router.push(item.linkTo)} withBackground>
      <HStack className="w-full px-6 py-5 items-center justify-between">
        <HStack space="lg" className="items-center">
          <Icon as={item.icon} size="xl" className={item.color} />
          <Text weight='semi-bold' size="xl" className="text-typography-800">{item.label}</Text>
        </HStack>
        <Icon as={ChevronRight} size="xl" className="text-typography-500" />
      </HStack>
    </AnimatedPressable>
  );
}
