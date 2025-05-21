import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { isAndroid } from '../utils/platform';

/**
 * Hook to handle hardware back button press
 * @param callback Function to be called when back button is pressed
 * @returns void
 */
export function useBackHandler(callback: () => boolean): void {
	if (!isAndroid) return;

	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			'hardwareBackPress',
			callback,
		);

		return () => {
			backHandler.remove();
		};
	}, [callback]);
}
