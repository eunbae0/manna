import { useState, useMemo, useRef, useCallback } from 'react';
import { FlatList, ScrollView, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Box } from '#/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state';
import Header from '@/components/common/Header';
import { Pen } from 'lucide-react-native';
import { Text } from '#/components/ui/text';
import { useToastStore } from '@/store/toast';

// 게시판 관련 컴포넌트 및 데이터 import
import {
	FilterTag,
	BoardPostCard,
} from '@/features/board/components';
import { PostCategory, BoardPost } from '@/features/board/types';
import { useInfiniteBoardPosts } from '@/features/board/hooks';
import { useAuthStore } from '@/store/auth';

export default function BoardIndexScreen() {
	// 선택된 카테고리 필터 (null이면 '전체')
	const [selectedCategory, setSelectedCategory] = useState<
		PostCategory | null
	>(null);

	// 스크롤 위치에 따른 버튼 텍스트 표시 여부
	const scrollY = useRef(new Animated.Value(0)).current;
	const [showButtonText, setShowButtonText] = useState(true);

	// 현재 그룹 정보 가져오기
	const { currentGroup } = useAuthStore();
	const { showToast } = useToastStore();

	// 그룹 ID가 없으면 에러 처리
	if (!currentGroup) {
		showToast({
			type: 'error',
			message: '그룹 정보를 찾을 수 없어요',
		});
	}

	// 게시글 목록 조회 (React Query 사용 - 무한 스크롤)
	const {
		data,
		isLoading,
		isError,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch
	} = useInfiniteBoardPosts({
		groupId: currentGroup?.groupId || '',
		category: selectedCategory || undefined,
		limit: 10, // 한 페이지에 표시할 게시글 수
	});

	// 스크롤 위치가 일정 값 이상이면 버튼 텍스트 숨김
	const handleScroll = Animated.event(
		[{ nativeEvent: { contentOffset: { y: scrollY } } }],
		{
			useNativeDriver: true,
			listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
				const offsetY = event.nativeEvent.contentOffset.y;
				if (offsetY > 50 && showButtonText) {
					setShowButtonText(false);
				} else if (offsetY <= 50 && !showButtonText) {
					setShowButtonText(true);
				}
			},
		},
	);

	// 필터링된 게시글 목록
	const filteredPosts = useMemo(() => {
		if (!data?.pages) return [];

		// 모든 페이지의 게시글을 하나의 배열로 합치기
		const allPosts = data.pages.flatMap(page => page.items);

		// 고정된 글과 일반 글 분리
		const pinnedPosts = allPosts.filter((post) => post.isPinned);
		const regularPosts = allPosts.filter((post) => !post.isPinned);

		// 고정된 글은 항상 맨 위에 표시
		return [...pinnedPosts, ...regularPosts];
	}, [data]);

	// 게시글 작성 버튼 핸들러
	const handlePressWrite = () => {
		router.push('/(app)/(board)/create');
	};

	// 필터 태그 렌더링 함수
	const renderFilterTags = () => {
		return (
			<Box className="py-2 px-4 mt-2 h-12 overflow-hidden">
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="h-full"
				>
					<HStack className="items-center h-full">
						{/* '전체' 필터 태그 */}
						<FilterTag
							label="전체"
							isSelected={selectedCategory === null}
							onPress={() => setSelectedCategory(null)}
						/>

						{/* '공지사항' 필터 태그 */}
						<FilterTag
							label="공지사항"
							isSelected={selectedCategory === PostCategory.NOTICE}
							onPress={() => setSelectedCategory(PostCategory.NOTICE)}
						/>

						{/* '자유게시판' 필터 태그 */}
						<FilterTag
							label="자유게시판"
							isSelected={selectedCategory === PostCategory.FREE}
							onPress={() => setSelectedCategory(PostCategory.FREE)}
						/>
					</HStack>
				</ScrollView>
			</Box>
		);
	};

	// 리스트 구분선 렌더링 함수
	const renderSeparator = () => <Box className="h-px bg-gray-200" />;

	// 빈 상태 렌더링 함수
	const renderEmptyState = () => {
		if (isLoading && !isFetchingNextPage) {
			return (
				<VStack className="mt-10 items-center justify-center">
					<ActivityIndicator size="large" color="#6366f1" />
					<Text className="mt-4 text-gray-500">게시글을 불러오는 중이에요</Text>
				</VStack>
			);
		}

		if (isError) {
			return (
				<VStack className="mt-10">
					<EmptyState
						title="게시글을 불러오지 못했어요"
						description="잠시 후 다시 시도해주세요"
					/>
				</VStack>
			);
		}

		return (
			<VStack className="mt-10">
				<EmptyState
					title="게시글이 없어요"
					description="첫 번째 게시글을 작성해보세요!"
				/>
			</VStack>
		);
	};

	// 더 불러오기 핸들러
	const handleLoadMore = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	// 리스트 푸터 렌더링 함수
	const renderFooter = () => {
		if (!isFetchingNextPage) return null;
		
		return (
			<Box className="py-4 items-center justify-center">
				<ActivityIndicator size="small" color="#6366f1" />
			</Box>
		);
	};

	return (
		<SafeAreaView className="flex-1">
			<VStack className="flex-1">
				{/* 헤더 */}
				<Header label="게시판" />

				{/* 필터 태그 */}
				{renderFilterTags()}

				{/* 게시글 목록 */}
				<Animated.FlatList
					data={filteredPosts}
					renderItem={({ item }) => <BoardPostCard post={item} />}
					keyExtractor={(item) => item.id}
					ItemSeparatorComponent={renderSeparator}
					ListEmptyComponent={renderEmptyState}
					ListFooterComponent={renderFooter}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 28 }}
					onScroll={handleScroll}
					scrollEventThrottle={16}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.5}
					refreshControl={
						<RefreshControl
							refreshing={isLoading && !isFetchingNextPage}
							onRefresh={() => {
								if (currentGroup?.groupId) {
									refetch();
								}
							}}
							tintColor="#6366f1"
						/>
					}
				/>

				{/* 글쓰기 버튼 */}
				<Button
					size="lg"
					variant="solid"
					className="absolute bottom-5 right-4"
					rounded
					onPress={handlePressWrite}
				>
					{showButtonText && <ButtonText>글쓰기</ButtonText>}
					<ButtonIcon as={Pen} />
				</Button>
			</VStack>
		</SafeAreaView>
	);
}
