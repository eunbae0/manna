import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

export const goBackOrReplaceHome = () => {
	router.canGoBack() ? router.back() : routingToHome();
};

export const openProfile = (userId: string) => {
	router.push({
		pathname: '/(app)/(profile)/profile-index',
		params: { userId },
	});
};

export const routingToHome = () => {
	router.dismissTo('/(app)');
};
