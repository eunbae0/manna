import { Button, ButtonIcon } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import { VStack } from '#/components/ui/vstack';
import { cn } from '@/shared/utils/cn';
import { X, type LucideIcon } from 'lucide-react-native';
import { Pressable, type ViewProps, type PressableProps } from 'react-native';

export type BottomSheetListProps = Omit<PressableProps, 'onPress'> & {
	label: string;
	icon: LucideIcon;
	onPress: PressableProps['onPress'];
};

export const BottomSheetListItem = ({
	label,
	icon,
	onPress,
	...props
}: BottomSheetListProps) => {
	return (
		<Pressable {...props} onPress={onPress}>
			<HStack space="md" className="items-center py-2">
				<Icon size="xl" className="stroke-background-700" as={icon} />
				<Text size="lg">{label}</Text>
			</HStack>
		</Pressable>
	);
};

export const BottomSheetListHeader = ({
	label,
	onPress,
}: { label: string; onPress: () => void }) => {
	return (
		<HStack className="justify-between items-center mb-3">
			<Heading size="xl">{label}</Heading>
			<Button size="xl" variant="link" onPress={onPress}>
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
