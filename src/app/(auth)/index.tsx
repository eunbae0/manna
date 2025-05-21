import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '#/components/ui/text';
import { useOnboardingStore } from '@/store/onboarding';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { VStack } from '#/components/ui/vstack';
import { Mail } from 'lucide-react-native';

import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthStore } from '@/store/auth';
import { Divider } from '#/components/ui/divider';
import { HStack } from '#/components/ui/hstack';
import { Icon, createIcon } from '#/components/ui/icon';
import { G, Path, Svg } from 'react-native-svg';
import { Pressable } from 'react-native';

function AuthStepScreen() {
	const { signIn } = useAuthStore();
	const { setStep, setOnboarding, updateUserData } = useOnboardingStore();

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
		await signIn('APPLE', { updateUserData });
		setOnboarding();
	};

	const onGoogleButtonPress = async () => {
		await signIn('GOOGLE', { updateUserData });
		setOnboarding();
	};

	return (
		<SafeAreaView>
			<VStack className="mx-4 items-center justify-between h-full gap-28 py-20">
				<VStack space="sm" className="w-full">
					<Heading size="2xl">소그룹</Heading>
					<Text size="xl">크리스천을 위한 소그룹 나눔 플랫폼</Text>
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
								// <Button
								// 	onPress={onAppleButtonPress}
								// 	size="lg"
								// 	className="bg-black"
								// 	rounded
								// 	variant="outline"
								// 	innerClassName="active:bg-black"
								// >
								// 	<ButtonIcon
								// 		as={AppleIcon}
								// 		size="sm"
								// 		className="fill-white text-white text-typography-black"
								// 	/>
								// 	<ButtonText size="lg" className="text-white">
								// 		Apple로 계속하기
								// 	</ButtonText>
								// </Button>
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

					<HStack space="xs" className="items-center justify-center w-full">
						<Text size="sm" className="text-center">
							로그인 시
						</Text>
						<HStack className="items-center">
							<Pressable onPress={() => router.push('/policy')}>
								<Text
									size="sm"
									className="text-center border-b border-typography-500"
								>
									개인정보취급방침과 이용약관
								</Text>
							</Pressable>
							<Text size="sm" className="text-center">
								에 동의하는 것으로 간주합니다.
							</Text>
						</HStack>
					</HStack>
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

function AppleIcon() {
	const GluestackIcon = createIcon({
		viewBox: '0 0 38 38',
		path: (
			<Svg viewBox="0 0 38 38" width="38px" height="38px">
				<G xmlns="http://www.w3.org/2000/svg" id="surface1">
					<Path
						color="#ffffff"
						d="M 26.3125 0 C 26.402344 0 26.488281 0 26.582031 0 C 26.800781 2.679688 25.777344 4.683594 24.535156 6.132812 C 23.3125 7.574219 21.644531 8.96875 18.945312 8.757812 C 18.761719 6.117188 19.785156 4.261719 21.027344 2.8125 C 22.179688 1.464844 24.289062 0.265625 26.3125 0 Z M 26.3125 0 "
					/>
					<Path
						color="#ffffff"
						d="M 34.492188 27.894531 C 34.492188 27.921875 34.492188 27.941406 34.492188 27.96875 C 33.730469 30.265625 32.648438 32.238281 31.328125 34.066406 C 30.121094 35.726562 28.640625 37.960938 26.003906 37.960938 C 23.71875 37.960938 22.207031 36.496094 19.871094 36.457031 C 17.398438 36.414062 16.035156 37.683594 13.773438 38 C 13.515625 38 13.257812 38 13.003906 38 C 11.34375 37.757812 10.003906 36.445312 9.027344 35.261719 C 6.148438 31.757812 3.925781 27.238281 3.511719 21.449219 C 3.511719 20.882812 3.511719 20.316406 3.511719 19.75 C 3.6875 15.609375 5.695312 12.238281 8.371094 10.609375 C 9.785156 9.742188 11.726562 9 13.886719 9.332031 C 14.8125 9.476562 15.757812 9.792969 16.589844 10.105469 C 17.375 10.410156 18.355469 10.945312 19.289062 10.917969 C 19.917969 10.898438 20.546875 10.570312 21.183594 10.335938 C 23.042969 9.667969 24.871094 8.894531 27.277344 9.257812 C 30.167969 9.691406 32.21875 10.976562 33.488281 12.960938 C 31.042969 14.515625 29.109375 16.863281 29.4375 20.871094 C 29.730469 24.511719 31.847656 26.636719 34.492188 27.894531 Z M 34.492188 27.894531 "
					/>
				</G>
			</Svg>
		),
	});
	return (
		<Icon as={GluestackIcon} size="xl" className="text-typography-black" />
	);
}
