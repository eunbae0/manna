import { useCallback, useEffect } from 'react';
import appsFlyer from 'react-native-appsflyer';
import { Linking } from 'react-native';
import { type Href, useRouter } from 'expo-router';

export function useDeepLink() {
	const router = useRouter();

	const navigateToDeepLink = useCallback(
		(status: 'FOUND' | 'NOT_FOUND' | 'ERROR', screen: string) => {
			if (status !== 'FOUND') return;

			const path = screen.replaceAll('_', '/') as Href;
			router.push(path);
		},
		[router],
	);

	useEffect(() => {
		appsFlyer.onDeepLink((result) => {
			navigateToDeepLink(result.deepLinkStatus, result.data.af_screen);
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
				null
			},
			(error) => {
				console.error(error);
			},
		);

		appsFlyer.startSdk()

		const handleUrl = ({url}: {url: string}) => {
			if (url) {
				appsFlyer.performOnAppAttribution(
					url,
					() => {
					null
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
			if(!url) return;
			handleUrl({url})
		});

		return () => {
			subscription?.remove();
			appsFlyer.stop(true);
		};
	}, [navigateToDeepLink]);
}
