import { useEffect, useRef, useState } from 'react';
import type { TextInput } from 'react-native';

import { Button, ButtonText } from '@/components/common/button';

import { useOnboardingStore } from '@/store/onboarding';
import { Heading } from '@/shared/components/heading';
import { Input, InputField } from '#/components/ui/input';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';

export default function NameStepScreen() {
	const { setStep, updateUserData, userData } = useOnboardingStore();
	const [name, setName] = useState(userData.displayName || '');

	const ref = useRef<TextInput>(null);

	useEffect(() => {
		setTimeout(() => {
			ref.current?.focus();
		}, 100);
	}, []);

	const handlePressNext = () => {
		updateUserData({ displayName: name.trim() });
		setStep('IMAGE');
	};

	return (
		<VStack className="flex-1 h-full">
			<VStack className="flex-1 px-4 mt-16 gap-12">
				<VStack className="gap-10">
					<VStack space="sm">
						<Heading size="2xl">소그룹에 가입하신 것을 환영해요 🙌</Heading>
						<Text size="lg" weight="medium" className="text-typography-600">
							회원가입을 완료하기 위해 정보를 입력해주세요
						</Text>
					</VStack>
					<VStack space="sm">
						<Text className="text-typography-700">이름을 입력해주세요</Text>
						<Input
							variant="outline"
							size="lg"
							isDisabled={false}
							isInvalid={false}
							isReadOnly={false}
							className="rounded-xl"
						>
							<InputField
								// @ts-ignore
								ref={ref}
								value={name}
								onChangeText={(text) => setName(text)}
								placeholder="그룹원들에게 보여질 이름이에요"
								className="font-pretendard-Regular text-md"
							/>
						</Input>
					</VStack>
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
