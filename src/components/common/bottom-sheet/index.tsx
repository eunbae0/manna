import { Button, ButtonIcon } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import { VStack } from '#/components/ui/vstack';
import { cn } from '@/shared/utils/cn';
import { X, type LucideIcon } from 'lucide-react-native';
import { Pressable, type ViewProps, type PressableProps } from 'react-native';
import AnimatedPressable from '../animated-pressable';

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
						'stroke-background-700',
						variant === 'destructive' && 'stroke-red-500',
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
}: { label: string; onPress: () => void }) => {
	return (
		<HStack className="justify-between items-center mb-2">
			<Heading size="xl">{label}</Heading>
			<Button size="xl" variant="icon" onPress={onPress}>
				<ButtonIcon as={X} />
			</Button>
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
