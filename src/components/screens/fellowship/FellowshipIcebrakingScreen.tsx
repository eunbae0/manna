import { Box } from '#/components/ui/box';
import { Button, ButtonText } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import { Textarea, TextareaInput } from '#/components/ui/textarea';
import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';
import { useFellowshipStore } from '@/store/createFellowship';
import { CircleHelp, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, SafeAreaView } from 'react-native';

export default function FellowshipIcebrakingScreen() {
	const { setStep, updateFellowshipContent, content } = useFellowshipStore();
	const [iceBreaking, setIceBreaking] = useState<string[]>(
		content.iceBreaking.length === 0 ? [''] : content.iceBreaking,
	);

	return (
		<SafeAreaView className="h-full">
			<VStack className="flex-1">
				<Header onPressBackButton={() => setStep('CONTENT')} />
				<VStack className="px-5 py-6 gap-10 flex-1">
					<HStack className="items-center justify-between">
						<Heading className="text-[24px]">아이스 브레이킹</Heading>
						<Pressable>
							<Icon
								as={CircleHelp}
								size="lg"
								className="color-typography-600"
							/>
						</Pressable>
					</HStack>
					<VStack space="sm">
						<VStack space="xl">
							{iceBreaking.map((item, index) => (
								<HStack key={index} space="lg" className="w-full items-center">
									<Box className="w-2 h-2 bg-background-400 rounded-full" />
									<Textarea size="xl" className="rounded-xl flex-1">
										<TextareaInput
											value={item}
											onChangeText={(text) => {
												const updatedIceBreaking = [...iceBreaking];
												updatedIceBreaking[index] = text;
												setIceBreaking(updatedIceBreaking);
											}}
											placeholder="ex. 오늘 말씀을 삶에 어떻게 적용하면 좋을까요?"
										/>
									</Textarea>
									<Pressable
										onPress={() => {
											const updatedIceBreaking = [...iceBreaking];
											updatedIceBreaking.splice(index, 1);
											setIceBreaking(updatedIceBreaking);
										}}
									>
										<Icon as={X} size="lg" />
									</Pressable>
								</HStack>
							))}
						</VStack>
						<HStack space="xl" className="items-center py-3 w-full">
							<Pressable
								className="border-[1px] border-primary-300 rounded-full p-2"
								onPress={() => {
									const updatedIceBreaking = [...iceBreaking];
									updatedIceBreaking.push('');
									setIceBreaking(updatedIceBreaking);
								}}
							>
								<Icon as={Plus} size="lg" className="color-primary-700" />
							</Pressable>
							<Text
								size="lg"
								className="font-pretendard-semi-bold text-typography-600"
							>
								추가하기
							</Text>
						</HStack>
					</VStack>
				</VStack>
				<Button
					size="lg"
					variant="solid"
					className="mx-5 mb-6 rounded-xl"
					onPress={() => {
						updateFellowshipContent({ iceBreaking });
						setStep('CONTENT');
					}}
				>
					<ButtonText>확인</ButtonText>
				</Button>
			</VStack>
			{/* TODO: 추천세트 기능 추가 */}
			{/* <BottomSheetContainer>
				<VStack space="lg" className="px-5 py-6">
					<HStack className="items-center justify-between">
						<Heading size="xl">추천 세트</Heading>
					</HStack>
				</VStack>
			</BottomSheetContainer> */}
		</SafeAreaView>
	);
}
