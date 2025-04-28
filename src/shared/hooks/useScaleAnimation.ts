import { useCallback } from 'react';
import {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
} from 'react-native-reanimated';

interface UseScaleAnimationProps {
	/**
	 * 애니메이션 활성화 여부
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * 눌렀을 때 축소 비율 (0-1 사이 값)
	 * @default 0.96
	 */
	scale?: number;
	/**
	 * 스프링 애니메이션 감쇠 계수
	 * @default 8
	 */
	damping?: number;
	/**
	 * 스프링 애니메이션 강성 계수
	 * @default 100
	 */
	stiffness?: number;
}

/**
 * 요소를 눌렀을 때 자연스러운 축소 애니메이션을 제공하는 훅
 *
 * @example
 * ```tsx
 * const { animatedStyle, handlePressIn, handlePressOut } = useScaleAnimation();
 *
 * return (
 *   <Animated.View style={animatedStyle}>
 *     <Pressable
 *       onPressIn={handlePressIn}
 *       onPressOut={handlePressOut}
 *     >
 *       {children}
 *     </Pressable>
 *   </Animated.View>
 * );
 * ```
 */
function useScaleAnimation({
	enabled = true,
	scale = 0.96,
	damping = 8,
	stiffness = 100,
}: UseScaleAnimationProps = {}) {
	// 애니메이션 값 생성
	const scaleValue = useSharedValue(1);

	// 버튼 눌림 애니메이션
	const handlePressIn = useCallback(() => {
		if (enabled) {
			scaleValue.value = withSpring(scale, {
				damping,
				stiffness,
			});
		}
	}, [enabled, scale, damping, stiffness, scaleValue]);

	// 버튼 떼기 애니메이션
	const handlePressOut = useCallback(() => {
		if (enabled) {
			scaleValue.value = withSpring(1, {
				damping,
				stiffness,
			});
		}
	}, [enabled, damping, stiffness, scaleValue]);

	// 애니메이션 스타일 정의
	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scaleValue.value }],
	}));

	return {
		animatedStyle,
		handlePressIn,
		handlePressOut,
		scaleValue,
	};
}

export default useScaleAnimation;
