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
import { Icon, createIcon } from '#/components/ui/icon';
import { Path, Svg } from 'react-native-svg';

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
					<Text size="xl">우리 공동체 소그룹 나눔 도우미</Text>
				</VStack>
				<VStack space="xl" className="w-full">
					<VStack space="3xl" className="w-full">
						<VStack space="lg" className="w-full">
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
								size="lg"
								className="bg-white"
								rounded
								variant="outline"
							>
								<ButtonIcon
									as={GoogleIcon}
									className="fill-white text-typography-black"
								/>
								<ButtonText size="lg">Google로 계속하기</ButtonText>
							</Button>
							<Button
								onPress={() => {
									setStep('EMAIL_SIGN_IN');
									router.push('/(auth)/onboarding');
								}}
								size="lg"
								rounded
							>
								<ButtonIcon as={Mail} />
								<ButtonText size="lg">이메일로 로그인하기</ButtonText>
							</Button>
						</VStack>
						<HStack space="md" className="items-center w-full">
							<Divider className="flex-1" />
							<Text>또는</Text>
							<Divider className="flex-1" />
						</HStack>
						<Button
							onPress={() => {
								setStep('EMAIL_SIGN_UP');
								router.push('/(auth)/onboarding');
							}}
							size="lg"
							rounded
							variant="outline"
						>
							<ButtonIcon as={Mail} />
							<ButtonText size="lg">이메일로 회원가입하기</ButtonText>
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

function GoogleIcon() {
	const GluestackIcon = createIcon({
		viewBox: '0 0 50 50',
		path: (
			<Svg viewBox="0 0 50 50" width="50px" height="50px">
				<Path d="M 26 2 C 13.308594 2 3 12.308594 3 25 C 3 37.691406 13.308594 48 26 48 C 35.917969 48 41.972656 43.4375 45.125 37.78125 C 48.277344 32.125 48.675781 25.480469 47.71875 20.9375 L 47.53125 20.15625 L 46.75 20.15625 L 26 20.125 L 25 20.125 L 25 30.53125 L 36.4375 30.53125 C 34.710938 34.53125 31.195313 37.28125 26 37.28125 C 19.210938 37.28125 13.71875 31.789063 13.71875 25 C 13.71875 18.210938 19.210938 12.71875 26 12.71875 C 29.050781 12.71875 31.820313 13.847656 33.96875 15.6875 L 34.6875 16.28125 L 41.53125 9.4375 L 42.25 8.6875 L 41.5 8 C 37.414063 4.277344 31.960938 2 26 2 Z M 26 4 C 31.074219 4 35.652344 5.855469 39.28125 8.84375 L 34.46875 13.65625 C 32.089844 11.878906 29.199219 10.71875 26 10.71875 C 18.128906 10.71875 11.71875 17.128906 11.71875 25 C 11.71875 32.871094 18.128906 39.28125 26 39.28125 C 32.550781 39.28125 37.261719 35.265625 38.9375 29.8125 L 39.34375 28.53125 L 27 28.53125 L 27 22.125 L 45.84375 22.15625 C 46.507813 26.191406 46.066406 31.984375 43.375 36.8125 C 40.515625 41.9375 35.320313 46 26 46 C 14.386719 46 5 36.609375 5 25 C 5 13.390625 14.386719 4 26 4 Z" />
			</Svg>
		),
	});
	return (
		<Icon as={GluestackIcon} size="xl" className="text-typography-black" />
	);
}
