import React from 'react';
import {
	Tabs,
	TabList,
	TabTrigger,
	TabSlot,
	type TabTriggerSlotProps,
} from 'expo-router/ui';

import { Icon } from '#/components/ui/icon';
import {
	Bell,
	HouseIcon,
	NotebookPen,
	Ellipsis,
	type LucideIcon,
	BookMarked,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Text } from '@/shared/components/text';
import { VStack } from '#/components/ui/vstack';
import { Pressable, View } from 'react-native';
import { cn } from '@/shared/utils/cn';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
	const colorScheme = useColorScheme();

	const insets = useSafeAreaInsets();
	return (
		<Tabs>
			<View className="flex-1" style={{ paddingTop: insets.top }}>
				<TabSlot />
			</View>
			<TabList
				style={{ marginBottom: insets.bottom }}
				className="px-2 pt-1 border-t border-l border-r rounded-2xl border-gray-200 items-center justify-center"
			>
				<TabTrigger
					name="index"
					href="/"
					asChild
					style={{ flex: 1, justifyContent: 'center' }}
				>
					<CustomTabButton icon={HouseIcon}>홈</CustomTabButton>
				</TabTrigger>
				<TabTrigger
					name="note"
					href="/note"
					asChild
					style={{ flex: 1, justifyContent: 'center' }}
				>
					<CustomTabButton icon={NotebookPen}>설교 노트</CustomTabButton>
				</TabTrigger>
				<TabTrigger
					name="bible"
					href="/bible"
					asChild
					style={{ flex: 1, justifyContent: 'center' }}
				>
					<CustomTabButton icon={BookMarked}>성경</CustomTabButton>
				</TabTrigger>
				<TabTrigger
					name="notification"
					href="/notification"
					asChild
					style={{ flex: 1, justifyContent: 'center' }}
				>
					<CustomTabButton icon={Bell}>알림</CustomTabButton>
				</TabTrigger>
				<TabTrigger
					name="more"
					href="/more"
					asChild
					style={{ flex: 1, justifyContent: 'center' }}
				>
					<CustomTabButton icon={Ellipsis}>더보기</CustomTabButton>
				</TabTrigger>
			</TabList>
		</Tabs>
	);
}

interface CustomTabButtonProps
	extends React.PropsWithChildren,
	TabTriggerSlotProps {
	icon: LucideIcon;
}

export const CustomTabButton = React.forwardRef<View, CustomTabButtonProps>(
	(props, ref) => {
		// 애니메이션을 위한 공유 값 생성
		const scale = useSharedValue(1);
		const backgroundColor = useSharedValue(0);

		// 애니메이션 스타일 정의
		const animatedStyle = useAnimatedStyle(() => {
			return {
				transform: [{ scale: scale.value }],
				backgroundColor: `rgba(54, 35, 3, ${backgroundColor.value * 0.04})`,
				borderRadius: 8,
				paddingTop: 4,
				paddingBottom: 4,
			};
		});

		return (
			<Pressable
				ref={ref}
				{...props}
				onPressIn={(ev) => {
					scale.value = withTiming(0.96, {
						duration: 150,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					});
					backgroundColor.value = withTiming(1, {
						duration: 150,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					});

					if (process.env.EXPO_OS === 'ios') {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
					} else {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

					}
					props.onPressIn?.(ev);
				}}
				onPressOut={() => {
					scale.value = withTiming(1, {
						duration: 150,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					});
					backgroundColor.value = withTiming(0, {
						duration: 150,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					});
				}}
			>
				<Animated.View style={animatedStyle}>
					<VStack className="items-center gap-[2px]">
						<Icon
							size="xl"
							as={props.icon}
							className={cn(
								props.isFocused
									? 'text-primary-500'
									: 'text-typography-500',
							)}
						/>
						<Text
							size="sm"
							weight="semi-bold"
							className={cn(
								props.isFocused ? 'text-primary-500' : 'text-typography-500',
							)}
						>
							{props.children}
						</Text>
					</VStack>
				</Animated.View>
			</Pressable>
		);
	},
);
