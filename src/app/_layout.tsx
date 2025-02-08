import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@shopify/restyle';
import 'react-native-reanimated';

import { theme, darkTheme } from '@/style/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Root() {
	const colorScheme = useColorScheme();

	return (
		<ThemeProvider theme={colorScheme === 'dark' ? darkTheme : theme}>
			<Slot />
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}
