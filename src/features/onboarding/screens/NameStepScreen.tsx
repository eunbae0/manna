import { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';

import { Button, ButtonText } from '@/components/common/button';

import { useOnboardingStore } from '@/store/onboarding';
import { Heading } from '@/shared/components/heading';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';

const MAX_NICKNAME_LENGTH = 10

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

	const handleChangeNameText = (text: string) => {
		setName(text)
	}

	return (
		<VStack className="flex-1 h-full">
			<VStack className="flex-1 px-4 mt-16 gap-12">
				<VStack className="gap-12">
					<VStack space="sm">
						<Heading size="3xl">만나에 오신 것을 환영해요 🙌</Heading>
						<Text size="lg" weight="medium" className="text-typography-600">
							회원가입을 완료하기 위해 정보를 입력해주세요
						</Text>
					</VStack>
					<VStack space="sm">
						<Text weight='medium' className="text-primary-600">이름</Text>
						<TextInput
							value={name}
							onChangeText={handleChangeNameText}
							placeholder="그룹원들에게 보여질 이름이에요"
							maxLength={MAX_NICKNAME_LENGTH}
							className="rounded-xl px-4 py-5 text-xl bg-background-100 focus:bg-background-200/70 font-pretendard-Regular"
						/>
					</VStack>
				</VStack>
			</VStack>
			<Button
				size="lg"
				className="mx-5 mb-4 rounded-full"
				onPress={handlePressNext}
				disabled={name.trim().length === 0}
			>
				<ButtonText>다음</ButtonText>
			</Button>
		</VStack>
	);
}
