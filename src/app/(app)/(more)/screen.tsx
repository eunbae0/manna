import Header from '@/components/common/Header';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScreenSettingScreen() {
	return (
		<SafeAreaView>
			<Header
				label={'화면 설정'}
				onPressBackButton={() => {
					router.back();
				}}
			/>
			<Text>화면 설정</Text>
		</SafeAreaView>
	);
}
