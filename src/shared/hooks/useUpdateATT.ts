import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { useAuthStore } from '@/store/auth';
import { serverTimestamp } from '@react-native-firebase/firestore';

export function useUpdateATT() {
	const { user, updateUserProfile } = useAuthStore();

	const updateATT = async () => {
		if (!user) return;

		const { granted, canAskAgain } = await requestTrackingPermissionsAsync();

		if (!granted) return;

		updateUserProfile(user.id, {
			permissions: {
				tracking: {
					isGranted: granted,
					canAskAgain,
					lastAsked: serverTimestamp(),
				},
			},
		});
	};
	return { updateATT };
}
