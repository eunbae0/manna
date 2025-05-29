import { useState, type RefObject } from 'react';
import {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
} from 'react-native-reanimated';
import type { LayoutChangeEvent, TextInput } from 'react-native';

type UseExpandAnimationParams = {
	initialHeight?: number;
	expandedHeight?: number | 'auto';
	duration?: number;
	initiallyExpanded?: boolean;
};

/**
 * 확장/축소 애니메이션 기능을 제공하는 커스텀 훅
 */
export function useExpandAnimation({
	initialHeight = 0,
	expandedHeight = 'auto',
	duration = 200,
	initiallyExpanded = false,
}: UseExpandAnimationParams = {}) {
	// 확장 상태
	const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
	// 내부 콘텐츠의 실제 높이를 저장
	const [contentHeight, setContentHeight] = useState(0);

	// 애니메이션 값
	const height = useSharedValue<number>(
		initiallyExpanded
			? typeof expandedHeight === 'number'
				? expandedHeight
				: contentHeight || 0
			: initialHeight,
	);
	const rotate = useSharedValue(initiallyExpanded ? 1 : 0);

	// 애니메이션 스타일
	const containerStyle = useAnimatedStyle(() => ({
		height: height.value,
		overflow: 'hidden',
	}));

	const iconStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotate.value * 180}deg` }],
	}));

	// 내부 콘텐츠의 높이가 변경될 때 호출되는 함수
	const onContentLayout = (event: LayoutChangeEvent) => {
		const { height: newHeight } = event.nativeEvent.layout;
		if (newHeight > 0 && newHeight !== contentHeight) {
			setContentHeight(newHeight);

			// 이미 확장된 상태라면 높이를 업데이트
			if (isExpanded && expandedHeight === 'auto') {
				height.value = newHeight;
			}
		}
	};

	/**
	 * 확장/축소 토글 함수
	 * @param inputRef 확장 시 포커스할 입력 요소
	 */
	const toggle = (inputRef?: RefObject<TextInput>) => {
		const newExpandedState = !isExpanded;
		setIsExpanded(newExpandedState);
		if (newExpandedState) {
			// 열릴 때
			const targetHeight =
				expandedHeight === 'auto'
					? contentHeight
					: typeof expandedHeight === 'number'
						? expandedHeight
						: contentHeight;

			// targetHeight가 0이면 500으로 설정
			height.value = withTiming(targetHeight || 500, { duration });
			rotate.value = withTiming(1, { duration });

			// 포커스 설정 (입력 요소가 제공된 경우)
			setTimeout(() => {
				if (inputRef?.current) {
					inputRef.current.focus();
				}
			}, 100);
		} else {
			// 닫힐 때
			height.value = withTiming(initialHeight, { duration });
			rotate.value = withTiming(0, { duration });
		}
	};

	return {
		isExpanded,
		setIsExpanded,
		toggle,
		containerStyle,
		iconStyle,
		onContentLayout,
	};
}
