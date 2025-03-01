import { useState } from 'react';

import { Button, ButtonText } from '#/components/ui/button';
import Header from '@/components/common/Header';

import { useOnboardingStore } from '@/store/onboarding';
import { router } from 'expo-router';
import { Heading } from '#/components/ui/heading';
import { Input, InputField } from '#/components/ui/input';
import { VStack } from '#/components/ui/vstack';

function NameStepScreen() {
	const { setStep, updateUserData } = useOnboardingStore();
	const [name, setName] = useState('');

	return (
		<VStack>
			<Header
				label="정보 입력하기"
				onPressBackButton={() => router.replace('/(auth)')}
			/>
			<VStack space="4xl" className="px-4 mt-8">
				<VStack space="xl">
					<Heading size="2xl">이름을 입력해주세요</Heading>
					<Input
						variant="outline"
						size="md"
						isDisabled={false}
						isInvalid={false}
						isReadOnly={false}
						className="rounded-2xl"
					>
						<InputField
							value={name}
							onChangeText={(text) => setName(text)}
							placeholder="이름"
						/>
					</Input>
				</VStack>
				<Button
					onPress={() => {
						updateUserData({ name });
						setStep('GROUP');
					}}
				>
					<ButtonText>계속하기</ButtonText>
				</Button>
			</VStack>
		</VStack>
	);
}

export default NameStepScreen;
