import { HStack } from "#/components/ui/hstack";
import { Icon } from "#/components/ui/icon";
import { openAppStoreReview } from "@/shared/utils/revies";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { Star } from "lucide-react-native";

export const BANNER_DATA = [
  {
    title: '설교 노트를 작성해보세요',
    description: '소그룹 나눔에 공유 가능!',
    lottieView: <LottieView
      source={require('../../../../assets/lotties/notes.json')}
      autoPlay
      loop
      style={{
        width: 58,
        height: 58,
      }}
    />,
    onPress: () => {
      router.push('/(app)/(tabs)/note');
    }
  },
  {
    title: '앱스토어 리뷰를 작성해주세요 🙌',
    description: '정성이 담긴 리뷰는 개발자에게 큰 힘이 됩니다',
    lottieView:
      <HStack className="items-end">
        <Icon as={Star} size="2xl" className="text-yellow-500" />
        <Icon as={Star} size="md" className="text-yellow-500 mr-2" />
      </HStack>,
    onPress: openAppStoreReview,
  }
]

export const HOME_BANNER_AUTO_PLAY_INTERVAL = 4 * 1000;
