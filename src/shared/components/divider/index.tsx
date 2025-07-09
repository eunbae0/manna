import React from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';
import { View } from 'react-native';

type DividerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Orientation = 'vertical' | 'horizontal'

const dividerStyles = cva('', {
  variants: {
    size: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
    color: {
      base: 'bg-gray-100',
      primary: 'bg-primary-500',
      secondary: 'bg-secondary-500',
    },
    orientation: {
      vertical: 'h-full',
      horizontal: 'w-full',
    },
  },
  compoundVariants: [
    { size: 'xs', orientation: 'horizontal', class: 'h-[1px]' },
    { size: 'xs', orientation: 'vertical', class: 'w-[1px]' },

    { size: 'sm', orientation: 'horizontal', class: 'h-[2px]' },
    { size: 'sm', orientation: 'vertical', class: 'w-[2px]' },

    { size: 'md', orientation: 'horizontal', class: 'h-[4px]' },
    { size: 'md', orientation: 'vertical', class: 'w-[4px]' },

    { size: 'lg', orientation: 'horizontal', class: 'h-[8px]' },
    { size: 'lg', orientation: 'vertical', class: 'w-[8px]' },

    { size: 'xl', orientation: 'horizontal', class: 'h-[12px]' },
    { size: 'xl', orientation: 'vertical', class: 'w-[12px]' },
  ],
  defaultVariants: {
    size: 'xs',
    color: 'base',
    orientation: 'horizontal',
  },
});

export interface DividerProps
  extends ComponentPropsWithoutRef<typeof View>,
  VariantProps<typeof dividerStyles> {
  size?: DividerSize;
  orientation?: Orientation;
}

export function Divider({
  className,
  size = 'xs',
  color = 'base',
  orientation = 'horizontal',
  ...props
}: DividerProps) {
  return (
    <View
      className={cn(dividerStyles({ size, color, orientation }), className)}
      {...props}
    />
  );
}

export default Divider;
