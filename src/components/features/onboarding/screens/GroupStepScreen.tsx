import Header from '@/components/common/Header';
import { Text } from '#/components/ui/text';
import { useOnboardingStore } from '@/store/onboarding';
import { useState } from 'react';
import { Animated, TextInput } from 'react-native';
import { Button, ButtonText } from '#/components/ui/button';

function GroupStepScreen() {
	const { setStep, updateUserData } = useOnboardingStore();
	const [name, setName] = useState('');

	return (
		<Animated.View>
			<Header
				label="이메일로 회원가입"
				onPressBackButton={() => setStep('NAME')}
			/>
			<Text>소그룹 초대코드를 입력해주세요</Text>
			<Text>초대된 그룹이 없다면 넘어갈 수 있어요.</Text>
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

export default GroupStepScreen;
