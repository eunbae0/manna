import { createTheme } from '@shopify/restyle';

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
};

export const theme = createTheme({
	colors: {
		mainBackground: palette.white,
		mainForeground: palette.black,
		cardPrimaryBackground: palette.purplePrimary,

		secondaryCardBackground: palette.darkGray,
		secondaryCardText: palette.white,
	},
	spacing: {
		s: 8,
		m: 16,
		l: 24,
		xl: 40,
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
});

export type Theme = typeof theme;

export const darkTheme: Theme = {
	...theme,
	colors: {
		...theme.colors,
		mainBackground: palette.black,
		mainForeground: palette.white,

		secondaryCardBackground: palette.darkGray,
		secondaryCardText: palette.white,
	},
};
