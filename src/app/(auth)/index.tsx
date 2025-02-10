import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';
import { Text } from '#/components/ui/text';
import { useOnboardingStore } from '@/store/onboarding';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ButtonText } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';

function AuthStepScreen() {
	const { isAuthenticated } = useAuthStore();
	const { setStep } = useOnboardingStore();

	return (
		<SafeAreaView>
			<VStack className="mx-4 items-center justify-center h-full gap-28">
				<VStack space="sm" className="w-full">
					<Heading size="2xl">소그룹</Heading>
					<Text size="xl">우리 교회 소그룹 나눔 도우미</Text>
				</VStack>
				<VStack space="md" className="w-full">
					<Button
						onPress={() => {
							setStep('EMAIL_SIGNIN');
							router.push('/(auth)/onboarding');
						}}
					>
						<ButtonText>이메일로 로그인</ButtonText>
					</Button>
					<Button
						onPress={() => {
							setStep('EMAIL_SIGNUP');
							router.push('/(auth)/onboarding');
						}}
					>
						<ButtonText>이메일로 회원가입</ButtonText>
					</Button>
				</VStack>
				<Text size="sm">
					로그인 시 개인정보취급방침과 이용약관에 동의하는 것으로 간주합니다.
				</Text>
			</VStack>
		</SafeAreaView>
	);
}

export default AuthStepScreen;
