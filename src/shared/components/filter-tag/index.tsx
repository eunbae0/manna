import React from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';
import { Box } from '#/components/ui/box';
import { Text } from '@/shared/components/text';
import AnimatedPressable from '@/components/common/animated-pressable';

const filterTagStyles = cva(
	'px-3 py-1.5 rounded-full items-center justify-center',
	{
		variants: {
			variant: {
				selected: 'bg-primary-500 border border-primary-500',
				unselected: 'bg-gray-50 border border-gray-300',
			},
			size: {
				xs: 'px-2 py-[2px]',
				sm: 'px-3 py-1',
				md: 'px-3 py-1',
				lg: 'px-3 py-2',
				xl: 'px-4 py-2',
			},
		},
		defaultVariants: {
			variant: 'unselected',
			size: 'md',
		},
	},
);

const filterTagTextStyles = cva('font-pretendard-Medium', {
	variants: {
		variant: {
			selected: 'text-white',
			unselected: 'text-gray-700',
		},
		size: {
			xs: 'text-xs',
			sm: 'text-sm',
			md: 'text-base',
			lg: 'text-lg',
			xl: 'text-xl',
		},
	},
	defaultVariants: {
		variant: 'unselected',
		size: 'md',
	},
});

type FilterTagSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface FilterTagProps
	extends Omit<ComponentPropsWithoutRef<typeof AnimatedPressable>, 'children'> {
	label: string;
	isSelected?: boolean;
	withHaptic?: boolean;
	size?: FilterTagSize;
}

export function FilterTag({
	label,
	isSelected = false,
	withHaptic = false,
	size = 'md',
	onPress,
	className,
	...props
}: FilterTagProps) {
	const variant = isSelected ? 'selected' : 'unselected';

	return (
		<AnimatedPressable onPress={onPress} withHaptic={withHaptic} {...props}>
			<Box className={cn(filterTagStyles({ variant, size }), className)}>
				<Text className={filterTagTextStyles({ variant, size })}>{label}</Text>
			</Box>
		</AnimatedPressable>
	);
}

export default FilterTag;
