import { auth } from '@/firebase/config';
import { getUser } from '@/api/auth';
import { useAuthStore } from '@/store/auth';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';

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
		const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
		return subscriber;
	}, [onAuthStateChanged]);

	useEffect(() => {
		if (!fontLoaded || loading) return;
		setIsLoaded(true);
	}, [fontLoaded, loading]);

	return [loaded, isAuthenticated];
}
