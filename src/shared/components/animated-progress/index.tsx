import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';

export function AnimatedProgress() {
	const loadingProgress = useSharedValue(0);

	// 로딩 애니메이션 스타일 정의
	const loadingBarStyle = useAnimatedStyle(() => {
		// 0-0.5: 왼쪽에서 오른쪽으로 늘어남, 0.5-1: 오른쪽을 기준으로 줄어듬
		const progress = loadingProgress.value;

		if (progress <= 0.5) {
			// 왼쪽에서 오른쪽으로 늘어나는 과정 (0-0.5 구간을 0-1로 변환)
			const expandProgress = progress * 2;
			return {
				width: `${expandProgress * 100}%`,
				left: 0,
			};
		}
		// 오른쪽을 기준으로 줄어드는 과정 (0.5-1 구간을 1-0으로 변환)
		const shrinkProgress = (1 - progress) * 2;
		return {
			width: `${shrinkProgress * 100}%`,
			right: 0,
			left: 'auto',
		};
	});

	// Start loading animation
	const startLoadingAnimation = useCallback(() => {
		loadingProgress.value = 0;
		loadingProgress.value = withRepeat(
			withTiming(1, {
				duration: 2000,
				easing: Easing.linear,
			}),
			-1, // -1 for infinite repetitions
			false, // 순환하지 않고 다시 0부터 시작
		);
	}, [loadingProgress]);

	useEffect(() => {
		startLoadingAnimation();
	}, [startLoadingAnimation]);

	return (
		<View className="h-1 w-[80%] bg-gray-300 mt-4 overflow-hidden">
			<Animated.View
				className="h-1 bg-primary-500 absolute left-0"
				style={loadingBarStyle}
			/>
		</View>
	);
}
