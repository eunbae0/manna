import { useLocalSearchParams, useRouter } from 'expo-router';
import { Settings, Users } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { ListItem } from '@/shared/components/ListItem';
import { VStack } from '#/components/ui/vstack';

export default function ManageGroupIndexScreen() {
	const router = useRouter();
	const { groupId } = useLocalSearchParams<{ groupId: string }>();

	return (
		<SafeAreaView className="h-full">
			<Header label="소그룹 관리하기" />
			<VStack space="xl" className="py-5 px-6">
				<ListItem
					icon={Settings}
					label="그룹 설정"
					onPress={() => {
						router.push({
							pathname: '/(app)/(group)/(manage-group)/setting-group',
							params: { groupId },
						});
					}}
				/>
			</VStack>
		</SafeAreaView>
	);
}
