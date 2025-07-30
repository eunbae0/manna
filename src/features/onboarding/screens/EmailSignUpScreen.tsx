import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text } from '@/shared/components/text';
import { Button, ButtonText } from '@/components/common/button';
import Header from '@/components/common/Header';
import { useOnboardingStore } from '@/store/onboarding';
import { Heading } from '@/shared/components/heading';
import { VStack } from '#/components/ui/vstack';
import { Input, InputField } from '#/components/ui/input';
import { Icon } from '#/components/ui/icon';
import { Eye, EyeOff } from 'lucide-react-native';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import { Pressable, type TextInput } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import type { EmailSignInInput } from '@/api/auth/types';

export default function EmailSignUpScreen() {
	const { signUp } = useAuthStore();
	const { setStep } = useOnboardingStore();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordError, setPasswordError] = useState('');
	const [passwordFormatError, setPasswordFormatError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const inputRef = useRef<TextInput>(null);

	// auto focus on input when screen is mounted
	useEffect(() => {
		setTimeout(() => {
			inputRef.current?.focus();
		}, 200);
	}, []);

	// 비밀번호 형식 검증 (6자 이상, 특수문자 포함)
	const validatePasswordFormat = (inputPassword: string) => {
		const minLength = 6;
		const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(inputPassword);

		if (inputPassword.length < minLength) {
			setPasswordFormatError('비밀번호는 6자 이상이어야 해요.');
			return false;
		}

		if (!hasSpecialChar) {
			setPasswordFormatError('비밀번호에 특수문자가 포함되어야 해요.');
			return false;
		}

		setPasswordFormatError('');
		return true;
	};

	const validatePasswords = (inputPassword: string) => {
		if (!confirmPassword) {
			setPasswordError('');
			return;
		}
		if (password !== inputPassword && confirmPassword !== inputPassword) {
			setPasswordError('비밀번호가 일치하지 않아요.');
			return false;
		}
		setPasswordError('');
		return true;
	};

	const handleSignUp = async () => {
		if (
			email.length === 0 ||
			password.length === 0 ||
			confirmPassword.length === 0
		)
			return;

		// 비밀번호 형식 확인
		if (!validatePasswordFormat(password)) return;

		// 비밀번호 일치 확인
		if (!validatePasswords(confirmPassword)) return;

		setIsLoading(true);
		try {
			// 이메일/비밀번호로 회원가입
			const signUpData: EmailSignInInput = { email, password };
			await signUp(signUpData);
			setStep('NAME');
		} catch (error) {
			console.error('회원가입 실패:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<KeyboardDismissView>
			<VStack className="h-full">
				<Header
					label="이메일로 회원가입"
					onPressBackButton={() =>
						router.canGoBack() ? router.back() : router.push('/(auth)')
					}
				/>
				<VStack className="flex-1 px-4 mt-8 justify-between" space="4xl">
					<VStack space="4xl">
						<VStack space="sm">
							<Heading size="2xl">이메일과 비밀번호를 입력해주세요</Heading>
							<Text size="lg" weight="medium" className="text-typography-600">
								비밀번호는 특수문자가 포함된 6자 이상이어야 해요
							</Text>
						</VStack>
						<VStack space="lg" reversed={false}>
							<VStack>
								<Input variant="rounded" size="xl" className="rounded-2xl">
									<InputField
										placeholder="이메일"
										keyboardType="email-address"
										autoCapitalize="none"
										value={email}
										onChangeText={setEmail}
										autoFocus
									/>
								</Input>
							</VStack>
							<VStack>
								<Input variant="rounded" size="xl" className="rounded-2xl">
									<InputField
										placeholder="비밀번호"
										secureTextEntry={!showPassword}
										value={password}
										onChangeText={(text) => {
											setPassword(text);
											if (text.length > 0) {
												validatePasswordFormat(text);
												validatePasswords(text);
											}
										}}
										autoCapitalize="none"
									/>
									<Pressable
										onPress={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-3"
									>
										<Icon as={showPassword ? Eye : EyeOff} size="md" />
									</Pressable>
								</Input>
								{passwordFormatError ? (
									<Text className="text-red-500">{passwordFormatError}</Text>
								) : null}
							</VStack>
							<VStack>
								<Input variant="rounded" size="xl" className="rounded-2xl">
									<InputField
										placeholder="비밀번호 확인"
										secureTextEntry={!showConfirmPassword}
										value={confirmPassword}
										onChangeText={(text) => {
											setConfirmPassword(text);
											if (text.length > 0) {
												validatePasswords(text);
											}
										}}
										autoCapitalize="none"
									/>
									<Pressable
										onPress={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-3 top-3"
									>
										<Icon as={showConfirmPassword ? Eye : EyeOff} size="md" />
									</Pressable>
								</Input>
								{passwordError ? (
									<Text className="text-red-500">{passwordError}</Text>
								) : null}
							</VStack>
						</VStack>
					</VStack>
					<VStack space="lg">
						<HStack space="sm" className="w-full justify-center items-center">
							<Text>이미 계정이 있으신가요?</Text>
							<Pressable
								onPress={() => {
									setStep('EMAIL_SIGN_IN');
								}}
							>
								<Text>로그인하기</Text>
							</Pressable>
						</HStack>
						<Button
							onPress={handleSignUp}
							disabled={
								email.length === 0 ||
								password.length === 0 ||
								confirmPassword.length === 0 ||
								isLoading ||
								Boolean(passwordError) ||
								Boolean(passwordFormatError)
							}
							size="lg"
							className="mb-2"
						>
							<ButtonText>{isLoading ? '가입 중...' : '가입하기'}</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</VStack>
		</KeyboardDismissView>
	);
}
