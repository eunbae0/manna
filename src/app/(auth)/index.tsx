import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '#/components/ui/text';
import { useOnboardingStore } from '@/store/onboarding';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import { Mail } from 'lucide-react-native';

import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthStore } from '@/store/auth';
import { Divider } from '#/components/ui/divider';
import { HStack } from '#/components/ui/hstack';

function AuthStepScreen() {
	const { signIn } = useAuthStore();
	const { setStep, setOnboarding } = useOnboardingStore();

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
		const { id } = await signIn('APPLE', undefined);
		setOnboarding(id);
	};

	const onGoogleButtonPress = async () => {
		const { id } = await signIn('GOOGLE', undefined);
		setOnboarding(id);
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
							onPress={onGoogleButtonPress}
							size="xl"
							className="bg-white rounded-full gap-4"
							action="secondary"
						>
							<ButtonIcon
								as={Mail}
								className="fill-white text-typography-black"
							/>
							<ButtonText size="lg">Google로 계속하기</ButtonText>
						</Button>
						<Button
							onPress={() => {
								setStep('EMAIL_SIGN_IN');
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
							<ButtonText size="lg">이메일로 로그인하기</ButtonText>
						</Button>
						<HStack space="md" className="items-center w-full">
							<Divider className="flex-1" />
							<Text>또는</Text>
							<Divider className="flex-1" />
						</HStack>
					</VStack>

					<Button
						onPress={() => {
							setStep('EMAIL_SIGN_UP');
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
						<ButtonText size="lg">이메일로 회원가입하기</ButtonText>
					</Button>
					<Text size="sm" className="text-center">
						로그인 시 개인정보취급방침과 이용약관에 동의하는 것으로 간주합니다.
					</Text>
				</VStack>
			</VStack>
		</SafeAreaView>
	);
}

export default AuthStepScreen;
