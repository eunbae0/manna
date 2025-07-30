import CreateGroupContainerScreen from '@/features/group/screens/create-group/CreateGroupContainerScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GroupScreen() {
	return (
		<SafeAreaView className="flex-1">
			{' '}
			<CreateGroupContainerScreen />
		</SafeAreaView>
	);
}
