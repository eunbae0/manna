import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';
import { Text } from '#/components/ui/text';
import { useOnboardingStore } from '@/store/onboarding';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ButtonIcon, ButtonText } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import { Path } from 'react-native-svg';
import { createIcon } from '#/components/ui/icon';
import { Mail, MailIcon } from 'lucide-react-native';

import * as AppleAuthentication from 'expo-apple-authentication';
import { auth } from '@/firebase/config';
import { useState, useEffect } from 'react';
import { OAuthProvider, signInWithCredential } from 'firebase/auth';

function AuthStepScreen() {
	const { signIn } = useAuthStore();
	const { setStep } = useOnboardingStore();

	const AppleLogoIcon = createIcon({
		viewBox: '0 0 170 170',
		path: (
			<Path
				d="m150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929 0.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002 0.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-0.9 2.61-1.85 5.11-2.86 7.51zm-31.26-123.01c0 8.1021-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375-0.119-0.972-0.188-1.995-0.188-3.07 0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.3113 11.45-8.597 4.62-2.2516 8.99-3.4968 13.1-3.71 0.12 1.0831 0.17 2.1663 0.17 3.2409z"
				fill="white"
			/>
		),
		displayName: 'AppleLogoIcon',
	});

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
						{/* <Button
							onPress={() => {
								setStep('EMAIL');
								router.push('/(auth)/onboarding');
							}}
							size="xl"
							className="rounded-full gap-4"
						>
							<ButtonIcon
								as={AppleLogoIcon}
								className="fill-white text-typography-black"
							/>
							<ButtonText size="lg">Apple로 계속하기</ButtonText>
						</Button> */}
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
