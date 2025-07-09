import { Pressable, View } from "react-native";
import { Text } from "@/shared/components/text";
import { VStack } from "#/components/ui/vstack";
import { HStack } from "#/components/ui/hstack";
import { Icon } from "#/components/ui/icon";
import { ChevronRight } from "lucide-react-native";
import LottieView from "lottie-react-native";
import { router } from "expo-router";

export function HomeBanner() {
  return (
    <Pressable onPress={() => { router.push('/(app)/(tabs)/note') }}>
      <View className="relative bg-background-100/70 mx-4 h-24 rounded-3xl overflow-hidden border border-primary-100">
        <HStack className="w-full h-24 pl-5 pr-2 items-center justify-between">
          <VStack space="xs">
            <Text size="lg" className="text-typography-700">소그룹원들과 공유 가능!</Text>
            <HStack className="gap-px items-center">
              <Text size="xl" weight="bold" className="text-typography-900">지금 설교 노트를 작성해보세요</Text>
              <Icon as={ChevronRight} className="text-typography-900" />
            </HStack>
          </VStack>
          <LottieView
            source={require('../../../../assets/lotties/notes.json')}
            autoPlay
            loop
            style={{
              width: 58,
              height: 58,
            }}
          />
        </HStack>
        <View className="absolute bottom-2 right-3 bg-black opacity-30 rounded-full px-[6px] py-px" >
          <Text size="xs" className="text-typography-0">1 / 1</Text>
        </View>
      </View>
    </Pressable>
  )
}