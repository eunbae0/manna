import { useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import type { Integration } from '@sentry/types';

export const useSentry = (
	navigationIntegration: Integration & {
		registerNavigationContainer: (navigationContainerRef: unknown) => void;
	},
) => {
	const ref = useNavigationContainerRef();

	useEffect(() => {
		if (ref?.current) {
			navigationIntegration.registerNavigationContainer(ref);
		}
	}, [ref]);
};
