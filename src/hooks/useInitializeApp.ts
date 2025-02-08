import { auth } from '@/firebase/config';
import { getFirestoreUser } from '@/services/auth';
import { useAuthStore } from '@/store/auth';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';

export function useInitializeApp() {
	const [loaded, setIsLoaded] = useState(false);

	const [fontLoaded, error] = useFonts({
		SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
	});

	const {
		validateUserCredentials,
		loading,
		isAuthenticated,
		updateUser,
		updateAuthenticated,
	} = useAuthStore();

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged(async (user) => {
			// 1. 사용자가 직접 로그아웃
			// 2. Oauth의 세션 만료?
			if (!user) {
				updateAuthenticated(false);
				return;
			}
			try {
				const userFromFirestore = await getFirestoreUser(user.uid);
				updateUser(userFromFirestore);
				updateAuthenticated(true);
			} catch (error) {
				throw new Error('Firestore에서 유저 정보를 가져오지 못했습니다');
			}
		});
		return unsubscribe();
	}, [updateUser, updateAuthenticated]);

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
