import type { ButtonVariant } from '@/constants/design';
import { colors } from './colors';

const palette = {
	purpleLight: '#8C6FF7',
	purplePrimary: '#5A31F4',
	purpleDark: '#3F22AB',

	greenLight: '#56DCBA',
	greenPrimary: '#0ECD9D',
	greenDark: '#0A906E',

	darkGray: '#121212',

	black: '#0B0B0B',
	white: '#F0F2F3',

	primary: '#FAE1B8',
	primaryDark: '#E0C29A', // Primary 색상의 어두운 변형
	primaryLight: '#FFF4E0', // Primary 색상의 밝은 변형
	secondary: '#B8D4FA', // 보조 색상 (예시)
	background: '#FFFFFF', // 배경색
	textPrimary: '#333333', // 기본 텍스트 색상
	textSecondary: '#666666', // 보조 텍스트 색상
};

export const theme = {
	color: {
		...colors,
		mainBackground: palette.white,
		mainForeground: palette.black,
	},
	spacing: {
		xs: 4,
		sm: 8,
		md: 12,
		lg: 16,
		xl: 20,
	},
	textVariants: {
		header: {
			fontWeight: 'bold',
			fontSize: 34,
		},
		body: {
			fontSize: 16,
			lineHeight: 24,
		},
		defaults: {},
	},
	borderRadii: {
		xs: 2,
		sm: 4,
		md: 6,
		lg: 10,
		xl: 16,
	},
	buttonVariants: {
		defaults: {
			backgroundColor: 'primary-500',
		},
		solid: {
			backgroundColor: 'primary-500',
			// backgroundColor: colors['primary-500'],
		},
		outlined: { backgroundColor: '' },
		transparent: { backgroundColor: '' },
		link: { backgroundColor: '' },
	} satisfies Record<ButtonVariant | 'defaults', { backgroundColor: string }>,
	buttonSizes: {
		defaults: {
			padding: 'lg',
		},
		lg: {
			padding: 'lg',
		},
	},
};

export type Theme = typeof theme;

export const darkTheme: Theme = {
	...theme,
	color: {
		...theme.color,
		mainBackground: palette.black,
		mainForeground: palette.white,
	},
};
