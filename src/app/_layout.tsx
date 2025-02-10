import { Slot } from 'expo-router';
import '#/global.css';
import { GluestackUIProvider } from '#/components/ui/gluestack-ui-provider';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function Root() {
	const colorScheme = useColorScheme();

	return (
		<GluestackUIProvider mode={colorScheme === 'light' ? 'light' : 'dark'}>
			<Slot />
			<StatusBar style="auto" />
		</GluestackUIProvider>
	);
}
