import { auth } from '@/firebase/config';
import { useAuthStore } from '@/store/auth';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { getAnalytics } from '@react-native-firebase/analytics';
import { setUserId, logEvent, AnalyticsEvents } from '@/utils/analytics';
import { getToken } from '@/api/messaging';

export function useInitializeApp() {
	const [loaded, setIsLoaded] = useState(false);

	const [fontLoaded, error] = useFonts({
		PretendardExtraBold: require('../../assets/fonts/Pretendard-ExtraBold.otf'),
		PretendardBold: require('../../assets/fonts/Pretendard-Bold.otf'),
		PretendardSemiBold: require('../../assets/fonts/Pretendard-SemiBold.otf'),
		PretendardMedium: require('../../assets/fonts/Pretendard-Medium.otf'),
		PretendardRegular: require('../../assets/fonts/Pretendard-Regular.otf'),
		PretendardLight: require('../../assets/fonts/Pretendard-Light.otf'),
	});

	const { onAuthStateChanged, loading, isAuthenticated } = useAuthStore();

	useEffect(() => {
		const subscriber = auth.onAuthStateChanged(async (user) => {
			const token = await getToken();
			// Handle auth state in the store
			onAuthStateChanged(user, token);

			// Set user ID for analytics
			if (user) {
				await setUserId(user.uid);
			} else {
				await setUserId(null);
			}
		});
		return subscriber;
	}, [onAuthStateChanged]);

	useEffect(() => {
		if (!fontLoaded || loading) return;

		// Initialize analytics when app is loaded
		initAnalytics();
		setIsLoaded(true);
	}, [fontLoaded, loading]);

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
