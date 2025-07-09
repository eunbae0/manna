import { useSharedValue } from 'react-native-reanimated';
import { withSpring } from 'react-native-reanimated';

export function useLikeAnimation(hasLiked: boolean) {
	const heartScale = useSharedValue(1);
	const heartTranslateY = useSharedValue(0);

	const performLikeAnimation = () => {
		const isNowLiked = !hasLiked;
		if (isNowLiked) {
			heartScale.value = withSpring(
				1.2,
				{ damping: 50, stiffness: 200 },
				() => {
					heartScale.value = withSpring(1, { stiffness: 200 });
				},
			);
			heartTranslateY.value = withSpring(
				-5,
				{ damping: 50, stiffness: 200 },
				() => {
					heartTranslateY.value = withSpring(0, { stiffness: 200 });
				},
			);
		}
	};

	return {
		heartScale,
		heartTranslateY,
		performLikeAnimation,
	};
}
