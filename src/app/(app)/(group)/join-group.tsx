import { SafeAreaView } from 'react-native-safe-area-context';
import JoinGroupScreen from '@/features/group/screens/join-group/JoinGroupScreen';

export default function GroupJoinScreen() {
	return (
		<SafeAreaView className="flex-1">
			<JoinGroupScreen />
		</SafeAreaView>
	);
}
