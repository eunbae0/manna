import { Slot } from 'expo-router';
import { GluestackUIProvider } from '#/components/ui/gluestack-ui-provider';
import { StatusBar } from 'expo-status-bar';
import { ToastContainer } from '@/components/common/toast/ToastContainer';

import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from 'react-native-reanimated';
import { useReactQueryDevTools } from '@dev-plugins/react-query';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PortalProvider } from '@gorhom/portal';

import '#/global.css';
import 'react-native-reanimated';
import 'react-native-get-random-values';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as SystemUI from 'expo-system-ui';

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});

export default function Root() {
	const colorScheme = useColorScheme();
	const queryClient = new QueryClient();

	useReactQueryDevTools(queryClient);

	return (
		<QueryClientProvider client={queryClient}>
			<KeyboardProvider>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<GluestackUIProvider>
						<PortalProvider>
							<Slot />
							<StatusBar style="auto" />
							<ToastContainer />
						</PortalProvider>
					</GluestackUIProvider>
				</GestureHandlerRootView>
			</KeyboardProvider>
		</QueryClientProvider>
	);
}
