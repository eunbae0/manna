import { router } from 'expo-router';
import GroupLandingScreen, {
	type GroupLandingOption,
} from '@/features/group/screens/GroupLandingScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EmptyGroupScreen() {
	const handleOptionPress = (option: GroupLandingOption) => {
		if (option === 'create') {
			router.push('/(app)/(group)/create-group');
		} else if (option === 'join') {
			router.push('/(app)/(group)/join-group');
		}
	};

	return (
		<SafeAreaView className="flex-1">
			<GroupLandingScreen handlePressOption={handleOptionPress} />
		</SafeAreaView>
	);
}
