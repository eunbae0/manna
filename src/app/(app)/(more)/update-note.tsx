import { Image } from 'expo-image';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { Heading } from '@/shared/components/heading';
import { Button } from '@/components/common/button';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { ActivityIndicator, Pressable } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { fetchAllUpdateNotes } from '@/api/app_config';
import { Divider } from '#/components/ui/divider';
import Header from '@/components/common/Header';
import { getImageSourceForSignedImageUrl } from '@/shared/utils/image';

export default function UpdateNoteScreen() {
	const {
		data: updateNotes,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['updateNotes'],
		queryFn: fetchAllUpdateNotes,
	});

	return (
		<SafeAreaView className="flex-1">
			<Header label="업데이트 노트" />
			<VStack className="flex-1 bg-background p-4">
				{isLoading ? (
					<VStack className="flex-1 justify-center items-center">
						<ActivityIndicator size="large" />
						<Text className="mt-4 text-typography-500">
							업데이트 정보를 가져오고 있어요
						</Text>
					</VStack>
				) : error ? (
					<VStack className="flex-1 justify-center items-center p-4">
						<Text className="text-error-500 mb-2">
							업데이트 정보를 가져오는데 실패했어요
						</Text>
						<Button variant="outline" onPress={() => router.back()}>
							<Text>뒤로 가기</Text>
						</Button>
					</VStack>
				) : (
					<ScrollView showsVerticalScrollIndicator={false} className="flex-1">
						<VStack space="xl" className="py-2">
							{!updateNotes || updateNotes.length === 0 ? (
								<Text className="text-center py-4 text-typography-500">
									업데이트 내역이 없어요.
								</Text>
							) : (
								updateNotes.map((update, index) => (
									<VStack key={update.version} space="xl" className="mb-2">
										<Heading size="2xl">버전 {update.version}</Heading>

										<VStack className="pl-1">
											{update.notes.map((note) => (
												<VStack
													key={`${update.version}-${note.title}`}
													space="md"
													className="mb-4"
												>
													<VStack space="md">
														<HStack space="sm" className="items-center">
															<Icon
																as={CheckCircle}
																size="sm"
																className="text-primary-400"
															/>
															<Text
																size="xl"
																className="font-pretendard-semi-bold"
															>
																{note.title}
															</Text>
														</HStack>
														<Text size="lg" className="text-typography-600">
															{note.description}
														</Text>
													</VStack>

													{note.imageUrls && note.imageUrls.length > 0 && (
														<ScrollView horizontal>
															<HStack space="sm">
																{note.imageUrls.map((imageUrl) => (
																	<Pressable key={imageUrl}>
																		<Image
																			source={getImageSourceForSignedImageUrl(
																				imageUrl,
																			)}
																			alt={note.title}
																			style={{
																				width: 168,
																				height: 320,
																				borderRadius: 8,
																				borderWidth: 1,
																				borderColor: 'lightgray',
																			}}
																			contentFit="cover"
																		/>
																	</Pressable>
																))}
															</HStack>
														</ScrollView>
													)}
												</VStack>
											))}
										</VStack>
										{index < updateNotes.length - 1 && (
											<Divider className="my-2" />
										)}
									</VStack>
								))
							)}
						</VStack>
					</ScrollView>
				)}
			</VStack>
		</SafeAreaView>
	);
}
