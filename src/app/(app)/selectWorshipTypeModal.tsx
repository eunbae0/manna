import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Pressable, SafeAreaView, TextInput } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Plus, Trash, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useWorshipStore } from '@/store/worship';
import { useMutation } from '@tanstack/react-query';
import { Box } from '#/components/ui/box';
import { Divider } from '#/components/ui/divider';
import { Button, ButtonText } from '#/components/ui/button';

export default function selectedWorshipTypeModal() {
	const isPresented = router.canGoBack();

	const { worshipTypes, addWorshipType, removeWorshipType } = useWorshipStore();

	// const { mutate: createWorshipType } = useMutation({
	// 	mutationFn: async (name: string) => {
	// 		addWorshipType({ name });
	// 	},
	// });

	return (
		<SafeAreaView>
			<VStack className="w-full h-full">
				<VStack className="w-full flex-1 px-6 py-6 gap-12">
					<HStack className="relative items-center justify-end font-pretendard-semi-bold">
						<Text
							size="xl"
							className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
						>
							예배 종류
						</Text>
						{isPresented && (
							<Pressable onPress={() => router.back()}>
								<Icon as={X} size="lg" />
							</Pressable>
						)}
					</HStack>
					<VStack space="3xl">
						{worshipTypes.map((worshipType) => (
							<VStack space="lg" key={worshipType.id}>
								<HStack className="w-full items-center justify-between">
									<HStack space="lg" className="items-center">
										<Box className="rounded-full w-2 h-2 bg-background-400" />
										<Text className="text-[18px]">{worshipType.name}</Text>
									</HStack>
									<Pressable onPress={() => removeWorshipType(worshipType)}>
										<Icon as={Trash} size="lg" />
									</Pressable>
								</HStack>
								<Divider />
							</VStack>
						))}
						<HStack className="w-full items-center justify-between">
							<HStack space="lg" className="w-1/2 items-center">
								<Box className="rounded-full w-2 h-2 bg-background-400" />
								<TextInput
									placeholder="예배 종류 추가하기"
									className="w-full text-[18px] border-b-[1px] border-background-300 pb-2"
									value={''}
									onChangeText={() => {}}
								/>
							</HStack>
							<Pressable onPress={() => {}}>
								<Icon as={Plus} size="lg" />
							</Pressable>
						</HStack>
					</VStack>
				</VStack>
				<Button size="lg" className="mx-6 mb-6 rounded-full" onPress={() => {}}>
					<ButtonText>저장하기</ButtonText>
				</Button>
			</VStack>
		</SafeAreaView>
	);
}
