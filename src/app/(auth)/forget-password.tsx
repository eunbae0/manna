import { router } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { Text } from '@/shared/components/text';
import { Button, ButtonText } from '@/components/common/button';
import Header from '@/components/common/Header';
import { Heading } from '@/shared/components/heading';
import { VStack } from '#/components/ui/vstack';
import { Input, InputField } from '#/components/ui/input';
import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import { Pressable, type TextInput } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { sendPasswordResetEmail } from '@/api';
import { useToastStore } from '@/store/toast';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgetPasswordScreen() {
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isEmailSent, setIsEmailSent] = useState(false);
	const inputRef = useRef<TextInput>(null);
	const { showToast } = useToastStore();

	// auto focus on input when screen is mounted
	useEffect(() => {
		setTimeout(() => {
			inputRef.current?.focus();
		}, 200);
	}, []);

	const handleSendResetEmail = async () => {
		if (email.length === 0) return;

		setIsLoading(true);
		try {
			// 비밀번호 재설정 이메일 전송
			await sendPasswordResetEmail(email);
			setIsEmailSent(true);
			showToast({
				type: 'success',
				message: '비밀번호 재설정 이메일을 전송했어요',
			});
		} catch (error) {
			console.error('비밀번호 재설정 이메일 전송 실패:', error);
			showToast({
				type: 'error',
				message: '이메일 전송에 실패했어요. 다시 시도해주세요.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView>
			<SafeAreaView>
				<VStack className="h-full">
					<Header
						label="비밀번호 찾기"
						onPressBackButton={() =>
							router.canGoBack() ? router.back() : router.push('/(auth)')
						}
					/>
					<VStack className="flex-1 px-4 mt-8 justify-between" space="4xl">
						<VStack space="4xl">
							<VStack space="sm">
								{!isEmailSent && (
									<Heading size="2xl">비밀번호를 잊으셨나요?</Heading>
								)}
								{isEmailSent && (
									<Heading size="2xl">
										비밀번호 재설정 이메일을 전송했어요
									</Heading>
								)}
								<Text size="lg" weight="medium" className="text-typography-600">
									{isEmailSent
										? '입력하신 이메일의 메일함을 확인해주세요'
										: '가입한 이메일을 입력하면 재설정 링크를 보내드려요'}
								</Text>
							</VStack>
							{!isEmailSent && (
								<VStack space="lg" reversed={false}>
									<VStack space="sm">
										<Input
											variant="rounded"
											size="xl"
											isDisabled={isLoading}
											className="rounded-2xl"
										>
											<InputField
												//@ts-ignore
												ref={inputRef}
												value={email}
												onChangeText={setEmail}
												placeholder="example@gmail.com"
												autoCapitalize="none"
												keyboardType="email-address"
											/>
										</Input>
									</VStack>
								</VStack>
							)}
						</VStack>
						<VStack space="lg">
							{isEmailSent ? (
								<Button
									onPress={() => router.push('/(auth)')}
									size="xl"
									className="rounded-full mb-2"
								>
									<ButtonText>로그인 화면으로 돌아가기</ButtonText>
								</Button>
							) : (
								<Button
									onPress={handleSendResetEmail}
									disabled={email.length === 0 || isLoading}
									size="lg"
									className="rounded-full mb-2"
								>
									<ButtonText>
										{isLoading ? '전송 중...' : '비밀번호 재설정 이메일 보내기'}
									</ButtonText>
								</Button>
							)}
						</VStack>
					</VStack>
				</VStack>
			</SafeAreaView>
		</KeyboardAvoidingView>
	);
}
