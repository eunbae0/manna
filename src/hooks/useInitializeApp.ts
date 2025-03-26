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

	const {
		validateUserCredentials,
		loading,
		isAuthenticated,
		updateUser,
		updateAuthenticated,
	} = useAuthStore();

	// useEffect(() => {
	// 	const unsubscribe = auth.onAuthStateChanged(async (user) => {
	// 		// 1. 사용자가 직접 로그아웃
	// 		// 2. Oauth의 세션 만료?
	// 		if (!user) {
	// 			updateAuthenticated(false);
	// 			return;
	// 		}
	// 		try {
	// 			const userFromFirestore = await getUser(user.uid);
	// 			updateAuthenticated(true);
	// 		} catch (error) {
	// 			throw new Error('Firestore에서 유저 정보를 가져오지 못했습니다');
	// 		}
	// 	});
	// 	return unsubscribe();
	// }, [updateUser, updateAuthenticated]);

	useEffect(() => {
		(async () => {
			await validateUserCredentials();
		})();
	}, [validateUserCredentials]);

	useEffect(() => {
		if (!fontLoaded || loading) return;
		setIsLoaded(true);
	}, [fontLoaded, loading]);

	return [loaded, isAuthenticated];
}
