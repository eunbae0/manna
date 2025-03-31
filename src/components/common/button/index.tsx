import React, { Children, isValidElement } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useScaleAnimation } from '@/shared/hooks';
import { cn } from '@/shared/utils/cn';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { Icon as UIIcon } from '#/components/ui/icon';

// Define button size type
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Button base component with rounded and size variants
const buttonStyles = cva('flex-row items-center justify-center', {
	variants: {
		rounded: {
			true: 'rounded-full',
			false: 'rounded-md',
		},
		fullWidth: {
			true: 'w-full',
			false: '',
		},
		size: {
			xs: 'h-9 px-3 gap-1',
			sm: 'h-10 px-4 gap-1',
			md: 'h-11 px-5 gap-2',
			lg: 'h-12 px-6 gap-2',
			xl: 'h-14 px-7 gap-3',
		},
		variant: {
			solid: 'bg-primary-500 active:bg-primary-600',
			outline: 'bg-transparent border border-primary-500 active:bg-primary-50',
			link: 'bg-transparent px-0',
			icon: 'bg-transparent p-2 aspect-square',
		},
		action: {
			primary: 'bg-primary-500 active:bg-primary-600',
			secondary: 'bg-secondary-500 active:bg-secondary-600',
			positive: 'bg-success-500 active:bg-success-600',
			negative: 'bg-error-500 active:bg-error-600',
		},
	},
	defaultVariants: {
		rounded: false,
		fullWidth: false,
		size: 'md',
		variant: 'solid',
		action: 'primary',
	},
	compoundVariants: [
		{
			variant: 'outline',
			action: 'primary',
			class: 'bg-transparent border-primary-500 active:bg-primary-50',
		},
		{
			variant: 'outline',
			action: 'secondary',
			class: 'border-secondary-500 active:bg-secondary-50',
		},
		{
			variant: 'outline',
			action: 'positive',
			class: 'border-success-500 active:bg-success-50',
		},
		{
			variant: 'outline',
			action: 'negative',
			class: 'border-error-500 active:bg-error-50',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'xs',
			class:
				'bg-transparent active:bg-background-100 h-9 p-3 items-center justify-center',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'sm',
			class:
				'bg-transparent active:bg-background-100 h-10 px-4 items-center justify-center',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'md',
			class:
				'bg-transparent active:bg-background-100 h-11 px-5 items-center justify-center',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'lg',
			class:
				'bg-transparent active:bg-background-100 h-12 px-6 items-center justify-center',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'xl',
			class:
				'bg-transparent active:bg-background-100 h-14 px-7 items-center justify-center',
		},
	],
});

// Button text styles based on button size and variant
const buttonTextStyles = cva('font-medium', {
	variants: {
		size: {
			xs: 'text-xs',
			sm: 'text-sm',
			md: 'text-base',
			lg: 'text-lg',
			xl: 'text-xl',
		},
		variant: {
			solid: 'text-white',
			outline: 'text-primary-500',
			link: 'text-primary-500 underline',
			icon: 'text-primary-500',
		},
		action: {
			primary: 'text-white',
			secondary: 'text-white',
			positive: 'text-white',
			negative: 'text-white',
		},
	},
	defaultVariants: {
		size: 'md',
		variant: 'solid',
		action: 'primary',
	},
	compoundVariants: [
		{
			variant: 'outline',
			action: 'primary',
			class: 'text-primary-500',
		},
		{
			variant: 'outline',
			action: 'secondary',
			class: 'text-secondary-500',
		},
		{
			variant: 'outline',
			action: 'positive',
			class: 'text-success-500',
		},
		{
			variant: 'outline',
			action: 'negative',
			class: 'text-error-500',
		},
		{
			variant: 'icon',
			action: 'primary',
			class: 'text-primary-500',
		},
		{
			variant: 'icon',
			action: 'secondary',
			class: 'text-secondary-500',
		},
		{
			variant: 'icon',
			action: 'positive',
			class: 'text-success-500',
		},
		{
			variant: 'icon',
			action: 'negative',
			class: 'text-error-500',
		},
	],
});

// Button icon styles based on button size and variant
const buttonIconStyles = cva('', {
	variants: {
		size: {
			xs: 'h-2 w-2',
			sm: 'h-3 w-3',
			md: 'h-4 w-4',
			lg: 'h-5 w-5',
			xl: 'h-6 w-6',
		},
		variant: {
			solid: 'stroke-white',
			outline: 'stroke-primary-500',
			link: 'stroke-primary-500',
			icon: 'stroke-primary-500',
		},
		action: {
			primary: 'stroke-white',
			secondary: 'stroke-white',
			positive: 'stroke-white',
			negative: 'stroke-white',
		},
	},
	defaultVariants: {
		size: 'md',
		variant: 'solid',
		action: 'primary',
	},
	compoundVariants: [
		{
			variant: 'outline',
			action: 'primary',
			class: 'stroke-primary-500',
		},
		{
			variant: 'outline',
			action: 'secondary',
			class: 'stroke-secondary-500',
		},
		{
			variant: 'outline',
			action: 'positive',
			class: 'stroke-success-500',
		},
		{
			variant: 'outline',
			action: 'negative',
			class: 'stroke-error-500',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'xs',
			class: 'stroke-typography-900 h-3 w-3',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'sm',
			class: 'stroke-typography-900 h-4 w-4',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'md',
			class: 'stroke-typography-900 h-5 w-5',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'lg',
			class: 'stroke-typography-900 h-6 w-6',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'xl',
			class: 'stroke-typography-900 h-7 w-7',
		},
	],
});

export interface ButtonProps
	extends Omit<ComponentPropsWithoutRef<typeof Pressable>, 'style'>,
		VariantProps<typeof buttonStyles> {
	children?: ReactNode;
	rounded?: boolean;
	fullWidth?: boolean;
	size?: ButtonSize;
	variant?: 'solid' | 'outline' | 'link' | 'icon';
	action?: 'primary' | 'secondary' | 'positive' | 'negative';
	className?: string;
	disabled?: boolean;
	animation?: boolean;
}

const Button = React.forwardRef<View, ButtonProps>(
	(
		{
			children,
			rounded = false,
			fullWidth = false,
			size = 'md',
			variant = 'solid',
			action = 'primary',
			className = '',
			disabled = false,
			animation = true,
			...props
		},
		ref,
	) => {
		// useScaleAnimation 훅을 사용하여 애니메이션 로직 구현
		const { animatedStyle, handlePressIn, handlePressOut } = useScaleAnimation({
			enabled: animation,
			scale: 0.96,
			damping: 8,
			stiffness: 100,
		});
		// 자식 요소에 size, variant, action 속성 전달
		const childrenWithProps = Children.map(children, (child) => {
			// 유효한 React 요소인지 확인
			if (isValidElement(child)) {
				const childProps = child.props;

				return React.cloneElement(child, {
					...childProps,
					size: childProps.size || size,
					variant: childProps.variant || variant,
					action: childProps.action || action,
				});
			}
			return child;
		});

		return (
			<Animated.View
				style={animation ? animatedStyle : undefined}
				className={fullWidth ? 'w-full' : 'w-auto'}
			>
				<Pressable
					ref={ref}
					className={cn(
						buttonStyles({ rounded, fullWidth, size, variant, action }),
						disabled && 'opacity-50',
						className,
					)}
					disabled={disabled}
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					{...props}
				>
					{childrenWithProps}
				</Pressable>
			</Animated.View>
		);
	},
);

// ButtonText component
export interface ButtonTextProps
	extends Omit<ComponentPropsWithoutRef<typeof Text>, 'style'> {
	children?: ReactNode;
	size?: ButtonSize;
	variant?: 'solid' | 'outline' | 'link' | 'icon';
	action?: 'primary' | 'secondary' | 'positive' | 'negative';
	className?: string;
}

const ButtonText = React.forwardRef<Text, ButtonTextProps>(
	(
		{
			children,
			size = 'md',
			variant = 'solid',
			action = 'primary',
			className = '',
			...props
		},
		ref,
	) => {
		return (
			<Text
				ref={ref}
				className={cn(buttonTextStyles({ size, variant, action }), className)}
				{...props}
			>
				{children}
			</Text>
		);
	},
);

// ButtonIcon component
export interface ButtonIconProps {
	as: React.ElementType;
	size?: ButtonSize;
	variant?: 'solid' | 'outline' | 'link' | 'icon';
	action?: 'primary' | 'secondary' | 'positive' | 'negative';
	className?: string;
	color?: string;
	strokeWidth?: number;
	fill?: string;
	stroke?: string;
}

const ButtonIcon = React.forwardRef<View, ButtonIconProps>(
	(
		{
			as: Icon,
			size = 'md',
			variant = 'solid',
			action = 'primary',
			className = '',
			...props
		},
		ref,
	) => {
		return (
			<View ref={ref} className="items-center justify-center">
				<UIIcon
					className={cn(buttonIconStyles({ size, variant, action }), className)}
					as={Icon}
					{...props}
				/>
			</View>
		);
	},
);

Button.displayName = 'Button';
ButtonText.displayName = 'ButtonText';
ButtonIcon.displayName = 'ButtonIcon';

export { Button, ButtonText, ButtonIcon };
