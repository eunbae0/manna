import React from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { Text as RNText } from 'react-native';
import { cn } from '@/shared/utils/cn';

// Define text size type
type TextSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
type FontWeight = 'regular' | 'medium' | 'semi-bold' | 'bold';

// Text base component with variants
const textStyles = cva('font-pretendard-regular', {
  variants: {
    size: {
      '2xs': 'text-2xs',
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-md',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    },
    weight: {
      regular: 'font-pretendard-Regular',
      medium: 'font-pretendard-Medium',
      'semi-bold': 'font-pretendard-semi-bold',
      bold: 'font-pretendard-bold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    color: {
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
      typography: 'text-typography-900',
      'typography-light': 'text-typography-600',
      white: 'text-white',
      error: 'text-error-500',
      success: 'text-success-500',
    },
    decoration: {
      none: '',
      underline: 'underline',
      'line-through': 'line-through',
    },
  },
  defaultVariants: {
    size: 'md',
    weight: 'regular',
    align: 'left',
    color: 'typography',
    decoration: 'none',
  },
});

export interface TextProps
  extends ComponentPropsWithoutRef<typeof RNText>,
  VariantProps<typeof textStyles> {
  size?: TextSize;
  weight?: FontWeight;
}

export function Text({
  className,
  size,
  weight,
  align,
  color,
  decoration,
  children,
  ...props
}: TextProps) {
  return (
    <RNText
      className={cn(textStyles({ size, weight, align, color, decoration }), className)}
      {...props}
    >
      {children}
    </RNText>
  );
}

export default Text;