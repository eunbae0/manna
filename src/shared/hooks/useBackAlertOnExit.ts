import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, BackHandler, ToastAndroid } from 'react-native';

/**
 * useBackAlertOnExit
 * Shows a confirmation alert when the user attempts to exit the app using the hardware back button on Android.
 * Cancels the exit if user presses 'Cancel'.
 * Exits the app if user presses 'YES'.
 */
export function useBackAlertOnExit(): void {
	const backPressCount = useRef(0);

	useEffect(() => {
		const backAction = () => {
			backPressCount.current += 1;
			if (backPressCount.current >= 2) {
				BackHandler.exitApp();
				backPressCount.current = 0;
				return true;
			}
			ToastAndroid.show(
				'앱을 종료하려면 한 번 더 눌러주세요.',
				ToastAndroid.SHORT,
			);
			return true;
		};

		const backHandler = BackHandler.addEventListener(
			'hardwareBackPress',
			backAction,
		);

		return () => {
			backHandler.remove();
			backPressCount.current = 0;
		};
	}, []);
}
