import { HStack } from "#/components/ui/hstack";
import { VStack } from "#/components/ui/vstack";
import { HousePlus, UserPlus } from "lucide-react-native";
import { Text } from '@/shared/components/text'
import { Icon } from "#/components/ui/icon";
import AnimatedPressable from "@/components/common/animated-pressable";
import { router } from "expo-router";

export function HomeUserGroupNotExisted() {
  return (
    <VStack space="2xl" className="w-full pt-2">
      <Text size="lg" weight="medium" className="text-typography-600">참여 중인 소그룹이 없어요. 그룹에 참여하거나 만들어 보세요!</Text>
      <HStack space="sm" className="w-full items-center justify-start">
        <AnimatedPressable withBackground onPress={() => router.push('/(app)/(group)/create-group')}>
          <HStack space="sm" className="px-4 py-2 items-center justify-center border border-primary-500 bg-primary-500 rounded-xl">
            <Text size="md" weight="medium" className="text-typography-0">소그룹 만들기</Text>
            <Icon as={HousePlus} size="md" className="text-typography-0" />
          </HStack>
        </AnimatedPressable>
        <AnimatedPressable withBackground onPress={() => router.push('/(app)/(group)/join-group')}>
          <HStack space="sm" className="px-4 py-2 items-center justify-center border border-primary-500 rounded-xl">
            <Text size="md" weight="medium" className="text-primary-600">소그룹 참여하기</Text>
            <Icon as={UserPlus} size="md" className="text-primary-600" />
          </HStack>
        </AnimatedPressable>
      </HStack>
    </VStack>
  )
}