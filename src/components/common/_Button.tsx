import { Text, Pressable, type PressableProps, View } from 'react-native';
import { IconSymbol, type IconSymbolName } from './ui/IconSymbol';
import type { Size, ButtonVariant, IconLocation } from '@/constants/design';

type ButtonProps = {
	label: string;
	size?: Size;
	variant?: ButtonVariant;
	iconName?: IconSymbolName;
	iconSize?: Size | number;
	iconColor?: string;
	iconLocation?: IconLocation;
} & PressableProps;

function Button({
	label,
	size = 'md',
	variant = 'solid',
	iconName,
	iconSize = 'md',
	iconColor,
	iconLocation = 'left',
	...props
}: ButtonProps) {
	return (
		<Pressable {...props}>
			<IconSymbol
				size={formatIconSize(iconSize)}
				name="house.fill"
				color="#ffffff"
			/>
			<Text>{label}</Text>
		</Pressable>
	);
}

export default Button;

function formatIconSize(size: ButtonProps['iconSize']) {
	if (typeof size === 'number') return size;
	switch (size) {
		case 'lg':
			return 32;
		case 'md':
			return 28;
		case 'sm':
			return 24;
		default:
			return 28;
	}
}
