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
}: {
	icon: LucideIcon;
	label: string;
	onPress?: PressableProps['onPress'];
}) => {
	return (
		<AnimatedPressable onPress={onPress}>
			<HStack className="items-center justify-between py-4">
				<HStack space="md" className="items-center">
					<Icon as={icon} size="md" />
					<Text size="lg">{label}</Text>
				</HStack>
				<Icon as={ChevronRight} size="lg" />
			</HStack>
		</AnimatedPressable>
	);
};
