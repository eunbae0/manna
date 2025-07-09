import { HStack } from "#/components/ui/hstack";
import { Button, ButtonIcon } from "@/components/common/button";
import { Image } from 'expo-image';
import { router } from "expo-router";
import { Bell } from "lucide-react-native";

export function HomeHeader() {
  const handlePressNotification = () => {
    router.push('/(app)/notification')
  }

  return (
    <HStack className="pl-5 pr-3 pb-3 w-full items-center justify-between">
      <Image
        source={require('../../../../assets/images/icons/manna_icon_white.png')}
        style={{ width: 40, height: 40 }}
        contentFit="contain"
      />
      <Button variant="icon" size="lg" onPress={handlePressNotification}>
        <ButtonIcon as={Bell} />
      </Button>
    </HStack>
  )
}