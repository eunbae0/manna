import React, { Children, isValidElement, useRef, useCallback } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useScaleAnimation } from '@/shared/hooks';
import { cn } from '@/shared/utils/cn';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { Icon as UIIcon } from '#/components/ui/icon';
import { Text, type TextProps } from '@/shared/components/text';
import * as Haptics from 'expo-haptics';

// Define button size type
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Button base component with rounded and size variants
const buttonStyles = cva('flex-row items-center justify-center', {
	variants: {
		rounded: {
			true: 'rounded-full',
			false: 'rounded-xl',
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
			text: 'bg-transparent px-2',
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
			class: 'bg-transparent border-background-300 active:bg-background-50',
		},
		{
			variant: 'outline',
			action: 'positive',
			class: 'bg-transparent border-success-500 active:bg-success-50',
		},
		{
			variant: 'outline',
			action: 'negative',
			class: 'bg-transparent border-error-500 active:bg-error-50',
		},
		{
			variant: 'link',
			action: 'primary',
			class: 'bg-transparent active:bg-background-200',
		},
		{
			variant: 'text',
			action: 'primary',
			class: 'bg-transparent active:bg-background-100',
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
const buttonTextStyles = cva('font-pretendard-Medium', {
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
			link: 'text-primary-500',
			text: 'text-primary-500',
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
			class: 'text-typography-700',
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
			variant: 'link',
			action: 'primary',
			class: 'text-primary-500',
		},
		{
			variant: 'text',
			action: 'primary',
			class: 'text-primary-500',
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
			solid: 'text-white',
			outline: 'text-primary-500',
			link: 'text-primary-500',
			text: 'text-primary-500',
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
			class: 'text-typography-700',
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
			variant: 'text',
			action: 'primary',
			class: 'text-primary-500',
		},
		{
			variant: 'text',
			action: 'secondary',
			class: 'text-secondary-500',
		},
		{
			variant: 'text',
			action: 'positive',
			class: 'text-success-500',
		},
		{
			variant: 'text',
			action: 'negative',
			class: 'text-error-500',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'xs',
			class: 'text-typography-900 h-3 w-3',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'sm',
			class: 'text-typography-900 h-4 w-4',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'md',
			class: 'text-typography-900 h-5 w-5',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'lg',
			class: 'text-typography-900 h-6 w-6',
		},
		{
			variant: 'icon',
			action: 'primary',
			size: 'xl',
			class: 'text-typography-900 h-7 w-7',
		},
	],
});

export interface ButtonProps
	extends Omit<ComponentPropsWithoutRef<typeof Pressable>, 'children'>,
		VariantProps<typeof buttonStyles> {
	children?: ReactNode;
	size?: ButtonSize;
	variant?: 'solid' | 'outline' | 'link' | 'text' | 'icon';
	action?: 'primary' | 'secondary' | 'positive' | 'negative';
	className?: string;
	disabled?: boolean;
	animation?: boolean;
	throttleTime?: number;
	innerClassName?: string;
	withHaptic?: boolean;
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
			innerClassName,
			disabled = false,
			animation = true,
			throttleTime = 300, // 기본 쓰로틀 시간 300ms
			withHaptic = false,
			onPress,
			...props
		},
		ref,
	) => {
		// 마지막 클릭 시간을 추적하기 위한 ref
		const lastPressTimeRef = useRef<number>(0);

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
				className={cn(
					fullWidth ? 'w-full' : 'w-auto',
					rounded ? 'rounded-full' : '',
					className,
				)}
			>
				<Pressable
					ref={ref}
					className={cn(
						buttonStyles({ rounded, fullWidth, size, variant, action }),
						disabled && 'opacity-50',
						innerClassName,
					)}
					disabled={disabled}
					onPressIn={(e) => {
						// 쓰로틀링 기능 구현: 지정된 시간 내에 중복 호출 방지
						const now = Date.now();
						if (now - lastPressTimeRef.current < throttleTime) {
							// 지정된 시간보다 빠르게 호출되면 무시
							return;
						}

						// 마지막 클릭 시간 업데이트
						lastPressTimeRef.current = now;

						if (withHaptic) {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
						}
						// 애니메이션 및 이벤트 호출
						handlePressIn();
						props.onPressIn?.(e);
					}}
					onPressOut={(e) => {
						handlePressOut();
						onPress?.(e);
						props.onPressOut?.(e);
					}}
					{...props}
				>
					{childrenWithProps}
				</Pressable>
			</Animated.View>
		);
	},
);

// ButtonText component
export interface ButtonTextProps extends TextProps {
	children?: ReactNode;
	size?: ButtonSize;
	variant?: 'solid' | 'outline' | 'link' | 'text' | 'icon';
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
				className={cn(
					buttonTextStyles({ size, variant, action }),
					'font-pretendard-Medium',
					className,
				)}
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
	variant?: 'solid' | 'outline' | 'link' | 'text' | 'icon';
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
