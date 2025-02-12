import { Button, ButtonText } from '#/components/ui/button';
import Header from '@/components/common/Header';
import { logout } from '@/services/auth';
import { router } from 'expo-router';
import { SafeAreaView, Text } from 'react-native';

export default function AccountSettingScreen() {
	return (
		<SafeAreaView>
			<Header
				label={'계정 설정'}
				onPressBackButton={() => {
					router.back();
				}}
			/>
			<Text>계정 설정</Text>
			<Button onPress={async () => await logout()}>
				<ButtonText>로그아웃</ButtonText>
			</Button>
		</SafeAreaView>
	);
}
