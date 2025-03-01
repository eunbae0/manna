import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text } from '#/components/ui/text';
import { Button, ButtonText } from '#/components/ui/button';
import Header from '@/components/common/Header';
import { useOnboardingStore } from '@/store/onboarding';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import { Input, InputField } from '#/components/ui/input';
import type { TextInput } from 'react-native';

function EmailSignInStepScreen() {
	const { signIn, sendEmailLink } = useAuthStore();
	const { setStep } = useOnboardingStore();
	const [email, setEmail] = useState('');
	const inputRef = useRef<TextInput>(null);

	// deeplink handler

	// auto focus on input when screen is mounted
	useEffect(() => {
		setTimeout(() => {
			inputRef.current?.focus();
		}, 200);
	}, []);

	return (
		<VStack className="h-full">
			<Header
				label="이메일로 계속하기"
				onPressBackButton={() =>
					router.canGoBack() ? router.back() : router.push('/(auth)')
				}
			/>
			<VStack className="flex-1 px-4 mt-8 justify-between" space="4xl">
				<VStack space="4xl">
					<VStack space="sm">
						<Heading size="xl">계속하기 위해 이메일을 입력해주세요</Heading>
						<Text size="lg">입력하신 메일로 확인 링크를 보내드릴게요</Text>
					</VStack>
					<VStack space="lg" reversed={false}>
						<VStack space="sm">
							<Input
								variant="rounded"
								size="xl"
								isDisabled={false}
								isInvalid={false}
								isReadOnly={false}
								className="rounded-2xl"
							>
								<InputField
									//@ts-ignore
									ref={inputRef}
									value={email}
									onChangeText={(text) => {
										setEmail(text);
									}}
									placeholder="example@gmail.com"
								/>
							</Input>
						</VStack>
					</VStack>
				</VStack>
				<Button
					onPress={async () => {
						if (email.length === 0) return;
						await sendEmailLink(email);
					}}
					isDisabled={email.length === 0}
					size="xl"
					className="rounded-full mb-5"
				>
					<ButtonText>계속하기</ButtonText>
				</Button>
			</VStack>
		</VStack>
	);
}
export default EmailSignInStepScreen;
