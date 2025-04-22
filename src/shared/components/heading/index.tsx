import React from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { Text } from '#/components/ui/text';
import { cn } from '@/shared/utils/cn';

// Define heading size type
type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

// Heading base component with size variants
const headingStyles = cva('font-pretendard-bold', {
	variants: {
		size: {
			xs: 'text-sm',
			sm: 'text-md',
			md: 'text-lg',
			lg: 'text-xl',
			xl: 'text-2xl',
			'2xl': 'text-3xl',
			'3xl': 'text-4xl',
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
			white: 'text-white',
			error: 'text-error-500',
			success: 'text-success-500',
		},
	},
	defaultVariants: {
		size: 'lg',
		align: 'left',
		color: 'typography',
	},
});

export interface HeadingProps
	extends ComponentPropsWithoutRef<typeof Text>,
		VariantProps<typeof headingStyles> {
	size: HeadingSize;
}

export function Heading({
	className,
	size,
	align,
	color,
	children,
	...props
}: HeadingProps) {
	return (
		<Text
			className={cn(headingStyles({ size, align, color }), className)}
			{...props}
		>
			{children}
		</Text>
	);
}

export default Heading;
