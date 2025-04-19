import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Heading } from '#/components/ui/heading';
import Header from '@/components/common/Header';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { PrayerRequestCard } from '@/features/prayer-request/components/PrayerRequestCard';
import { usePrayerRequests } from '@/features/prayer-request/hooks/usePrayerRequests';
import { getKSTDate } from '@/shared/utils/date';
import { useState, useCallback } from 'react';
import { EmptyState } from '#/src/components/common/empty-state';
import { Divider } from '#/components/ui/divider';

/**
 * @deprecated
 * TODO: 기도제목 필터링(날짜, 작성자 등) 화면으로 수정
 */
export default function PrayerRequestListScreen() {
	const { user } = useAuthStore();
	const { prayerRequests, isLoading, refetch } = usePrayerRequests();
	const [refreshing, setRefreshing] = useState(false);

	const todayDate = getKSTDate(new Date());

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	}, [refetch]);

	if (!user) {
		return null;
	}

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
								<Heading size="xl">기도 제목 모아보기</Heading>
								<Text className="text-typography-500">
									소그룹원들의 기도제목을 확인해보세요
								</Text>
							</VStack>
						}
						ListEmptyComponent={
							<EmptyState
								title="기도 제목이 없습니다"
								description="아직 작성된 기도 제목이 없습니다. 첫 기도 제목을 작성해보세요."
							/>
						}
						renderItem={({ item }) => (
							<PrayerRequestCard prayerRequest={item} date={todayDate} />
						)}
						ItemSeparatorComponent={() => (
							<Divider className="mx-4 bg-background-100" />
						)}
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
						}
					/>
				)}
			</VStack>
		</SafeAreaView>
	);
}
