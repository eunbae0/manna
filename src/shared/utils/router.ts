import { router } from 'expo-router';

export const goBackOrReplaceHome = () => {
	router.canGoBack() ? router.back() : router.replace('/(app)');
};
