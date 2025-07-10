import { Button, ButtonIcon } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '@/shared/components/text';
import { VStack } from '#/components/ui/vstack';
import { cn } from '@/shared/utils/cn';
import { X, type LucideIcon } from 'lucide-react-native';
import type { ViewProps, PressableProps } from 'react-native';
import AnimatedPressable from '../animated-pressable';
import { Box } from '#/components/ui/box';

export type BottomSheetListProps = Omit<PressableProps, 'onPress'> & {
	label: string;
	icon: LucideIcon;
	onPress: PressableProps['onPress'];
	variant?: 'destructive' | 'default';
};

export const BottomSheetListItem = ({
	label,
	icon,
	onPress,
	variant,
	...props
}: BottomSheetListProps) => {
	return (
		<AnimatedPressable {...props} onPress={onPress}>
			<HStack space="md" className="items-center py-3">
				<Icon
					size="xl"
					className={cn(
						'text-background-700',
						variant === 'destructive' && 'text-red-500',
					)}
					as={icon}
				/>
				<Text
					size="lg"
					className={variant === 'destructive' ? 'text-red-500' : ''}
				>
					{label}
				</Text>
			</HStack>
		</AnimatedPressable>
	);
};

export const BottomSheetListHeader = ({
	label,
	onPress,
	className,
	...props
}: { label: string; onPress: () => void } & ViewProps) => {
	return (
		<HStack
			className={cn('justify-between items-center py-3 mb-2 w-full', className)}
			{...props}
		>
			<Heading size="2xl">{label}</Heading>
			<Box className="absolute -right-2">
				<Button size="lg" variant="icon" onPress={onPress}>
					<ButtonIcon as={X} className="text-background-600" />
				</Button>
			</Box>
		</HStack>
	);
};

export type BottomSheetListLayoutProps = Omit<ViewProps, 'chileren'> & {
	children: React.ReactNode;
};

export const BottomSheetListLayout = ({
	children,
	className,
	...props
}: BottomSheetListLayoutProps) => {
	return (
		<VStack
			space="sm"
			className={cn('w-full px-6 pt-2 pb-9', className)}
			{...props}
		>
			{children}
		</VStack>
	);
};
