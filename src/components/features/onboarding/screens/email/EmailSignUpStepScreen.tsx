import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '#/components/ui/text';
import { Button, ButtonText } from '#/components/ui/button';
import Header from '@/components/common/Header';
import { useOnboardingStore } from '@/store/onboarding';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import { Input, InputField } from '#/components/ui/input';

function EmailSignUpStepScreen() {
	const { signUp } = useAuthStore();
	const { setStep } = useOnboardingStore();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirm, setPasswordConfirm] = useState('');
	return (
		<VStack>
			<Header
				label="이메일로 회원가입"
				onPressBackButton={() =>
					router.canGoBack() ? router.back() : router.push('/(auth)')
				}
			/>
			<VStack className="px-4 mt-8 justify-between" space="4xl">
				<VStack space="lg">
					<VStack space="sm">
						<Heading size="3xl">회원가입</Heading>
						<Text size="lg">계속하기 위해 정보를 입력해주세요</Text>
					</VStack>
					<VStack space="lg" reversed={false}>
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
						<VStack space="sm">
							<Heading size="lg">비밀번호 확인</Heading>
							<Input
								variant="outline"
								size="md"
								isDisabled={false}
								isInvalid={false}
								isReadOnly={false}
								className="rounded-2xl"
							>
								<InputField
									value={passwordConfirm}
									onChangeText={(text) => {
										setPasswordConfirm(text);
									}}
									placeholder="비밀번호를 다시 입력해주세요"
									type="password"
								/>
							</Input>
						</VStack>
					</VStack>
				</VStack>
				<Button
					onPress={async () => {
						if (
							email.length === 0 ||
							password.length === 0 ||
							passwordConfirm.length === 0
						)
							return;
						await signUp('EMAIL', {
							email,
							password,
						});
						setStep('NAME');
					}}
				>
					<ButtonText>가입하기</ButtonText>
				</Button>
			</VStack>
		</VStack>
	);
}
export default EmailSignUpStepScreen;
