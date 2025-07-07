import { SafeAreaView } from 'react-native-safe-area-context';
import CreateGroupContainerScreen from '@/features/group/screens/create-group/CreateGroupContainerScreen';

export default function GroupScreen() {
	return (
		<SafeAreaView className="flex-1">
			<CreateGroupContainerScreen />
		</SafeAreaView>
	);
}
