import Header from '@/components/common/Header';
import { router } from 'expo-router';
import { SafeAreaView, Text } from 'react-native';

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
