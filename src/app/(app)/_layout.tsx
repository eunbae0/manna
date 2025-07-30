import { Redirect, router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { AnimatedSplashScreen } from '@/components/common/splash-screen';

import { useInitializeApp } from '@/hooks/useInitializeApp';
import { useAppVersionCheck } from '@/hooks/useAppVersionCheck';
import { AppUpdateModal } from '@/components/common/app-update-modal';
import { useAppUpdateStore } from '@/store/app/app-update';
import { useSplashAnimationStore } from '@/store/app/splash-animation';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, isAuthenticated] = useInitializeApp();
	const { needsUpdate, forceUpdate, updateMessage, latestVersion } =
		useAppVersionCheck();
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const { checkShouldShowUpdateSheet } = useAppUpdateStore();
	const { isAnimationComplete, setAnimationComplete } =
		useSplashAnimationStore();

	useEffect(() => {
		if (loaded) {
			// 애니메이션이 완료되면 SplashScreen을 숨깁니다
			SplashScreen.hideAsync();

			if (isAnimationComplete) {
				// 앱이 로드된 후 업데이트 필요 여부 확인
				if (needsUpdate) {
					setShowUpdateModal(true);
				}

				if (!isAuthenticated) return;
				// 업데이트 시트를 보여줘야 하는지 확인
				(async () => {
					const shouldShowUpdateSheet = await checkShouldShowUpdateSheet();
					if (shouldShowUpdateSheet) {
						router.navigate('/(app)/updateInfoModal');
					}
				})();
			}
		}
	}, [
		loaded,
		needsUpdate,
		isAuthenticated,
		isAnimationComplete,
		checkShouldShowUpdateSheet,
	]);

	// 로딩이 완료되었지만 애니메이션이 아직 진행 중인 경우 커스텀 스플래시 화면을 표시합니다
	if (!loaded) {
		return null;
	}

	// 최초 앱 실행 시에만 애니메이션 스플래시 화면을 표시합니다
	if (loaded && !isAnimationComplete) {
		return (
			<AnimatedSplashScreen
				onAnimationComplete={() => setAnimationComplete(true)}
			/>
		);
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
				<Stack.Screen name="(setting)" options={{ headerShown: false }} />
				<Stack.Screen name="notification" options={{ headerShown: false }} />
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
					name="updateInfoModal"
					options={{
						headerShown: false,
						presentation: 'modal',
					}}
				/>
			</Stack>
		</>
	);
}
