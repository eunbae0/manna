import React, { useEffect, useRef } from 'react';
import { type ToastType, useToastStore } from '@/store/toast';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	Easing,
	runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { VStack } from '#/components/ui/vstack';
import { Box } from '#/components/ui/box';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';
import { Text } from '#/components/ui/text';
import { cn } from '@/shared/utils/cn';

// 토스트 타입에 따른 아이콘 및 색상 설정
const getToastIconAndColor = (type: ToastType) => {
	switch (type) {
		case 'success':
			return {
				icon: CheckCircle,
				color: 'stroke-emerald-500',
				bgColor: 'bg-emerald-100/95',
				borderColor: 'border-emerald-500/20',
			};
		case 'error':
			return {
				icon: AlertCircle,
				color: 'stroke-red-500',
				bgColor: 'bg-red-100/95',
				borderColor: 'border-red-500/20',
			};
		case 'info':
			return {
				icon: Info,
				color: 'stroke-blue-500',
				bgColor: 'bg-blue-100/95',
				borderColor: 'border-blue-500/20',
			};
		default:
			return {
				icon: Info,
				color: 'stroke-blue-500',
				bgColor: 'bg-blue-100/95',
				borderColor: 'border-blue-500/20',
			};
	}
};

interface AnimatedToastProps {
	toast: {
		id: string;
		type: ToastType;
		message: string;
		title?: string;
	};
	onRemove: (id: string) => void;
}

const AnimatedToast = ({ toast, onRemove }: AnimatedToastProps) => {
	const translateY = useSharedValue(-100);
	const timerRef = useRef<NodeJS.Timeout>();

	// 토스트 제거 함수
	const dismissToast = React.useCallback(() => {
		// 기존 타이머 제거
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		// 위로 사라지는 애니메이션
		translateY.value = withTiming(
			-100,
			{
				duration: 300,
				easing: Easing.in(Easing.cubic),
			},
			(finished) => {
				if (finished) {
					// 애니메이션이 완료된 후 토스트 제거
					runOnJS(onRemove)(toast.id);
				}
			},
		);
	}, [onRemove, toast.id, translateY]);

	// 스와이프 제스처 설정
	const swipeGesture = React.useMemo(() => {
		return Gesture.Pan()
			.onUpdate((event) => {
				// 위로 스와이프할 때만 반응
				if (event.translationY < 0) {
					translateY.value = event.translationY;
				}
			})
			.onEnd((event) => {
				// 충분히 위로 스와이프했으면 제거
				if (event.translationY < -50) {
					runOnJS(dismissToast)();
				} else {
					// 충분하지 않으면 원래 위치로
					translateY.value = withTiming(0, {
						duration: 200,
						easing: Easing.out(Easing.cubic),
					});
				}
			});
	}, [dismissToast, translateY]);

	// 토스트가 마운트될 때 애니메이션 실행
	useEffect(() => {
		// 아래로 나타나는 애니메이션
		translateY.value = withTiming(0, {
			duration: 300,
			easing: Easing.out(Easing.cubic),
		});

		// 3초 후 위로 사라지는 애니메이션
		timerRef.current = setTimeout(() => {
			dismissToast();
		}, 3000);

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [dismissToast, translateY]);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: translateY.value }],
			opacity:
				translateY.value < -80
					? 0
					: 1 - Math.min(1, Math.abs(translateY.value) / 100),
		};
	});

	const {
		icon: IconComponent,
		color,
		bgColor,
		borderColor,
	} = getToastIconAndColor(toast.type);

	return (
		<GestureDetector gesture={swipeGesture}>
			<Animated.View style={animatedStyle} className="w-full mb-2">
				<Box
					className={cn(
						'w-full rounded-3xl px-5 py-5 border dark:border-gray-700',
						bgColor,
						borderColor,
					)}
				>
					<HStack space="lg" className="items-center">
						<Icon as={IconComponent} size="lg" className={color} />
						<VStack space="xs" className="flex-1">
							{toast.title && (
								<Text className="dark:text-gray-100">{toast.title}</Text>
							)}
							<Text size="lg" className="dark:text-gray-300 pr-4">
								{toast.message}
							</Text>
						</VStack>
					</HStack>
				</Box>
			</Animated.View>
		</GestureDetector>
	);
};

export const ToastContainer = () => {
	const { toasts, removeToast } = useToastStore();
	const { top } = useSafeAreaInsets();

	if (toasts.length === 0) return null;

	return (
		<Box style={{ top }} className="absolute px-4 z-30 mt-2 w-full">
			<VStack className="items-center">
				{toasts.map((toast) => (
					<AnimatedToast key={toast.id} toast={toast} onRemove={removeToast} />
				))}
			</VStack>
		</Box>
	);
};
