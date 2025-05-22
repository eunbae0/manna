import React from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';
import { Box } from '#/components/ui/box';
import { Text } from '@/shared/components/text';
import AnimatedPressable from '@/components/common/animated-pressable';

// Define filter tag variants
const filterTagStyles = cva('px-3 py-1.5 rounded-full items-center justify-center mr-2', {
  variants: {
    variant: {
      selected: 'bg-primary-500 border border-primary-500',
      unselected: 'bg-primary-50 border border-primary-200',
    },
  },
  defaultVariants: {
    variant: 'unselected',
  },
});

// Define text styles for filter tag
const filterTagTextStyles = cva('font-pretendard-Medium', {
  variants: {
    variant: {
      selected: 'text-white',
      unselected: 'text-typography-700',
    },
  },
  defaultVariants: {
    variant: 'unselected',
  },
});

export interface FilterTagProps extends Omit<ComponentPropsWithoutRef<typeof AnimatedPressable>, 'children'> {
  label: string;
  isSelected?: boolean;
  withHaptic?: boolean;
}

export function FilterTag({
  label,
  isSelected = false,
  withHaptic = false,
  onPress,
  className,
  ...props
}: FilterTagProps) {
  const variant = isSelected ? 'selected' : 'unselected';

  return (
    <AnimatedPressable
      onPress={onPress}
      withHaptic={withHaptic}
      {...props}
    >
      <Box className={cn(filterTagStyles({ variant }), className)}>
        <Text
          size="xs"
          className={filterTagTextStyles({ variant })}
        >
          {label}
        </Text>
      </Box>
    </AnimatedPressable>
  );
}

export default FilterTag;