import { useRouter } from 'expo-router';
import { Settings, Users } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { ListItem } from '@/shared/components/ListItem';
import { VStack } from '#/components/ui/vstack';

export default function ManageGroupIndexScreen() {
	const router = useRouter();

	return (
		<SafeAreaView className="h-full">
			<Header label="소그룹 관리하기" />
			<VStack space="xl" className="py-5 px-6">
				<ListItem
					icon={Users}
					label="그룹원 관리"
					onPress={() => {
						router.push('/(app)/(group)/(manage-group)/manage-member');
					}}
				/>
				<ListItem
					icon={Settings}
					label="그룹 설정"
					onPress={() => {
						router.push('/(app)/(group)/(manage-group)/setting-group');
					}}
				/>
			</VStack>
		</SafeAreaView>
	);
}
