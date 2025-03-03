import { Slot } from 'expo-router';
import '#/global.css';
import { GluestackUIProvider } from '#/components/ui/gluestack-ui-provider';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetProvider } from '@/components/common/BottomSheetProvider';
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from 'react-native-reanimated';

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});

export default function Root() {
	const colorScheme = useColorScheme();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<GluestackUIProvider style={{ backgroundColor: '#f5f5f5cf' }}>
				<BottomSheetProvider>
					<Slot />
					<StatusBar style="auto" />
				</BottomSheetProvider>
			</GluestackUIProvider>
		</GestureHandlerRootView>
	);
}
