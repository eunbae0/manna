import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Pressable, SafeAreaView } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { X } from 'lucide-react-native';
import { router } from 'expo-router';
import { Button, ButtonText } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
import { Textarea, TextareaInput } from '#/components/ui/textarea';

export default function selectedWorshipTypeModal() {
	const isPresented = router.canGoBack();

	// const { mutate: createWorshipType } = useMutation({
	// 	mutationFn: async (name: string) => {
	// 		addWorshipType({ name });
	// 	},
	// });

	return (
		<SafeAreaView>
			<VStack className="w-full h-full">
				<VStack className="w-full flex-1 px-6 py-6 gap-8">
					<HStack className="relative items-center justify-end font-pretendard-semi-bold">
						<Text
							size="xl"
							className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
						>
							{/* 기도 제목 작성하기 */}
						</Text>
						{isPresented && (
							<Pressable onPress={() => router.back()}>
								<Icon as={X} size="lg" />
							</Pressable>
						)}
					</HStack>
					<VStack space="4xl">
						<Heading className="text-[24px]">기도 제목을 작성해주세요</Heading>
						<Textarea
							size="xl"
							isReadOnly={false}
							isInvalid={false}
							isDisabled={false}
							className="w-full"
						>
							<TextareaInput placeholder="기도 제목..." />
						</Textarea>
					</VStack>
				</VStack>
				<Button
					size="lg"
					className="mx-6 mb-6 rounded-full"
					onPress={() => {
						router.back();
					}}
				>
					<ButtonText>저장하기</ButtonText>
				</Button>
			</VStack>
		</SafeAreaView>
	);
}
