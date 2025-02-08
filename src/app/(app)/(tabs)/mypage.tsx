import Button from '@/components/common/Button';
import { useAuthStore } from '@/store/auth';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabThreeScreen() {
	const { user, logout } = useAuthStore();
	return (
		<SafeAreaView>
			<Text>마이페이지</Text>
			<Text>{user?.email}</Text>
			<Button label="로그아웃" onPress={async () => await logout()} />
		</SafeAreaView>
	);
}
