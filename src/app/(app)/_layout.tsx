import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { useInitializeApp } from '@/hooks/useInitializeApp';
import { useAppVersionCheck } from '@/hooks/useAppVersionCheck';
import { AppUpdateModal } from '@/components/common/app-update-modal';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, isAuthenticated] = useInitializeApp();
	const { needsUpdate, forceUpdate, updateMessage, latestVersion } =
		useAppVersionCheck();
	const [showUpdateModal, setShowUpdateModal] = useState(false);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();

			// 앱이 로드된 후 업데이트 필요 여부 확인
			if (needsUpdate) {
				setShowUpdateModal(true);
			}
		}
	}, [loaded, needsUpdate]);

	if (!loaded) {
		return null;
	}

	if (!isAuthenticated) {
		// On web, static rendering will stop here as the user is not authenticated
		// in the headless Node process that the pages are rendered in.
		return <Redirect href="/(auth)" />;
	}

	return (
		<>
			<AppUpdateModal
				isVisible={showUpdateModal}
				onClose={forceUpdate ? undefined : () => setShowUpdateModal(false)}
				forceUpdate={forceUpdate}
				updateMessage={updateMessage}
				latestVersion={latestVersion || ''}
			/>
			<Stack screenOptions={{ contentStyle: { backgroundColor: 'white' } }}>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="(profile)" options={{ headerShown: false }} />
				<Stack.Screen name="(group)" options={{ headerShown: false }} />
				<Stack.Screen name="(fellowship)" options={{ headerShown: false }} />
				<Stack.Screen name="(prayerRequest)" options={{ headerShown: false }} />
				<Stack.Screen name="(board)" options={{ headerShown: false }} />
				<Stack.Screen name="(note)" options={{ headerShown: false }} />
				<Stack.Screen name="(more)" options={{ headerShown: false }} />
				<Stack.Screen
					name="createPrayerRequestModal"
					options={{
						headerShown: false,
						presentation: 'modal',
					}}
				/>
				<Stack.Screen
					name="selectWorshipTypeModal"
					options={{
						headerShown: false,
						presentation: 'modal',
					}}
				/>
				<Stack.Screen
					name="inviteQrCodeModal"
					options={{
						headerShown: false,
						presentation: 'modal',
					}}
				/>
			</Stack>
		</>
	);
}
