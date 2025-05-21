import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from '@/shared/components/text';
import { Button, ButtonText } from '@/components/common/button';
import Header from '@/components/common/Header';
import { Heading } from '@/shared/components/heading';
import { VStack } from '#/components/ui/vstack';
import { Input, InputField } from '#/components/ui/input';
import { Icon } from '#/components/ui/icon';
import { Eye, EyeOff } from 'lucide-react-native';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import { Pressable } from 'react-native';
import { HStack } from '#/components/ui/hstack';

function EmailSignInStepScreen() {
	const { signIn } = useAuthStore();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	return (
		<KeyboardDismissView>
			<VStack className="h-full">
				<Header
					label="이메일로 로그인하기"
					onPressBackButton={() =>
						router.canGoBack() ? router.back() : router.push('/(auth)')
					}
				/>
				<VStack className="flex-1 px-4 mt-8 justify-between" space="4xl">
					<VStack space="4xl">
						<VStack space="sm">
							<Heading size="xl">계속하기 위해 로그인해주세요</Heading>
							<Text size="lg">이메일과 비밀번호를 입력해주세요</Text>
						</VStack>
						<VStack space="lg" reversed={false}>
							<VStack space="sm">
								<Input
									variant="rounded"
									size="xl"
									isDisabled={isLoading}
									isInvalid={false}
									isReadOnly={false}
									className="rounded-2xl"
								>
									<InputField
										value={email}
										onChangeText={(text) => {
											setEmail(text);
										}}
										placeholder="example@gmail.com"
										autoCapitalize="none"
										keyboardType="email-address"
									/>
								</Input>
							</VStack>
							<VStack space="sm">
								<Input
									variant="rounded"
									size="xl"
									isDisabled={isLoading}
									isInvalid={false}
									isReadOnly={false}
									className="rounded-2xl"
								>
									<InputField
										value={password}
										onChangeText={(text) => {
											setPassword(text);
										}}
										placeholder="비밀번호"
										secureTextEntry={!showPassword}
										autoCapitalize="none"
									/>
									<Pressable
										onPress={() => setShowPassword(!showPassword)}
										style={{ padding: 10 }}
									>
										<Icon as={showPassword ? EyeOff : Eye} size="lg" />
									</Pressable>
								</Input>
							</VStack>
						</VStack>
					</VStack>
					<VStack space="lg">
						<HStack space="sm" className="w-full justify-center items-center">
							<Text>비밀번호를 잊으셨나요?</Text>
							<Pressable onPress={() => router.push('/(auth)/forget-password')}>
								<Text>비밀번호 찾기</Text>
							</Pressable>
						</HStack>
						<Button
							onPress={async () => {
								if (email.length === 0 || password.length === 0) return;
								setIsLoading(true);
								try {
									// 이메일/비밀번호로 로그인
									await signIn('EMAIL', { email, password: password });
									router.push('/(app)');
								} catch (error) {
									console.error('로그인 실패:', error);
								} finally {
									setIsLoading(false);
								}
							}}
							disabled={
								email.length === 0 || password.length === 0 || isLoading
							}
							size="xl"
							className="mb-5"
							rounded
						>
							<ButtonText>{isLoading ? '로그인 중...' : '로그인'}</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</VStack>
		</KeyboardDismissView>
	);
}
export default EmailSignInStepScreen;
