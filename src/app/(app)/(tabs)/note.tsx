import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heading } from '#/components/ui/heading';
import { ScrollView } from 'react-native-gesture-handler';
import { Card } from '#/components/ui/card';
import { HStack } from '#/components/ui/hstack';
import { Button, ButtonIcon } from '#/components/ui/button';
import { PlusIcon } from 'lucide-react-native';
import { router } from 'expo-router';

export default function NoteScreen() {
	return (
		<SafeAreaView>
			<VStack space="4xl" className="px-4 h-full">
				<Heading size="2xl" className="pt-5">
					설교 노트
				</Heading>
				<ScrollView className="flex-1 h-full">
					<VStack space="md" className="">
						<Heading size="xl" className="font-pretendard-semi-bold">
							2025.02
						</Heading>
						<Card className="bg-white rounded-2xl">
							<VStack space="xs">
								<Text size="xl" className="font-pretendard-semi-bold">
									회개하라 종말의 때가 왔도다
								</Text>
								<HStack space="md" className="items-center">
									<Text
										size="md"
										className="font-pretendard-regular text-typography-500"
									>
										2024.12.24
									</Text>
									<Text
										size="md"
										numberOfLines={1}
										className="font-pretendard-regular text-typography-500 flex-auto"
									>
										목사님께서는 종말의 때를 이야기하셨다. 이때 종말이란
									</Text>
								</HStack>
							</VStack>
						</Card>
					</VStack>
				</ScrollView>
			</VStack>
			<Button
				size="xl"
				variant="solid"
				className="absolute bottom-5 right-4 rounded-full"
				onPress={() => router.push('/(app)/(note)/create')}
			>
				<ButtonIcon as={PlusIcon} />
			</Button>
		</SafeAreaView>
	);
}
