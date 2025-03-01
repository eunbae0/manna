import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VStack } from '#/components/ui/vstack';
import { Divider } from '#/components/ui/divider';

import UserList from '@/components/screens/home/UserList';
import HomeList from '@/components/screens/home/HomeList';
import HomeHeader from '@/components/screens/home/HomeHeader';

export default function HomeScreen() {
	return (
		<SafeAreaView>
			<ScrollView showsVerticalScrollIndicator={false}>
				<VStack className="pb-20">
					<VStack space="xl" className="px-5">
						<HomeHeader />
						<UserList />
					</VStack>
					{/* <Divider className="my-4 h-[6px]" /> */}
					<HomeList />
				</VStack>
			</ScrollView>
		</SafeAreaView>
	);
}
