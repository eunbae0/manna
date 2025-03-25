import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import { Button, ButtonIcon, ButtonText } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import { Icon } from '#/components/ui/icon';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import { ChevronRight, Plus } from 'lucide-react-native';
import { Box } from '#/components/ui/box';
import { Spinner } from '@/components/common/spinner';
import { Pressable, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { useToastStore } from '@/store/toast';
import { useFocusEffect } from 'expo-router';
import { useFellowships } from '../hooks/useFellowships';

export default function FellowshipListScreen() {
	const [refreshing, setRefreshing] = useState(false);
	const { showError } = useToastStore();

	const {
		data: fellowships = [],
		isLoading,
		isError,
		refetch,
	} = useFellowships();

	useFocusEffect(
		useCallback(() => {
			refetch();
		}, [refetch]),
	);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await refetch();
		} catch (error) {
			console.error('Error refreshing fellowships:', error);
			showError('나눔 기록을 새로고침하는 중 오류가 발생했습니다.');
		} finally {
			setRefreshing(false);
		}
	}, [refetch, showError]);

	const handlePressFellowship = (fellowshipId: string) => {
		router.push(`/(app)/(fellowship)/${fellowshipId}`);
	};

	const handlePressCreateFellowship = () => {
		router.push('/(app)/(fellowship)/create');
	};

	return (
		<SafeAreaView className="h-full">
			<VStack space="xl" className="h-full">
				<Header />
				<VStack className="relative">
					<ScrollView
						showsVerticalScrollIndicator={false}
						className=""
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={handleRefresh}
								tintColor="#4F46E5"
								title="새로고침 중..."
								titleColor="#4B5563"
							/>
						}
					>
						<VStack className="px-5 gap-8">
							<Heading className="text-[24px]">나눔 기록</Heading>
							<VStack space="md">
								{isLoading || isError ? (
									<HStack className="justify-center py-8">
										<Spinner />
									</HStack>
								) : fellowships.length === 0 ? (
									<VStack space="xl" className="items-center py-8">
										<Text className="text-typography-500">
											아직 소그룹의 나눔이 없어요
										</Text>
										<Button
											size="md"
											variant="outline"
											className="rounded-xl"
											onPress={handlePressCreateFellowship}
										>
											<ButtonText>나눔 작성하기</ButtonText>
										</Button>
									</VStack>
								) : (
									<VStack space="md">
										{fellowships.map((fellowship) => (
											<Pressable
												key={fellowship.id}
												onPress={() => handlePressFellowship(fellowship.id)}
											>
												<HStack className="bg-background-100 rounded-2xl justify-between items-center px-4 py-5">
													<VStack>
														<HStack space="sm" className="items-center">
															<Text size="md" className="text-typography-400">
																{fellowship.info.date
																	.toLocaleDateString('ko-KR', {
																		year: 'numeric',
																		month: '2-digit',
																		day: '2-digit',
																	})
																	.replace(/\. /g, '.')
																	.replace(/\.$/, '')}{' '}
															</Text>
														</HStack>
														<Text size="xl" className="">
															{fellowship.info.preachTitle}
														</Text>
													</VStack>
													<Icon
														as={ChevronRight}
														className="color-typography-400"
													/>
												</HStack>
											</Pressable>
										))}
									</VStack>
								)}
							</VStack>
						</VStack>
						<Box className="h-32" />
					</ScrollView>
				</VStack>
				<Button
					size="lg"
					variant="solid"
					className="absolute bottom-6 right-4 rounded-full"
					onPress={handlePressCreateFellowship}
				>
					<ButtonText>나눔 만들기</ButtonText>
					<ButtonIcon as={Plus} />
				</Button>
			</VStack>
		</SafeAreaView>
	);
}
