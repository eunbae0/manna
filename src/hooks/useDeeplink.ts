import { useCallback, useEffect } from 'react';
import appsFlyer, { type UnifiedDeepLinkData } from 'react-native-appsflyer';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { storage } from '@/storage';
import { useOnboardingStore } from '@/store/onboarding';

export const STORATE_INVITE_GROUP_CODE = 'invite_group_code';

export function useDeepLink() {
	const router = useRouter();

	const navigateToDeepLink = useCallback(
		(
			status: 'FOUND' | 'NOT_FOUND' | 'ERROR',
			data: UnifiedDeepLinkData['data'],
		) => {
			if (status !== 'FOUND') return;

			const screen = data.af_screen;
			const screenData = data.af_screen_data;

			// group 초대의 경우, 로그인 되지 않은 유저는 screen redirect 제외
			if (data.campaign === 'invite_group') {
				const inviteCode = screenData;
				const currentIsAuthenticated = useAuthStore.getState().isAuthenticated;
				if (!currentIsAuthenticated) {
					storage.set(STORATE_INVITE_GROUP_CODE, inviteCode);
					return;
				}
			}
			const pathname = screen.replaceAll('_', '/');
			router.push({ pathname, params: { data: screenData } });
		},
		[router],
	);

	useEffect(() => {
		appsFlyer.onDeepLink((result) => {
			navigateToDeepLink(result.deepLinkStatus, result.data);
		});

		appsFlyer.initSdk(
			{
				devKey: process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY!,
				isDebug: false,
				appId: process.env.EXPO_PUBLIC_APPSTORE_APP_ID!,
				onInstallConversionDataListener: true, //Optional
				onDeepLinkListener: true,
				timeToWaitForATTUserAuthorization: 10, //for iOS 14.5
			},
			() => {
				null;
			},
			(error) => {
				console.error(error);
			},
		);

		appsFlyer.startSdk();

		const handleUrl = ({ url }: { url: string }) => {
			if (url) {
				appsFlyer.performOnAppAttribution(
					url,
					() => {
						null;
					},
					(error) => {
						console.log('performOnAppAttribution error:', error);
					},
				);
			}
		};

		// 포그라운드 접근시 동작
		const subscription = Linking.addEventListener('url', handleUrl);

		// 백그라운드 접근시 동작
		Linking.getInitialURL().then((url) => {
			if (!url) return;
			handleUrl({ url });
		});

		return () => {
			subscription?.remove();
			appsFlyer.stop(true);
		};
	}, [navigateToDeepLink]);
}
