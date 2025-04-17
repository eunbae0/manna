import { auth } from '@/firebase/config';
import { useAuthStore } from '@/store/auth';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { getAnalytics } from '@react-native-firebase/analytics';
import { setUserId, logEvent, AnalyticsEvents } from '@/utils/analytics';
import { getToken } from '@/api/messaging';
import { useAppVersionCheck } from './useAppVersionCheck';

export function useInitializeApp() {
	const [loaded, setIsLoaded] = useState(false);
	// 앱 버전 체크 초기화
	const { isLoading: versionCheckLoading } = useAppVersionCheck();

	const [fontLoaded, error] = useFonts({
		PretendardExtraBold: require('../../assets/fonts/Pretendard-ExtraBold.otf'),
		PretendardBold: require('../../assets/fonts/Pretendard-Bold.otf'),
		PretendardSemiBold: require('../../assets/fonts/Pretendard-SemiBold.otf'),
		PretendardMedium: require('../../assets/fonts/Pretendard-Medium.otf'),
		PretendardRegular: require('../../assets/fonts/Pretendard-Regular.otf'),
		PretendardLight: require('../../assets/fonts/Pretendard-Light.otf'),
	});

	const { onAuthStateChanged, isAuthenticated } = useAuthStore();
	const [authLoading, setAuthLoading] = useState(true);

	useEffect(() => {
		const subscriber = auth.onAuthStateChanged(async (user) => {
			setAuthLoading(true);
			const fcmToken = await getToken();
			// Handle auth state in the store
			await onAuthStateChanged(user, fcmToken);

			// Set user ID for analytics
			if (user) {
				await setUserId(user.uid);
			} else {
				await setUserId(null);
			}
			setAuthLoading(false);
		});
		return subscriber;
	}, [onAuthStateChanged]);

	useEffect(() => {
		if (!fontLoaded || authLoading || versionCheckLoading) return;

		// Initialize analytics when app is loaded
		initAnalytics();
		setIsLoaded(true);
	}, [fontLoaded, authLoading, versionCheckLoading]);

	// 앱 버전 체크 상태도 로딩에 포함

	return [loaded, isAuthenticated];
}

async function initAnalytics() {
	try {
		// Enable analytics collection
		await getAnalytics().setAnalyticsCollectionEnabled(true);

		// Log app_open event
		await logEvent(AnalyticsEvents.APP_OPEN);

		console.log('[Analytics] Firebase Analytics initialized');
	} catch (error) {
		console.error('[Analytics] Error initializing Firebase Analytics:', error);
	}
}
