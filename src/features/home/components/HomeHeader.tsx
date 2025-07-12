import { HStack } from "#/components/ui/hstack";
import { Button, ButtonIcon } from "@/components/common/button";
import { useNotifications } from "@/features/notification/hooks/useNotifications";
import { Image } from 'expo-image';
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import { View } from "react-native";

export function HomeHeader() {
  const handlePressNotification = () => {
    router.push('/(app)/notification')
  }

  const { unreadCount } = useNotifications()

  const isUnread = unreadCount > 0

  return (
    <HStack className="pl-5 pr-3 pb-3 w-full items-center justify-between">
      <Image
        source={require('../../../../assets/images/icons/manna_icon_white.png')}
        style={{ width: 40, height: 40 }}
        contentFit="contain"
      />
      <View>
        <Button variant="icon" size="lg" onPress={handlePressNotification}>
          <ButtonIcon as={Bell} />
        </Button>
        {isUnread && <View className="absolute top-2 right-2 w-[5px] h-[5px] rounded-full bg-red-500" />}
      </View>
    </HStack>
  )
}