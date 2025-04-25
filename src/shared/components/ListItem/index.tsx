import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import AnimatedPressable from '@/components/common/animated-pressable';
import { type LucideIcon, ChevronRight } from 'lucide-react-native';
import type { PressableProps } from 'react-native';

export const ListItem = ({
	icon,
	label,
	onPress,
	isNew = false,
}: {
	icon: LucideIcon;
	label: string;
	onPress?: PressableProps['onPress'];
	isNew?: boolean;
}) => {
	return (
		<AnimatedPressable onPress={onPress}>
			<HStack className="items-center justify-between py-4">
				<HStack space="md" className="items-center">
					<Icon as={icon} size="md" />
					<Text size="lg">{label}</Text>
					{isNew && (
						<Text size="md" className="text-yellow-500">
							NEW!
						</Text>
					)}
				</HStack>
				<Icon as={ChevronRight} size="lg" />
			</HStack>
		</AnimatedPressable>
	);
};
