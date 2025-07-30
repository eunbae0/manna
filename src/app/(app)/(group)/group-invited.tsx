import { SafeAreaView } from 'react-native-safe-area-context';
import GroupInvitedScreen from '@/features/group/screens/InvitedGroupScreen';

export default function GroupInvitedScreenContainer() {
	return (
		<SafeAreaView className="flex-1">
			<GroupInvitedScreen />
		</SafeAreaView>
	);
}
