import { Box } from '#/components/ui/box';
import { Button, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import { Textarea, TextareaInput } from '#/components/ui/textarea';
import { VStack } from '#/components/ui/vstack';
import type { ServerFellowshipContentField } from '@/features/fellowship/api/types';
import Header from '@/components/common/Header';
import { useFellowshipStore } from '@/store/createFellowship';
import { Plus, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, type TextInput } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';
import { KeyboardAwareScrollView } from '@/shared/components/KeyboardAwareScrollView';
import AnimatedPressable from '@/components/common/animated-pressable';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FellowshipSermonTopicScreen() {
	const { setStep, updateFellowshipContent, content } = useFellowshipStore();
	const [sermonTopic, setSermonTopic] = useState<ServerFellowshipContentField[]>(
		content.sermonTopic.length === 0
			? [{ id: uuidv4(), question: '', answers: [] }]
			: content.sermonTopic,
	);
	const textareaRef = useRef<TextInput>(null);

	const handlePressDelete = (id: string) => {
		const updatedSermonTopic = sermonTopic.filter((item) => item.id !== id);
		setSermonTopic(updatedSermonTopic);
	};

	const handlePressAdd = () => {
		const updatedSermonTopic = [...sermonTopic];
		updatedSermonTopic.push({ id: uuidv4(), question: '', answers: [] });
		setSermonTopic(updatedSermonTopic);
		// focus keyboard
		setTimeout(() => {
			textareaRef.current?.focus();
		}, 100);
	};

	const handlePressFinish = () => {
		updateFellowshipContent({
			sermonTopic: sermonTopic.filter(({ question }) => question !== ''),
		});
		setStep('CONTENT');
	};

	useEffect(() => {
		if (sermonTopic.length === 1) {
			setTimeout(() => {
				textareaRef.current?.focus();
			}, 100);
		}
	}, [sermonTopic.length]);

	return (
		<SafeAreaView className="h-full">
			<KeyboardAvoidingView>
				<Header onPressBackButton={() => setStep('CONTENT')} />
				<KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
					<VStack className="px-5 py-6 gap-8 flex-1">
						<HStack className="items-center justify-between">
							<Heading className="text-[24px]">설교 나눔</Heading>
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
								{sermonTopic.map(({ id, question }, index) => (
									<HStack key={id} space="lg" className="w-full items-center">
										<Box className="w-2 h-2 bg-background-400 rounded-full" />
										<Textarea size="xl" className="rounded-xl flex-1">
											<TextareaInput
												//@ts-ignore
												ref={
													index === sermonTopic.length - 1 ? textareaRef : null
												}
												value={question}
												onChangeText={(text) => {
													const updatedSermonTopic = [...sermonTopic];
													updatedSermonTopic[index] = {
														id,
														question: text,
														answers: [],
													};
													setSermonTopic(updatedSermonTopic);
												}}
												placeholder="ex. 오늘 말씀을 삶에 어떻게 적용하면 좋을까요?"
												textAlignVertical="top"
												className="font-pretendard-Regular"
											/>
										</Textarea>
										<Pressable onPress={() => handlePressDelete(id)}>
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
					<ButtonText>확인</ButtonText>
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
