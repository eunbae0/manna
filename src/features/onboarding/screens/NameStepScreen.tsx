import { useEffect, useRef, useState } from 'react';
import type { TextInput } from 'react-native';

import { Button, ButtonText } from '@/components/common/button';

import { useOnboardingStore } from '@/store/onboarding';
import { Heading } from '@/shared/components/heading';
import { Input, InputField } from '#/components/ui/input';
import { VStack } from '#/components/ui/vstack';

export default function NameStepScreen() {
	const { setStep, updateUserData, userData } = useOnboardingStore();
	const [name, setName] = useState(userData.displayName || '');

	const ref = useRef<TextInput>();

	useEffect(() => {
		setTimeout(() => {
			ref.current?.focus();
		}, 100);
	}, []);

	const handlePressNext = () => {
		updateUserData({ displayName: name.trim() });
		setStep('GROUP_LANDING');
	};

	return (
		<VStack className="flex-1 h-full">
			<VStack className="flex-1 px-5 mt-8 gap-12">
				<VStack space="3xl">
					<Heading size="2xl">이름을 입력해주세요</Heading>
					<Input
						variant="outline"
						size="lg"
						isDisabled={false}
						isInvalid={false}
						isReadOnly={false}
						className="rounded-2xl"
					>
						<InputField
							// @ts-ignore
							ref={ref}
							value={name}
							onChangeText={(text) => setName(text)}
							placeholder="이름"
						/>
					</Input>
				</VStack>
			</VStack>
			<Button
				size="lg"
				className="mx-5 mb-6 rounded-full"
				onPress={handlePressNext}
				disabled={name.trim().length === 0}
				rounded
			>
				<ButtonText>다음</ButtonText>
			</Button>
		</VStack>
	);
}
