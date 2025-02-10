import { useState } from 'react';
import { router } from 'expo-router';

import { useAuthStore } from '@/store/auth';
import { useOnboardingStore } from '@/store/onboarding';

import Header from '@/components/common/Header';
import { Heading } from '#/components/ui/heading';
import { Input, InputField } from '#/components/ui/input';
import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Button, ButtonText } from '#/components/ui/button';

function EmailSignInStepScreen() {
	const { signInWithEmail } = useAuthStore();
	const { setStep } = useOnboardingStore();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	return (
		<VStack>
			<Header
				label="이메일로 로그인"
				onPressBackButton={() =>
					router.canGoBack() ? router.back() : router.push('/(auth)')
				}
			/>
			<VStack className="px-4 mt-8 justify-between" space="4xl">
				<VStack space="lg">
					<VStack space="sm">
						<Heading size="3xl">로그인</Heading>
						<Text size="lg">계속하기 위해 정보를 입력해주세요</Text>
					</VStack>
					<VStack space="sm">
						<Heading size="lg">이메일</Heading>
						<Input
							variant="outline"
							size="md"
							isDisabled={false}
							isInvalid={false}
							isReadOnly={false}
							className="rounded-2xl"
						>
							<InputField
								value={email}
								onChangeText={(text) => {
									setEmail(text);
								}}
								placeholder="abc@gmail.com"
							/>
						</Input>
					</VStack>
					<VStack space="sm">
						<Heading size="lg">비밀번호</Heading>
						<Input
							variant="outline"
							size="md"
							isDisabled={false}
							isInvalid={false}
							isReadOnly={false}
							className="rounded-2xl"
						>
							<InputField
								value={password}
								onChangeText={(text) => {
									setPassword(text);
								}}
								placeholder="비밀번호를 입력해주세요"
								type="password"
							/>
						</Input>
					</VStack>
				</VStack>
				<Button
					onPress={async () => {
						await signInWithEmail(email, password);
						router.replace('/');
					}}
				>
					<ButtonText>로그인</ButtonText>
				</Button>
			</VStack>
		</VStack>
	);
}

export default EmailSignInStepScreen;
