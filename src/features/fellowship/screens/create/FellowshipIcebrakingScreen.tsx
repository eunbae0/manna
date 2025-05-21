import { Box } from '#/components/ui/box';
import { Button, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '@/shared/components/text';
import { Textarea, TextareaInput } from '#/components/ui/textarea';
import { VStack } from '#/components/ui/vstack';
import type { ServerFellowshipContentField } from '@/features/fellowship/api/types';
import Header from '@/components/common/Header';
import { useFellowshipStore } from '@/store/createFellowship';
import { Plus, X } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
import { Pressable, type TextInput } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';
import { KeyboardAwareScrollView } from '@/shared/components/KeyboardAwareScrollView';
import AnimatedPressable from '@/components/common/animated-pressable';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FellowshipIcebrakingScreen() {
	const { setStep, updateFellowshipContent, content } = useFellowshipStore();
	const [iceBreaking, setIceBreaking] = useState<ServerFellowshipContentField[]>(
		content.iceBreaking.length === 0
			? [{ id: uuidv4(), question: '', answers: [] }]
			: content.iceBreaking,
	);
	const textareaRef = useRef<TextInput>(null);

	const handlePressDelete = (id: string) => {
		const updatedIceBreaking = iceBreaking.filter((item) => item.id !== id);
		setIceBreaking(updatedIceBreaking);
	};

	const handlePressAdd = () => {
		const updatedIceBreaking = [...iceBreaking];
		updatedIceBreaking.push({ id: uuidv4(), question: '', answers: [] });
		setIceBreaking(updatedIceBreaking);

		// focus keyboard
		setTimeout(() => {
			textareaRef.current?.focus();
		}, 100);
	};

	useEffect(() => {
		if (iceBreaking.length === 1) {
			setTimeout(() => {
				textareaRef.current?.focus();
			}, 100);
		}
	}, [iceBreaking.length]);

	const handlePressFinish = () => {
		updateFellowshipContent({
			iceBreaking: iceBreaking.filter(({ question }) => question !== ''),
		});
		setStep('CONTENT');
	};

	return (
		<SafeAreaView className="h-full">
			<KeyboardAvoidingView>
				<Header onPressBackButton={() => setStep('CONTENT')} />
				<KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
					<VStack className="px-5 py-6 gap-8 flex-1">
						<HStack className="items-center justify-between">
							<Heading className="text-[24px]">아이스 브레이킹</Heading>
							{/* TODO: 도움말 모달 추가하기 */}
							{/* <Pressable>
									<Icon
										as={CircleHelp}
										size="lg"
										className="color-typography-600"
									/>
								</Pressable> */}
						</HStack>
						<VStack space="sm">
							<VStack space="xl">
								{iceBreaking.map(({ id, question }, index) => (
									<HStack key={id} space="lg" className="w-full items-center">
										<Box className="w-2 h-2 bg-background-400 rounded-full" />
										<Textarea size="xl" className="rounded-xl flex-1">
											<TextareaInput
												//@ts-ignore
												ref={
													index === iceBreaking.length - 1 ? textareaRef : null
												}
												value={question}
												onChangeText={(text) => {
													const updatedIceBreaking = [...iceBreaking];
													updatedIceBreaking[index] = {
														id,
														question: text,
														answers: [],
													};
													setIceBreaking(updatedIceBreaking);
												}}
												placeholder="ex. 이번 주 동안 있었던 재밌는 일 한가지를 말해주세요"
												textAlignVertical="top"
												className="font-pretendard-Regular"
											/>
										</Textarea>
										<Pressable
											onPress={() => {
												handlePressDelete(id);
											}}
										>
											<Icon as={X} size="lg" />
										</Pressable>
									</HStack>
								))}
							</VStack>
							<AnimatedPressable onPress={handlePressAdd}>
								<HStack space="xl" className="items-center py-3 w-full">
									<Box className="border-[1px] border-primary-300 rounded-full p-2">
										<Icon as={Plus} size="lg" className="color-primary-700" />
									</Box>
									<Text
										size="lg"
										className="font-pretendard-semi-bold text-typography-600"
									>
										추가하기
									</Text>
								</HStack>
							</AnimatedPressable>
						</VStack>
					</VStack>
				</KeyboardAwareScrollView>
				<Button
					size="lg"
					className="mx-5 mb-6"
					rounded
					onPress={handlePressFinish}
				>
					<ButtonText>완료</ButtonText>
				</Button>
				{/* TODO: 추천세트 기능 추가 */}
				{/* <BottomSheetContainer>
				<VStack space="lg" className="px-5 py-6">
					<HStack className="items-center justify-between">
						<Heading size="xl">추천 세트</Heading>
					</HStack>
				</VStack>
			</BottomSheetContainer> */}
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
