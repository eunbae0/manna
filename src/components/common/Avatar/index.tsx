import React, { forwardRef } from 'react';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import { cn } from '@/utils/cn';
import { UserRound } from 'lucide-react-native';
import { Image, Pressable, View, type ViewProps } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import { VStack } from '#/components/ui/vstack';

export type AvatarProps = {
	variant?: 'default' | 'image';
	type?: 'leader' | 'member';
	size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	imageUrl?: string;
	label?: string;
} & ViewProps;

const Avatar = forwardRef<View, AvatarProps>(
	(
		{
			variant = 'default',
			type = 'member',
			size = 'md',
			imageUrl,
			label,
			className,
			style,
			...props
		},
		ref,
	) => {
		const { width, height } = getAvatarSize(size);
		return (
			<VStack space="xs" className="items-center">
				<View
					ref={ref}
					style={[{ width, height }, style]}
					className={cn(
						'relative bg-primary-400 rounded-full items-center justify-center',
						className,
					)}
					{...props}
				>
					{variant === 'default' && (
						<Icon as={UserRound} size={size} className="stroke-white" />
					)}
					{variant === 'image' && imageUrl && (
						<Image source={{ uri: imageUrl }} style={{ width, height }} />
					)}
					{type === 'leader' && (
						<View className="absolute bottom-0 right-0 bg-yellow-400 w-3 h-3 border-2 border-white rounded-full" />
					)}
				</View>
				{label && <Text size={size}>{label}</Text>}
			</VStack>
		);
	},
);

export type AvatarGroupProps = {
	children: React.ReactElement<AvatarProps> | React.ReactElement<AvatarProps>[];
	spacing?: number;
	max?: number;
	onPress?: () => void;
} & ViewProps;

const AvatarGroup = forwardRef<View, AvatarGroupProps>(
	({ children, className, spacing = -6, max = 5, onPress, ...props }, ref) => {
		// Ensure children is always an array
		const childrenArray = React.Children.toArray(children);

		// Limit the number of avatars shown
		const visibleAvatars = childrenArray.slice(0, max);

		// Count of hidden avatars
		const hiddenCount = Math.max(0, childrenArray.length - max);

		const isExpanded = useSharedValue(false);

		const handlePress = () => {
			if (!onPress) return;
			isExpanded.value = !isExpanded.value;
			onPress();
		};

		const animatedStyle = useAnimatedStyle(() => {
			return {
				gap: withSpring(isExpanded.value ? 16 : spacing, {
					mass: 0.5,
					damping: 15,
					stiffness: 100,
					overshootClamping: false,
					restDisplacementThreshold: 0.01,
					restSpeedThreshold: 2,
				}),
			};
		});

		const avatarStyle = useAnimatedStyle(() => {
			return {
				transform: [
					{
						scale: withSpring(isExpanded.value ? 1.1 : 1, {
							mass: 0.5,
							damping: 15,
							stiffness: 100,
						}),
					},
				],
			};
		});

		return (
			<Pressable ref={ref} onPress={handlePress}>
				<Animated.View
					className={cn('flex-row items-center', className)}
					style={[animatedStyle]}
					{...props}
				>
					{visibleAvatars.map((child, i) => {
						if (!React.isValidElement(child)) return null;
						const key = `avatar-${i}`;
						return React.cloneElement(
							child as React.ReactElement<AvatarProps>,
							{
								key,
								className: cn(
									'border-[1px] border-white',
									child.props.className,
								),
								style: [
									child.props.style,
									{
										marginRight: i < visibleAvatars.length - 1 ? spacing : 0,
										zIndex: visibleAvatars.length - i,
									},
									avatarStyle,
								],
							},
						);
					})}
					{hiddenCount > 0 && (
						<View
							className="bg-gray-300 border-2 border-white rounded-full items-center justify-center"
							style={{
								width: 28,
								height: 28,
								marginRight: spacing,
								zIndex: 0,
							}}
						>
							<Text className="text-xs font-bold text-white">
								+{hiddenCount}
							</Text>
						</View>
					)}
				</Animated.View>
			</Pressable>
		);
	},
);

export { Avatar, AvatarGroup };

function getAvatarSize(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') {
	switch (size) {
		case 'xs':
			return { width: 24, height: 24 };
		case 'sm':
			return { width: 28, height: 28 };
		case 'md':
			return { width: 34, height: 34 };
		case 'lg':
			return { width: 40, height: 40 };
		case 'xl':
			return { width: 48, height: 48 };
	}
}
