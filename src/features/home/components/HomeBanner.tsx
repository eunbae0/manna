import { View } from "react-native";
import { Text } from "@/shared/components/text";

export function HomeBanner() {
  return (
    <View className="relative mx-4 h-24 rounded-3xl overflow-hidden">
      <View className="w-full h-24 bg-gray-200" />
      <View className="absolute bottom-2 right-3 bg-black opacity-30 rounded-full px-2 py-1" >
        <Text size="xs" className="text-typography-0">1 / 2</Text>
      </View>
    </View>
  )
}