import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { VStack } from '#/components/ui/vstack';
import { Heading } from '@/shared/components/heading';
import Header from '@/components/common/Header';
import { PrayerRequestCard } from '@/features/prayer-request/components/PrayerRequestCard';
import { useUserPrayerRequests } from '@/features/prayer-request/hooks/useUserPrayerRequests';
import { EmptyState } from '@/components/common/empty-state';
import { Divider } from '#/components/ui/divider';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useState, useEffect } from 'react';
import { useToastStore } from '@/store/toast';
import { useUserProfile } from '@/features/profile/hooks/hooks';

export default function UserPrayerRequestsScreen() {
	// URL 파라미터에서 userId 가져오기
	const { userId } = useLocalSearchParams<{ userId?: string }>();
	// 현재 로그인한 사용자 정보
	const { user } = useAuthStore();
	const { showToast } = useToastStore();

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

	// 특정 유저의 기도제목 가져오기
	const {
		prayerRequests,
		isLoading,
		isRefetching,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useUserPrayerRequests(userId || '');

	// 새로고침 처리
	const onRefresh = async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	};

	// 사용자 이름 표시 (현재 사용자 또는 다른 사용자)
	const displayName =
		userId === user?.id
			? '내'
			: targetUser?.displayName
				? `${targetUser.displayName}님의`
				: '사용자 님의';

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
						data={prayerRequests}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{ paddingVertical: 16 }}
						ListHeaderComponent={
							<VStack space="md" className="px-4 mb-4">
								<Heading size="2xl">{displayName} 기도 제목</Heading>
							</VStack>
						}
						ListEmptyComponent={
							<EmptyState
								title="기도 제목이 없어요"
								description="아직 작성된 기도 제목이 없어요."
							/>
						}
						renderItem={({ item }) => (
							<PrayerRequestCard prayerRequest={item} />
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
