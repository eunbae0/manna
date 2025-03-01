import { useState } from 'react';

import { Button, ButtonText } from '#/components/ui/button';
import Header from '@/components/common/Header';
import { Text } from '#/components/ui/text';

import { useOnboardingStore } from '@/store/onboarding';
import { Heading } from '#/components/ui/heading';
import { Input, InputField } from '#/components/ui/input';
import { VStack } from '#/components/ui/vstack';
import { router } from 'expo-router';

function NameStepScreen() {
	const { setStep, updateUserData } = useOnboardingStore();
	const [group, setGroup] = useState('');

	return (
		<VStack>
			<Header label="정보 입력하기" onPressBackButton={() => setStep('NAME')} />
			<VStack space="4xl" className="px-4 mt-8">
				<VStack space="3xl">
					<VStack space="sm">
						<Heading size="2xl">소그룹 초대코드를 입력해주세요</Heading>
						<Text>초대된 그룹이 없다면 넘어갈 수 있어요.</Text>
					</VStack>
					<Input
						variant="outline"
						size="md"
						isDisabled={false}
						isInvalid={false}
						isReadOnly={false}
						className="rounded-2xl"
					>
						<InputField
							value={group}
							onChangeText={(text) => setGroup(text)}
							placeholder="초대코드"
						/>
					</Input>
				</VStack>
				<Button
					onPress={() => {
						updateUserData({ group });
						router.replace('/');
					}}
				>
					<ButtonText>계속하기</ButtonText>
				</Button>
			</VStack>
		</VStack>
	);
}

export default NameStepScreen;
