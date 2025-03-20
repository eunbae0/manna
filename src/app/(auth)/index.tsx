import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '#/components/ui/text';
import { useOnboardingStore } from '@/store/onboarding';
import { Button, ButtonIcon, ButtonText } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import { Mail } from 'lucide-react-native';

import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthStore } from '@/store/auth';

function AuthStepScreen() {
	const { signIn } = useAuthStore();
	const { setStep } = useOnboardingStore();

	const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);
	useEffect(() => {
		// Apple 인증이 기기에서 가능한지 확인
		const checkAppleAuthAvailability = async () => {
			const available = await AppleAuthentication.isAvailableAsync();
			setIsAppleAuthAvailable(available);
		};

		checkAppleAuthAvailability();
	}, []);

	const onAppleButtonPress = async () => {
		await signIn('APPLE', undefined);
		setStep('NAME');
	};

	return (
		<SafeAreaView>
			<VStack className="mx-4 items-center justify-between h-full gap-28 py-20">
				<VStack space="sm" className="w-full">
					<Heading size="2xl">소그룹</Heading>
					<Text size="xl">우리 교회 소그룹 나눔 도우미</Text>
				</VStack>
				<VStack space="xl" className="w-full">
					<VStack space="md" className="w-full">
						{isAppleAuthAvailable && (
							<AppleAuthentication.AppleAuthenticationButton
								buttonType={
									AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
								}
								buttonStyle={
									AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
								}
								cornerRadius={999}
								style={{ width: '100%', height: 42 }}
								onPress={onAppleButtonPress}
								className="rounded-full gap-4"
							/>
						)}
						<Button
							onPress={() => {
								setStep('EMAIL');
								router.push('/(auth)/onboarding');
							}}
							size="xl"
							className="rounded-full gap-4"
							action="secondary"
						>
							<ButtonIcon
								as={Mail}
								className="fill-white text-typography-black"
							/>
							<ButtonText size="lg">이메일로 계속하기</ButtonText>
						</Button>
					</VStack>
					<Text size="sm" className="text-center">
						로그인 시 개인정보취급방침과 이용약관에 동의하는 것으로 간주합니다.
					</Text>
				</VStack>
			</VStack>
		</SafeAreaView>
	);
}

export default AuthStepScreen;
