import { Text } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '#/components/ui/button';

export default function HomeScreen() {
	return (
		<SafeAreaView>
			<Text>메인</Text>
			<Button
				onPress={() => {
					router.push('/group/1');
				}}
			/>
		</SafeAreaView>
	);
}
