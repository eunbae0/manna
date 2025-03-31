import React from 'react';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import type { PressableProps, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useScaleAnimation } from '@/shared/hooks';

interface AnimatedPressableProps extends PressableProps {
	/**
	 * 자식 요소
	 */
	children: ReactNode;
	/**
	 * 애니메이션 활성화 여부
	 * @default true
	 */
	animation?: boolean;
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
	/**
	 * 애니메이션 컨테이너 스타일
	 */
	containerStyle?: ViewStyle;
	/**
	 * 클래스명
	 */
	className?: string;
}

/**
 * 눌렀을 때 자연스러운 축소 애니메이션을 제공하는 Pressable 컴포넌트
 *
 * @example
 * ```tsx
 * <AnimatedPressable onPress={handlePress}>
 *   <Text>버튼</Text>
 * </AnimatedPressable>
 * ```
 */
function AnimatedPressable({
	children,
	animation = true,
	scale = 0.96,
	damping = 8,
	stiffness = 100,
	containerStyle,
	className,
	...props
}: AnimatedPressableProps) {
	// useScaleAnimation 훅을 사용하여 애니메이션 로직 구현
	const { animatedStyle, handlePressIn, handlePressOut } = useScaleAnimation({
		enabled: animation,
		scale,
		damping,
		stiffness,
	});

	return (
		<Animated.View
			style={[animatedStyle, containerStyle]}
			className={className}
		>
			<Pressable
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				{...props}
			>
				{children}
			</Pressable>
		</Animated.View>
	);
}

export default AnimatedPressable;
