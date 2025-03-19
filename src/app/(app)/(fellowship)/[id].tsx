import { VStack } from '#/components/ui/vstack';
import {
	SafeAreaView,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
	ActivityIndicator,
} from 'react-native';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import {
	BookText,
	Calendar,
	Megaphone,
	RefreshCcw,
	Settings,
	UserRound,
	Users,
} from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import { useState, useCallback, useEffect } from 'react';
import { useToastStore } from '@/store/toast';
import { useFellowshipStore } from '@/store/createFellowship';
import { Divider } from '#/components/ui/divider';
import { Heading } from '#/components/ui/heading';
import { Avatar, AvatarBadge, AvatarGroup } from '#/components/ui/avatar';
import { useAuthStore } from '@/store/auth';
import { Button, ButtonText, ButtonIcon } from '#/components/ui/button';
import SermonContent from '@/components/fellowship/SermonContent';
import PrayerRequestList from '@/components/fellowship/PrayerRequest';
import type {
	ClientFellowship,
	FellowshipContentField,
	FellowshipMember,
} from '@/api/fellowship/types';
import { fetchFellowshipById, updateFellowship } from '@/api/fellowship';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function FellowshipDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { user } = useAuthStore();

	const queryClient = useQueryClient();

	const { showSuccess, showError } = useToastStore();

	const {
		setType,
		setFellowshipId,
		updateFellowshipInfo,
		updateFellowshipContent,
		getLastUpdatedIdAndReset,
	} = useFellowshipStore();

	// React Query를 사용한 데이터 페칭
	const {
		data: fellowship,
		isLoading,
		isError,
		error,
		refetch,
		isFetching,
	} = useQuery<ClientFellowship, Error>({
		queryKey: ['fellowship', id],
		queryFn: async () => {
			if (!id) throw new Error('ID가 없습니다.');
			const groupId = 'oVgiDT2gRRuFUWuUV0Ya';
			const data = await fetchFellowshipById(groupId, id as string);
			if (!data) {
				throw new Error('나눔 노트를 찾을 수 없습니다.');
			}
			return data;
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5분 동안 데이터를 신선한 상태로 유지
		retry: 2,
	});

	// 오류 처리
	useEffect(() => {
		if (isError && error) {
			console.error('Error loading fellowship:', error);
			showError(
				error.message || '나눔 노트를 불러오는 중 오류가 발생했습니다.',
			);
		}
	}, [isError, error, showError]);

	// 수정 후 네비게이션 시 데이터 갱신
	useFocusEffect(
		useCallback(() => {
			const lastUpdatedId = getLastUpdatedIdAndReset();

			if (lastUpdatedId && lastUpdatedId === id) {
				refetch();
			}
		}, [id, refetch, getLastUpdatedIdAndReset]),
	);

	// 데이터 업데이트를 위한 mutation 정의
	const updateFellowshipMutation = useMutation<
		ClientFellowship,
		Error,
		ClientFellowship
	>({
		mutationFn: async (updatedFellowship: ClientFellowship) => {
			await updateFellowship('oVgiDT2gRRuFUWuUV0Ya', id, updatedFellowship);
			return updatedFellowship;
		},
		onSuccess: (updatedFellowship) => {
			// 성공 시 캐시 업데이트
			queryClient.setQueryData(['fellowship', id], updatedFellowship);
			showSuccess('나눔 노트가 업데이트되었어요.');
		},
		onError: (error) => {
			console.error('Error updating fellowship:', error);
			showError('나눔 노트 업데이트 중 오류가 발생했어요.');
		},
	});

	// fellowship 상태 업데이트 함수
	const setFellowship = useCallback(
		(updater: (prev: ClientFellowship) => ClientFellowship) => {
			if (!fellowship) return;

			const updatedFellowship = updater(fellowship);

			updateFellowshipMutation.mutate(updatedFellowship);

			queryClient.setQueryData<ClientFellowship>(
				['fellowship', id],
				updatedFellowship,
			);
		},
		[fellowship, id, queryClient, updateFellowshipMutation.mutate],
	);

	const handlePressSettingButton = () => {
		setType('EDIT');
		setFellowshipId(fellowship?.id || '');
		updateFellowshipInfo({
			...fellowship?.info,
		});
		updateFellowshipContent({
			...fellowship?.content,
		});
		router.push('/(app)/(fellowship)/create');
	};

	const isLeader = fellowship
		? user?.id ===
			fellowship.info.members.find(
				(member: FellowshipMember) => member.isLeader,
			)?.id
		: false;

	return (
		<SafeAreaView className="h-full">
			<VStack space="xl" className="h-full">
				<Header
					label="나눔 노트"
					onPressBackButton={() => router.back()}
					className="justify-between pr-6"
				>
					{isLeader && (
						<Pressable onPress={handlePressSettingButton}>
							<Icon as={Settings} size="lg" className="text-typography-900" />
						</Pressable>
					)}
				</Header>

				<ScrollView>
					{isLoading ? (
						<VStack
							space="md"
							className="px-5 flex-1 pb-8 items-center justify-center h-64"
						>
							<ActivityIndicator size="large" color="#0000ff" />
							<Text className="mt-4">나눔 노트를 불러오는 중...</Text>
						</VStack>
					) : isError ? (
						<VStack
							space="md"
							className="px-5 flex-1 pb-8 items-center justify-center h-64"
						>
							<Text className="text-red-500 mb-4">
								나눔 노트를 불러오는 중 오류가 발생했습니다.
							</Text>
							<Button
								onPress={() => refetch()}
								variant="outline"
								className="mt-2"
							>
								<ButtonIcon as={RefreshCcw} />
								<ButtonText>다시 시도</ButtonText>
							</Button>
						</VStack>
					) : fellowship ? (
						<VStack space="2xl" className="px-5 flex-1 pb-8">
							<Text className="text-3xl font-pretendard-bold">
								{fellowship.info.preachTitle}
							</Text>
							<VStack space="lg">
								<HStack space="sm" className="items-center w-full">
									<HStack space="sm" className="w-1/4 items-center">
										<Icon
											as={Calendar}
											size="lg"
											className="text-typography-600"
										/>
										<Text size="lg" className="text-typography-600">
											나눔 날짜
										</Text>
									</HStack>

									<Text size="lg" className="text-[16px] py-2 flex-1">
										{fellowship.info.date?.toLocaleDateString('ko-KR', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											weekday: 'long',
										})}
									</Text>
								</HStack>

								{fellowship.info.preachText?.isActive && (
									<HStack space="sm" className="items-center w-full">
										<HStack space="sm" className="w-1/4 items-center">
											<Icon
												as={BookText}
												size="lg"
												className="text-typography-600"
											/>
											<Text size="lg" className="text-typography-600">
												설교 본문
											</Text>
										</HStack>
										<Text className="w-full text-[16px]">
											{fellowship.info.preachText?.value}
										</Text>
									</HStack>
								)}

								{fellowship.info.preacher?.isActive && (
									<HStack space="sm" className="items-center w-full">
										<HStack space="sm" className="w-1/4 items-center">
											<Icon
												as={Megaphone}
												size="lg"
												className="text-typography-600"
											/>
											<Text size="lg" className="text-typography-600">
												설교자
											</Text>
										</HStack>
										<Text className="w-full text-[16px]">
											{fellowship.info.preacher?.value}
										</Text>
									</HStack>
								)}
								<HStack space="sm" className="items-center w-full">
									<HStack space="sm" className="w-1/4 items-center">
										<Icon
											as={Users}
											size="lg"
											className="text-typography-600"
										/>
										<Text size="lg" className="w-full text-typography-600">
											참여자
										</Text>
									</HStack>
									<AvatarGroup className="justify-between items-center">
										{fellowship.info.members.map((member) => (
											<Avatar
												key={member.id}
												size="sm"
												className="bg-primary-400"
											>
												<Icon
													as={UserRound}
													size="sm"
													className="stroke-white"
												/>
												<AvatarBadge className="bg-yellow-400" />
											</Avatar>
										))}
									</AvatarGroup>
								</HStack>
							</VStack>
							<Divider />
							<VStack className="gap-12">
								{fellowship.content.iceBreaking.length > 0 && (
									<VStack space="2xl">
										<Heading size="xl" className="text-typography-900">
											아이스 브레이킹
										</Heading>
										<VStack space="lg">
											{fellowship.content.iceBreaking.map((topic, index) => (
												<SermonContent
													key={topic.id}
													index={index}
													members={fellowship.info.members}
													sermonTopic={topic}
													setFellowship={setFellowship}
													contentType="iceBreaking"
												/>
											))}
										</VStack>
									</VStack>
								)}
								{fellowship.content.sermonTopic.length > 0 && (
									<VStack space="lg">
										<Heading size="xl" className="text-typography-900">
											설교 나눔
										</Heading>
										<VStack space="lg">
											{fellowship.content.sermonTopic.map((topic, index) => (
												<SermonContent
													key={topic.id}
													index={index}
													members={fellowship.info.members}
													sermonTopic={topic}
													setFellowship={setFellowship}
													contentType="sermonTopic"
												/>
											))}
										</VStack>
									</VStack>
								)}
								{fellowship.content.prayerRequest && (
									<VStack space="2xl">
										<Heading size="xl" className="text-typography-900">
											기도 제목
										</Heading>
										<PrayerRequestList
											members={fellowship.info.members}
											prayerRequests={fellowship.content.prayerRequest.answers}
											setFellowship={setFellowship}
										/>
									</VStack>
								)}
							</VStack>
						</VStack>
					) : (
						<VStack
							space="md"
							className="px-5 flex-1 pb-8 items-center justify-center h-64"
						>
							<Text>나눔 노트를 찾을 수 없습니다.</Text>
						</VStack>
					)}
				</ScrollView>
			</VStack>
		</SafeAreaView>
	);
}
