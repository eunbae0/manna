import Header from '@/components/common/Header';
import { router } from 'expo-router';
import { SafeAreaView, Text } from 'react-native';

export default function NotificationSettingScreen() {
	return (
		<SafeAreaView>
			<Header
				label={'알림 설정'}
				onPressBackButton={() => {
					router.back();
				}}
			/>
			<Text>알림 설정</Text>
		</SafeAreaView>
	);
}
