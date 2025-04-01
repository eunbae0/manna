import { Button, ButtonText } from '@/components/common/button';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import Header from '@/components/common/Header';
import { useAuthStore } from '@/store/auth';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOutIcon, UserMinusIcon } from 'lucide-react-native';
import { Box } from '#/components/ui/box';

export default function AccountSettingScreen() {
	const { user, logout, deleteAccount } = useAuthStore();

	const handleDeleteAccount = () => {
		Alert.alert(
			'계정 탈퇴',
			'정말로 계정을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
			[
				{
					text: '취소',
					style: 'cancel',
				},
				{
					text: '탈퇴하기',
					style: 'destructive',
					onPress: async () => {
						await deleteAccount();
					},
				},
			],
			{ cancelable: true },
		);
	};

	const handleLogout = async () => {
		Alert.alert(
			'로그아웃',
			'계정에서 로그아웃 할까요?',
			[
				{
					text: '취소',
					style: 'cancel',
				},
				{
					text: '로그아웃',
					onPress: async () => {
						try {
							await logout();
							router.replace('/(auth)');
						} catch (error) {
							Alert.alert(
								'오류',
								'로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.',
							);
						}
					},
				},
			],
			{ cancelable: true },
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<Header label="계정 설정" onPressBackButton={() => router.back()} />
			<VStack className="flex-1 px-5 py-6 gap-14">
				<VStack space="2xl">
					<Heading size="lg">계정 정보</Heading>
					<VStack className="rounded-lg" space="xs">
						<Text size="md" className="text-typography-600">
							이메일
						</Text>
						<Box className="px-4 py-2 border border-background-500 rounded-2xl">
							<Text size="lg" className="text-typography-600">
								{user?.email || '이메일 정보 없음'}
							</Text>
						</Box>
					</VStack>
				</VStack>

				<VStack space="2xl">
					<Heading size="lg">계정 관리</Heading>
					<VStack space="md">
						<Button
							variant="outline"
							onPress={handleLogout}
							size="lg"
							className="justify-start border-primary-500"
							rounded
						>
							<LogOutIcon className="mr-2" size={18} />
							<ButtonText>로그아웃</ButtonText>
						</Button>
						<Button
							variant="outline"
							action="negative"
							onPress={handleDeleteAccount}
							size="lg"
							className="justify-start"
							rounded
						>
							<UserMinusIcon className="mr-2" size={18} />
							<ButtonText>계정 탈퇴하기</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</VStack>
		</SafeAreaView>
	);
}
