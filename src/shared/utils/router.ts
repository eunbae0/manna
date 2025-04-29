import { router } from 'expo-router';

export const goBackOrReplaceHome = () => {
	router.canGoBack() ? router.back() : router.replace('/(app)');
};

export const openProfile = (userId: string) => {
	router.push({
		pathname: '/(app)/(profile)/profile-index',
		params: { userId },
	});
};
