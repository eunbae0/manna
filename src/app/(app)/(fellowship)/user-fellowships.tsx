import { SafeAreaView } from 'react-native-safe-area-context';
import {
	FlatList,
	ActivityIndicator,
	RefreshControl,
	Pressable,
} from 'react-native';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Box } from '#/components/ui/box';
import { Text } from '@/shared/components/text';
import { Icon } from '#/components/ui/icon';
import { Heading } from '@/shared/components/heading';
import Header from '@/components/common/Header';
import { EmptyState } from '@/components/common/empty-state';
import { Divider } from '#/components/ui/divider';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useState, useEffect } from 'react';
import { useToastStore } from '@/store/toast';
import { useUserProfile } from '@/features/profile/hooks/hooks';
import { Avatar } from '@/components/common/avatar';
import { ChevronRight } from 'lucide-react-native';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useUserFellowships } from '@/features/fellowship/hooks/useUserFellowships';

export default function UserFellowshipsScreen() {
	// URL 파라미터에서 userId 가져오기
	const { userId } = useLocalSearchParams<{ userId?: string }>();
	// 현재 로그인한 사용자 정보
	const { user, currentGroup } = useAuthStore();
	const { showToast } = useToastStore();

	// 사용자 프로필 정보 가져오기
	const { data: targetUser } = useUserProfile(userId || '');

	// userId가 없는 경우 메인 화면으로 리다이렉트
	useEffect(() => {
		if (!userId) {
			showToast({
				type: 'error',
				message: '유저 정보가 없어요',
			});
			router.replace('/(app)/(tabs)');
		}
	}, [userId, showToast]);

	// 새로고침 상태 관리
	const [refreshing, setRefreshing] = useState(false);

	// 특정 유저의 나눔 목록 가져오기
	const {
		data,
		isLoading,
		isRefetching,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useUserFellowships(userId || '');

	// 모든 페이지의 나눔을 하나의 배열로 병합
	const fellowships = data?.pages.flatMap((page) => page.items) || [];

	// 새로고침 처리
	const onRefresh = async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	};

	// 사용자 이름 표시 (현재 사용자 또는 다른 사용자)
	const displayName =
		userId === user?.id
			? '나의'
			: targetUser?.displayName
				? `${targetUser.displayName}님이`
				: '사용자님이';

	return (
		<SafeAreaView className="flex-1 bg-white">
			<VStack className="flex-1">
				<Header />

				{isLoading ? (
					<VStack className="flex-1 justify-center items-center">
						<ActivityIndicator size="large" />
					</VStack>
				) : (
					<FlatList
						data={fellowships}
						keyExtractor={(item) => item.identifiers.id}
						contentContainerStyle={{ paddingVertical: 16 }}
						ListHeaderComponent={
							<VStack space="md" className="px-4 mb-4">
								<Heading size="2xl">{displayName} 참여한 나눔</Heading>
							</VStack>
						}
						ListEmptyComponent={
							<EmptyState
								title="참여한 나눔이 없어요"
								description="아직 참여한 나눔이 없어요."
							/>
						}
						renderItem={({ item }) => (
							<AnimatedPressable
								onPress={() => router.push(`/(app)/(fellowship)/${item.identifiers.id}`)}
								className="px-4 py-3"
							>
								<VStack space="sm">
									<HStack className="justify-between items-center">
										<VStack className="flex-1">
											<Text
												size="lg"
												className="font-pretendard-bold text-typography-900"
												numberOfLines={1}
											>
												{item.info.title}
											</Text>
											<Text size="sm" className="text-typography-500">
												{item.info.date
													? item.info.date
														.toLocaleDateString('ko-KR', {
															year: 'numeric',
															month: '2-digit',
															day: '2-digit',
														})
														.replace(/\. /g, '.')
														.replace(/\.$/, '')
													: ''}
											</Text>
										</VStack>
										<Icon
											as={ChevronRight}
											size="xl"
											className="text-typography-400"
										/>
									</HStack>

									{/* 참여자 아바타 */}
									<HStack space="xs" className="flex-wrap">
										{item.info.participants.slice(0, 5).map((member) => (
											<Avatar
												key={member.id}
												size="2xs"
												photoUrl={member.photoUrl || undefined}
											>
												{member.displayName?.charAt(0)}
											</Avatar>
										))}
										{item.info.participants.length > 5 && (
											<Box className="w-6 h-6 rounded-full bg-gray-100 items-center justify-center">
												<Text size="xs" className="text-typography-500">
													+{item.info.participants.length - 5}
												</Text>
											</Box>
										)}
									</HStack>
								</VStack>
							</AnimatedPressable>
						)}
						ItemSeparatorComponent={() => (
							<Divider className="mx-4 bg-background-100" />
						)}
						refreshControl={
							<RefreshControl
								refreshing={refreshing || isRefetching}
								onRefresh={onRefresh}
							/>
						}
						// 무한 스크롤 구현
						onEndReached={() => {
							if (hasNextPage && !isFetchingNextPage) {
								fetchNextPage();
							}
						}}
						onEndReachedThreshold={0.5}
						ListFooterComponent={
							isFetchingNextPage ? (
								<VStack className="py-4 items-center">
									<ActivityIndicator size="small" />
								</VStack>
							) : null
						}
					/>
				)}
			</VStack>
		</SafeAreaView>
	);
}
