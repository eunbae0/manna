import { useCallback, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { ChevronRight, Plus, Check } from 'lucide-react-native';

import Header from '@/components/common/Header';
import { useToastStore } from '@/store/toast';

import { Box } from '#/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import { VStack } from '#/components/ui/vstack';
import { Avatar } from '@/components/common/avatar';
import AnimatedPressable from '@/components/common/animated-pressable';

import { FellowshipSkeleton } from '../../components/FellowshipSkeleton';
import { useInfiniteFellowships } from '../../hooks/useInfiniteFellowships';
import type { ClientFellowship, ClientFellowshipMember } from '../../api/types';
import { useFellowshipStore } from '@/store/createFellowship';

export default function FellowshipListScreen() {
	const [refreshing, setRefreshing] = useState(false);
	const [showLeader, setShowLeader] = useState(true);
	const { showError } = useToastStore();
	const { setType } = useFellowshipStore();

	const {
		data,
		isLoading,
		isError,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteFellowships(10);

	// 모든 페이지의 나눔 기록을 하나의 배열로 합치기
	const fellowships = data?.pages.flatMap((page) => page.items) || [];

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

	// 스크롤 끝에 도달했을 때 다음 페이지 로드
	const handleLoadMore = () => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	};

	const handlePressFellowship = (fellowshipId: string) => {
		router.push(`/(app)/(fellowship)/${fellowshipId}`);
	};

	const handlePressCreateFellowship = () => {
		setType('CREATE');
		router.push('/(app)/(fellowship)/create');
	};

	// 나눔장(리더) 찾기 함수
	const findLeader = (members: ClientFellowshipMember[]) => {
		return members.find((member: ClientFellowshipMember) => member.isLeader);
	};

	// 나눔 아이템 렌더링 함수
	const renderFellowshipItem = ({ item }: { item: ClientFellowship }) => {
		// 나눔장(리더) 찾기
		const leader = findLeader(item.info.members);

		return (
			<Pressable
				key={item.id}
				onPress={() => handlePressFellowship(item.id)}
				className="mb-4"
			>
				<Box className="bg-background-100 rounded-2xl px-4 py-5">
					{/* 상단 영역: 날짜와 나눔장 정보 */}
					<HStack className="justify-between items-center mb-2">
						<Text size="md" className="text-typography-400">
							{item.info.date
								.toLocaleDateString('ko-KR', {
									year: 'numeric',
									month: '2-digit',
									day: '2-digit',
								})
								.replace(/\. /g, '.')
								.replace(/\.$/, '')}
						</Text>

						{/* 나눔장(리더) 정보 표시 - 오른쪽 위에 배치 */}
						{showLeader && leader && (
							<HStack space="xs" className="items-center">
								<Text
									size="sm"
									className="text-typography-500 font-pretendard-medium"
								>
									{leader.displayName}
								</Text>
								<Avatar size="2xs" photoUrl={leader.photoUrl || ''} />
							</HStack>
						)}
					</HStack>

					{/* 하단 영역: 제목과 화살표 */}
					<HStack className="justify-between items-center">
						<Text size="xl" className="flex-1">
							{item.info.preachTitle}
						</Text>
						<Icon as={ChevronRight} className="color-typography-400" />
					</HStack>
				</Box>
			</Pressable>
		);
	};

	// 리스트 푸터 렌더링 함수
	const renderFooter = () => {
		if (!isFetchingNextPage) return null;

		return (
			<Box className="py-4 items-center justify-center">
				<ActivityIndicator size="small" color="#6366f1" />
			</Box>
		);
	};

	// 빈 리스트 렌더링 함수
	const renderEmptyList = () => {
		if (isLoading) return <FellowshipSkeleton />;

		if (isError) {
			return (
				<HStack className="justify-center py-8">
					<Text className="text-danger-500">
						나눔 기록을 불러오는 중 오류가 발생했어요
					</Text>
				</HStack>
			);
		}

		return (
			<VStack space="xl" className="items-center py-8">
				<Text className="text-typography-500">아직 소그룹의 나눔이 없어요</Text>
				<Button
					size="md"
					variant="outline"
					className="rounded-xl"
					onPress={handlePressCreateFellowship}
				>
					<ButtonText>나눔 작성하기</ButtonText>
				</Button>
			</VStack>
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-white">
			<VStack className="flex-1">
				<Header />
				<Box className="flex-1 relative">
					<FlatList
						data={fellowships}
						renderItem={renderFellowshipItem}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
						ListHeaderComponent={
							<VStack space="md" className="mb-4">
								<Heading className="text-[24px]">나눔 기록</Heading>

								{/* 나눔장 표시 체크박스 - 오른쪽에 배치 */}
								<AnimatedPressable
									onPress={() => setShowLeader(!showLeader)}
									className="self-end"
								>
									<HStack space="sm" className="items-center">
										<Text className="text-typography-600">나눔장 보기</Text>
										<Box
											className={`w-5 h-5 rounded-sm border items-center justify-center ${showLeader ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}
										>
											{showLeader && (
												<Icon as={Check} size="xs" className="stroke-white" />
											)}
										</Box>
									</HStack>
								</AnimatedPressable>
							</VStack>
						}
						ListEmptyComponent={renderEmptyList}
						ListFooterComponent={renderFooter}
						onEndReached={handleLoadMore}
						onEndReachedThreshold={0.5}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={handleRefresh}
								tintColor="#4F46E5"
								title="새로고침 중..."
								titleColor="#4B5563"
							/>
						}
						showsVerticalScrollIndicator={false}
						className="flex-1"
					/>
					<Button
						size="lg"
						variant="solid"
						className="absolute bottom-6 right-4"
						rounded
						onPress={handlePressCreateFellowship}
					>
						<ButtonText>나눔 만들기</ButtonText>
						<ButtonIcon as={Plus} />
					</Button>
				</Box>
			</VStack>
		</SafeAreaView>
	);
}
