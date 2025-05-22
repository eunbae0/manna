import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/auth';
import GroupHomeScreen from '@/features/home/screens/GroupHomeScreen';
import EmptyGroupHomeScreen from '@/features/home/screens/EmptyGroupHomeScreen';

export default function HomeScreen() {
	const { user } = useAuthStore();
	const isGroup = (user?.groups?.length ?? 0) > 0;

	return isGroup ? (
		<GroupHomeScreen />
	) : (
		<EmptyGroupHomeScreen />
	)
}
