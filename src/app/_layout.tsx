import { Slot, Stack } from 'expo-router';
import { GluestackUIProvider } from '#/components/ui/gluestack-ui-provider';
import { StatusBar } from 'expo-status-bar';
import { ToastContainer } from '@/components/common/toast/ToastContainer';
import { ScreenTracker } from '@/components/analytics/ScreenTracker';

import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from 'react-native-reanimated';
import { useReactQueryDevTools } from '@dev-plugins/react-query';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '#/global.css';
import 'react-native-reanimated';
import 'react-native-get-random-values';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as SystemUI from 'expo-system-ui';
import { useNotification } from '@/hooks/useNotification';
import * as Sentry from '@sentry/react-native';
import { useSentry } from '@/hooks/useSentry';
import { SENTRY_DSN } from '@/shared/constants/keys';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useBackAlertOnExit } from '@/shared/hooks/useBackAlertOnExit';
import { isAndroid } from '@/shared/utils/platform';
import * as amplitude from '@amplitude/analytics-react-native';
import { useNotificationGroupChange } from '@/shared/hooks/useNotificationGroupChange';

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});

const navigationIntegration = Sentry.reactNavigationIntegration({
	enableTimeToInitialDisplay: !__DEV__,
});

Sentry.init({
	dsn: SENTRY_DSN,
	debug: false,
	tracesSampleRate: 1.0,
	integrations: [navigationIntegration],
	enableNativeFramesTracking: !__DEV__,
	enabled: !__DEV__,
});

// biome-ignore lint/style/noNonNullAssertion: <explanation>
if (!__DEV__) amplitude.init(process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY!);

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5분
		},
	},
});

function RootLayout() {
	const colorScheme = useColorScheme();

	useReactQueryDevTools(queryClient);

	useNotification();

	// Android
	if (isAndroid) {
		useBackAlertOnExit();
	}

	useSentry(navigationIntegration);

	// 알림을 통해 들어온 경우 그룹 변경 처리
	useNotificationGroupChange();

	return (
		<QueryClientProvider client={queryClient}>
			<KeyboardProvider>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<GluestackUIProvider>
						<BottomSheetModalProvider>
							<ScreenTracker />
							<Stack
								screenOptions={{
									headerShown: false,
								}}
							>
								<Stack.Screen name="policy" />
							</Stack>
							<StatusBar style="auto" />
							<ToastContainer />
						</BottomSheetModalProvider>
					</GluestackUIProvider>
				</GestureHandlerRootView>
			</KeyboardProvider>
		</QueryClientProvider>
	);
}

export default Sentry.wrap(RootLayout);
