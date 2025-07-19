import { useSegmentedControlContext } from './SegmentedControlContext';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Text } from '@/shared/components/text';
import { cn } from '@/shared/utils/cn';

interface SegmentedControlTriggerProps {
	value: string;
	label: string;
	disabled?: boolean;
	withHaptic?: boolean;
}

const SegmentedControlTrigger = ({
	value,
	label,
	disabled = false,
	withHaptic = false,
}: SegmentedControlTriggerProps) => {
	const { selectedValue, onValueChange } = useSegmentedControlContext();

	const isSelected = selectedValue === value;

	const handlePress = () => {
		if (!disabled && !isSelected) {
			onValueChange?.(value);
		}
	};

	return (
		<AnimatedPressable
			className={cn(
				'flex-1 rounded-xl items-center',
				isSelected ? 'bg-primary-100' : '',
				disabled ? 'opacity-50' : '',
			)}
			onPress={handlePress}
			pressableClassName="w-full items-center py-2"
			withHaptic={withHaptic}
		>
			<Text
				weight="bold"
				size="lg"
				className={cn(
					'text-typography-500',
					isSelected ? 'text-primary-700/80' : '',
					disabled ? 'text-typography-300' : '',
				)}
			>
				{label}
			</Text>
		</AnimatedPressable>
	);
};

export default SegmentedControlTrigger;
