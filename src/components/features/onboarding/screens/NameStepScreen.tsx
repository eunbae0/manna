import { useState } from 'react';
import { Animated, TextInput } from 'react-native';

import { Button, ButtonText } from '#/components/ui/button';
import Header from '@/components/common/Header';
import { Text } from '#/components/ui/text';

import { useOnboardingStore } from '@/store/onboarding';
import { router } from 'expo-router';

function NameStepScreen() {
	const { setStep, updateUserData } = useOnboardingStore();
	const [name, setName] = useState('');

	return (
		<Animated.View>
			<Header
				label="00로 회원가입"
				onPressBackButton={() => router.replace('/(auth)')}
			/>
			<Text>이름을 입력해주세요</Text>
			<TextInput value={name} onChangeText={(text) => setName(text)} />
			<Button
				onPress={() => {
					updateUserData({ name });
					setStep('GROUP');
				}}
			>
				<ButtonText>계속하기</ButtonText>
			</Button>
		</Animated.View>
	);
}

export default NameStepScreen;
