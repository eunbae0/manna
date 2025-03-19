import { SafeAreaView } from 'react-native-safe-area-context';

import { VStack } from '#/components/ui/vstack';

import HomeList from '@/features/home/HomeList';
import HomeHeader from '@/features/home/HomeHeader';

export default function HomeScreen() {
	return (
		<SafeAreaView>
			<VStack space="xl" className="h-full">
				<HomeHeader />
				<HomeList />
			</VStack>
		</SafeAreaView>
	);
}
