import { Text } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/common/Button';
import { router } from 'expo-router';

export default function HomeScreen() {
	return (
		<SafeAreaView>
			<Text>메인</Text>
			<Button
				label="go to group"
				onPress={() => {
					router.push('/group/1');
				}}
			/>
		</SafeAreaView>
	);
}
