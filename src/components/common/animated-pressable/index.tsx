import React, { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import type { PressableProps, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useScaleAnimation } from '@/shared/hooks';
import { cn } from '@/shared/utils/cn';

type ScaleSize = 'xs' | 'sm' | 'md' | 'lg';

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
	 * 눌렀을 때 축소 크기
	 * - xs: 0.99
	 * - sm: 0.98
	 * - md: 0.96 (기본값)
	 * - lg: 0.94
	 * @default 'md'
	 */
	scale?: ScaleSize | number;
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
	 * 터치 시 햅틱 피드백
	 */
	withHaptic?: boolean;
	/**
	 * 클래스명
	 */
	className?: string;
	/**
	 * Pressable 컴포넌트의 클래스명
	 */
	pressableClassName?: string;
	/**
	 * 클릭 시 배경색 변경 활성화 여부
	 * @default false
	 */
	withBackground?: boolean;
	/**
	 * 클릭 시 배경색 변경 쓰로틀 시간 (ms)
	 * @default 300
	 */
	throttleTime?: number;
	/**
	 * 클릭 시 적용할 배경색 클래스명
	 * @default 'bg-background-50'
	 */
	pressedBackgroundClass?: string;
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
/**
 * 크기에 따른 스케일 값 매핑
 */
const scaleValues: Record<ScaleSize, number> = {
	xs: 0.99,
	sm: 0.98,
	md: 0.96,
	lg: 0.94,
};

function AnimatedPressable({
	children,
	animation = true,
	scale = 'md',
	damping = 8,
	stiffness = 100,
	containerStyle,
	withHaptic = false,
	className,
	pressableClassName,
	style,
	withBackground = false,
	throttleTime = 300, // 기본 쓰로틀 시간 300ms
	pressedBackgroundClass = 'bg-background-50',
	...props
}: AnimatedPressableProps) {
	// 배경색 상태 관리
	const [isPressed, setIsPressed] = useState(false);

	// 스케일 값 계산
	const scaleValue = typeof scale === 'string' ? scaleValues[scale] : scale;

	// useScaleAnimation 훅을 사용하여 애니메이션 로직 구현
	const {
		animatedStyle,
		handlePressIn: scaleHandlePressIn,
		handlePressOut: scaleHandlePressOut,
	} = useScaleAnimation({
		enabled: animation,
		scale: scaleValue,
		damping,
		stiffness,
		withHaptic,
	});

	const lastPressTimeRef = useRef<number>(0);

	// 버튼 눌림 핸들러 (스케일 + 배경색)
	const handlePressIn = () => {
		// 쓰로틀링 기능 구현: 지정된 시간 내에 중복 호출 방지
		const now = Date.now();
		if (now - lastPressTimeRef.current < throttleTime) {
			// 지정된 시간보다 빠르게 호출되면 무시
			return;
		}
		// 마지막 클릭 시간 업데이트
		lastPressTimeRef.current = now;
		scaleHandlePressIn();
		if (withBackground) {
			setIsPressed(true);
		}
	};

	// 버튼 떼기 핸들러 (스케일 + 배경색)
	const handlePressOut = () => {
		scaleHandlePressOut();
		if (withBackground) {
			setIsPressed(false);
		}
	};

	return (
		<Animated.View
			style={[animatedStyle, containerStyle]}
			className={cn(
				className,
				withBackground && isPressed ? pressedBackgroundClass : '',
			)}
		>
			<Pressable
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				{...props}
				className={cn(pressableClassName)}
			>
				{children}
			</Pressable>
		</Animated.View>
	);
}

export default AnimatedPressable;
