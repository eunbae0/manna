import { VStack } from '#/components/ui/vstack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, View } from 'react-native';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import {
	BookText,
	Text as TextIcon,
	Edit,
	Megaphone,
	RefreshCw,
	Users,
	ChevronDown,
} from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import { useCallback, useMemo, useRef } from 'react';
import { useFellowshipStore } from '@/store/createFellowship';
import { Heading } from '#/components/ui/heading';
import { Avatar, AvatarGroup } from '@/components/common/avatar';
import { useAuthStore } from '@/store/auth';
import { Button, ButtonText, ButtonIcon } from '@/components/common/button';
import type { FellowshipMember } from '@/features/fellowship/api/types';
import { useFellowship } from '@/features/fellowship/hooks/useFellowship';
import { FellowshipSkeleton } from './FellowshipSkeleton';
import FellowshipContentList from '../../components/FellowshipContentList';
import FellowshipPrayerRequestList, {
	type FellowshipPrayerRequestListHandle,
} from '../../components/FellowshipPrayerRequestList';
import FellowshipContentLayout from '../../components/FellowshipContentLayout';

interface FellowshipDetailScreenProps {
	id: string;
}

export default function FellowshipDetailScreen({
	id,
}: FellowshipDetailScreenProps) {
	const { user } = useAuthStore();

	const {
		setType,
		setFellowshipId,
		updateFellowshipInfo,
		updateFellowshipContent,
		getLastUpdatedIdAndReset,
	} = useFellowshipStore();

	// React Query를 사용한 데이터 페칭
	const { fellowship, isLoading, isError, refetch, updateFellowship } =
		useFellowship(id);

	// 수정 후 네비게이션 시 데이터 갱신
	useFocusEffect(
		useCallback(() => {
			const lastUpdatedId = getLastUpdatedIdAndReset();

			if (lastUpdatedId && lastUpdatedId === id) {
				refetch();
			}
		}, [id, refetch, getLastUpdatedIdAndReset]),
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

	const isLeader = useMemo(
		() =>
			fellowship
				? user?.id ===
					fellowship.info.members.find(
						(member: FellowshipMember) => member.isLeader,
					)?.id
				: false,
		[fellowship, user],
	);

	const prayerRequestListRef = useRef<FellowshipPrayerRequestListHandle>(null);

	if (isLoading) {
		return <FellowshipSkeleton />;
	}

	if (isError) {
		return (
			<VStack
				space="md"
				className="px-5 flex-1 pb-8 items-center justify-center h-64"
			>
				<Icon as={RefreshCw} size="xl" className="text-error-500" />
				<Text className="text-error-500 text-center">
					나눔 노트를 불러오는 중 오류가 발생했어요.
				</Text>
				<Button
					variant="outline"
					onPress={() => refetch()}
					className="mt-4"
					animation={true}
				>
					<ButtonText>다시 시도</ButtonText>
					<ButtonIcon as={RefreshCw} />
				</Button>
			</VStack>
		);
	}

	return (
		<SafeAreaView className="h-full">
			<VStack space="xl" className="h-full">
				<Header className="justify-between pr-6">
					{isLeader && (
						<Pressable onPress={handlePressSettingButton}>
							<Icon as={Edit} size="lg" className="text-typography-900" />
						</Pressable>
					)}
				</Header>

				<ScrollView showsVerticalScrollIndicator={false}>
					<VStack space="2xl" className="px-5 flex-1 pb-8">
						{/* 나눔 노트 제목 및 정보 */}
						<VStack space="md">
							<Heading size="3xl">{fellowship?.info.preachTitle}</Heading>
							<Text size="lg" className="text-typography-500">
								{fellowship?.info.date?.toLocaleDateString('ko-KR', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									weekday: 'long',
								})}{' '}
								나눔
							</Text>
						</VStack>

						{/* 추가 정보 */}
						<VStack
							space="xl"
							className="relative bg-zinc-50 border border-background-200 rounded-2xl px-4 py-5"
						>
							<VStack space="xs">
								<HStack space="sm" className="items-center">
									<Icon
										as={TextIcon}
										size="sm"
										className="stroke-typography-600"
									/>
									<Text size="md" className="text-typography-600">
										설교 제목
									</Text>
								</HStack>
								<Text size="xl" className="ml-6">
									{fellowship?.info.preachTitle}
								</Text>
							</VStack>
							<VStack space="xs">
								<HStack space="sm" className="items-center">
									<Icon
										as={BookText}
										size="sm"
										className="stroke-typography-600"
									/>
									<Text size="md" className="text-typography-600">
										설교 본문
									</Text>
								</HStack>
								<Text size="xl" className="ml-6">
									{fellowship?.info.preachText?.value}
								</Text>
							</VStack>
							<VStack space="xs">
								<HStack space="sm" className="items-center">
									<Icon
										as={Megaphone}
										size="sm"
										className="stroke-typography-600"
									/>
									<Text size="md" className="text-typography-600">
										설교자
									</Text>
								</HStack>
								<Text size="xl" className="ml-6">
									{fellowship?.info.preacher?.value}
								</Text>
							</VStack>
							<VStack space="xs">
								<HStack space="sm" className="items-center">
									<Icon
										as={Users}
										size="sm"
										className="stroke-typography-600"
									/>
									<Text size="md" className="text-typography-600">
										참여자
									</Text>
								</HStack>
								<HStack space="sm" className="flex-wrap ml-6">
									{fellowship?.info.members &&
									fellowship.info.members.length > 0 ? (
										<AvatarGroup>
											{fellowship.info.members.map((member) => (
												<Avatar
													key={
														member.id || Math.random().toString(36).substring(7)
													}
													label={member.displayName || ''}
													photoUrl={member.photoUrl || ''}
													size="sm"
												/>
											))}
										</AvatarGroup>
									) : (
										<Text className="text-typography-500 italic">
											참여자가 없어요.
										</Text>
									)}
								</HStack>
							</VStack>
							<Pressable
								onPress={handlePressSettingButton}
								className="absolute top-5 right-4"
							>
								<HStack space="xs" className="items-center">
									<Text size="md" className="text-typography-600">
										접기
									</Text>
									<Icon
										as={ChevronDown}
										size="md"
										className="stroke-typography-600"
									/>
								</HStack>
							</Pressable>
						</VStack>

						{/* 말씀 내용 */}
						<VStack className="gap-8 pb-10">
							{fellowship?.content.iceBreaking &&
								fellowship?.content.iceBreaking.length > 0 && (
									<FellowshipContentLayout title="아이스 브레이킹">
										<FellowshipContentList
											members={fellowship.info.members}
											fellowshipContents={fellowship.content.iceBreaking}
											updateFellowship={updateFellowship}
											contentType="iceBreaking"
											isLeader={isLeader}
										/>
									</FellowshipContentLayout>
								)}
							{fellowship?.content.sermonTopic &&
								fellowship?.content.sermonTopic.length > 0 && (
									<FellowshipContentLayout title="설교 나눔">
										<FellowshipContentList
											members={fellowship.info.members}
											fellowshipContents={fellowship.content.sermonTopic}
											updateFellowship={updateFellowship}
											contentType="sermonTopic"
											isLeader={isLeader}
										/>
									</FellowshipContentLayout>
								)}
							{fellowship?.content.prayerRequest.isActive && (
								<FellowshipContentLayout
									title="기도 제목"
									onPressEdit={
										isLeader
											? () => prayerRequestListRef.current?.openTopic()
											: undefined
									}
								>
									<FellowshipPrayerRequestList
										ref={prayerRequestListRef}
										members={fellowship.info.members}
										answers={fellowship.content.prayerRequest.answers}
										updateFellowship={updateFellowship}
									/>
								</FellowshipContentLayout>
							)}
						</VStack>
					</VStack>
				</ScrollView>
			</VStack>
		</SafeAreaView>
	);
}
