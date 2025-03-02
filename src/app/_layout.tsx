import { Slot } from 'expo-router';
import '#/global.css';
import { GluestackUIProvider } from '#/components/ui/gluestack-ui-provider';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function Root() {
	const colorScheme = useColorScheme();

	return (
		<GluestackUIProvider>
			<Slot />
			<StatusBar style="auto" />
		</GluestackUIProvider>
	);
}
