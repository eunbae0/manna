import { VStack } from '#/components/ui/vstack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
	Alert,
	Pressable,
	ScrollView,
	View,
	RefreshControl,
} from 'react-native';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import {
	BookText,
	Text as TextIcon,
	Edit,
	Megaphone,
	RefreshCw,
	Users,
	ChevronUp,
	MoreHorizontal,
	Edit2,
	Trash,
} from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import { useCallback, useMemo, useRef, useState } from 'react';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	interpolate,
	Easing,
} from 'react-native-reanimated';
import { useFellowshipStore } from '@/store/createFellowship';
import { Heading } from '@/shared/components/heading';
import { Avatar } from '@/components/common/avatar';
import { useAuthStore } from '@/store/auth';
import { Button, ButtonText, ButtonIcon } from '@/components/common/button';
import type {
	ClientFellowship,
	ServerFellowshipMember,
} from '@/features/fellowship/api/types';
import { useFellowship } from '@/features/fellowship/hooks/useFellowship';
import { FellowshipSkeleton } from './FellowshipSkeleton';
import FellowshipContentList from '../../components/FellowshipContentList';
import FellowshipPrayerRequestList, {
} from '../../components/FellowshipPrayerRequestList';
import FellowshipContentLayout from '../../components/FellowshipContentLayout';
import {
	BottomSheetListHeader,
	BottomSheetListItem,
	BottomSheetListLayout,
} from '@/components/common/bottom-sheet';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { Divider } from '#/components/ui/divider';
import AnimatedPressable from '@/components/common/animated-pressable';
import { openProfile } from '@/shared/utils/router';

interface FellowshipDetailScreenProps {
	id: string;
}

function AdditionalInfo({
	fellowship,
}: { fellowship: ClientFellowship | undefined }) {
	const [isFolded, setIsFolded] = useState(false);

	const foldAnimation = useSharedValue(1); // 1: 펼쳐짐, 0: 접힘
	const rotateAnimation = useSharedValue(0); // 0: 아래 화살표, 1: 위 화살표

	const toggleFold = () => {
		setIsFolded(!isFolded);
		foldAnimation.value = withTiming(isFolded ? 1 : 0, {
			duration: 300,
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		});
		rotateAnimation.value = withTiming(isFolded ? 0 : 1, {
			duration: 300,
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		});
	};

	const contentStyle = useAnimatedStyle(() => {
		return {
			opacity: foldAnimation.value,
			maxHeight: interpolate(foldAnimation.value, [0, 1], [0, 500]),
			height: 'auto',
			gap: 16,
			marginTop: interpolate(foldAnimation.value, [0, 1], [0, 16]),
			flexDirection: 'column',
		};
	});

	const iconStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					rotate: `${interpolate(rotateAnimation.value, [0, 1], [0, 180])}deg`,
				},
			],
		};
	});

	return (
		<VStack
			// space="xl"
			className="relative bg-zinc-50 border border-background-200 rounded-2xl px-4 py-5"
		>
			{/* 접기/펼치기 버튼 */}
			<Pressable onPress={toggleFold} className="absolute top-5 right-4">
				<HStack space="xs" className="items-center">
					<Text size="md" className="text-typography-600">
						{isFolded ? '펼치기' : '접기'}
					</Text>
					<Animated.View style={iconStyle}>
						<Icon as={ChevronUp} size="md" className="stroke-typography-600" />
					</Animated.View>
				</HStack>
			</Pressable>

			<VStack space="xs">
				<HStack space="sm" className="items-center">
					<Icon as={TextIcon} size="sm" className="stroke-typography-600" />
					<Text size="md" className="text-typography-600">
						설교 제목
					</Text>
				</HStack>
				<Text size="xl" className="ml-6">
					{fellowship?.info.preachTitle}
				</Text>
			</VStack>
			{/* 접기/펼치기 가능한 콘텐츠 */}
			<Animated.View style={contentStyle}>
				{fellowship?.info.preachText?.isActive && (
					<VStack space="xs">
						<HStack space="sm" className="items-center">
							<Icon as={BookText} size="sm" className="stroke-typography-600" />
							<Text size="md" className="text-typography-600">
								설교 본문
							</Text>
						</HStack>
						<Text size="xl" className="ml-6">
							{fellowship?.info.preachText?.value}
						</Text>
					</VStack>
				)}
				{fellowship?.info.preacher?.isActive && (
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
				)}
				<VStack space="xs">
					<HStack space="sm" className="items-center">
						<Icon as={Users} size="sm" className="stroke-typography-600" />
						<Text size="md" className="text-typography-600">
							참여자
						</Text>
					</HStack>
					<HStack space="sm" className="flex-wrap ml-6">
						{fellowship?.info.members && fellowship.info.members.length > 0 ? (
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								<HStack space="md" className="itmes-center">
									{fellowship.info.members.map((member) => (
										<AnimatedPressable
											key={member.id}
											onPress={() => !member.isGuest && openProfile(member.id)}
										>
											<Avatar
												label={member.displayName || ''}
												photoUrl={member.photoUrl || ''}
												size="sm"
											/>
										</AnimatedPressable>
									))}
								</HStack>
							</ScrollView>
						) : (
							<Text className="text-typography-500 italic">
								참여자가 없어요.
							</Text>
						)}
					</HStack>
				</VStack>
			</Animated.View>
		</VStack>
	);
}

export default function FellowshipDetailScreen({
	id,
}: FellowshipDetailScreenProps) {
	const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
	const { user } = useAuthStore();

	const {
		setType,
		setFellowshipId,
		updateFellowshipInfo,
		updateFellowshipContent,
		getLastUpdatedIdAndReset,
	} = useFellowshipStore();

	// React Query를 사용한 데이터 페칭
	const {
		fellowship,
		isLoading,
		isError,
		refetch,
		updateFellowship,
		deleteFellowship,
	} = useFellowship(id);

	// 수정 후 네비게이션 시 데이터 갱신
	useFocusEffect(
		useCallback(() => {
			const lastUpdatedId = getLastUpdatedIdAndReset();

			if (lastUpdatedId && lastUpdatedId === id) {
				refetch();
			}
		}, [id, refetch, getLastUpdatedIdAndReset]),
	);

	const handlePressEditButton = () => {
		setType('EDIT');
		setFellowshipId(fellowship?.id || '');
		updateFellowshipInfo({
			...fellowship?.info,
		});
		updateFellowshipContent({
			...fellowship?.content,
		});
		handleClose();
		router.push('/(app)/(fellowship)/create');
	};

	const handlePressDeleteButton = () => {
		Alert.alert('나눔을 삭제할까요?', '', [
			{
				text: '삭제',
				style: 'destructive',
				onPress: () => {
					deleteFellowship();
					handleClose();
				},
			},
			{
				text: '취소',
				onPress: handleClose,
			},
		]);
	};

	const isLeader = useMemo(
		() =>
			fellowship
				? user?.id ===
				fellowship.info.members.find(
					(member: ServerFellowshipMember) => member.isLeader,
				)?.id
				: false,
		[fellowship, user],
	);

	const enableReply = useMemo(() => {
		return fellowship?.options?.enableMemberReply ? true : isLeader;
	}, [fellowship, isLeader]);

	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		try {
			await refetch();
		} finally {
			setIsRefreshing(false);
		}
	}, [refetch]);

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
				<Header className="justify-between pr-4">
					{isLeader && (
						<Button variant="icon" onPress={() => handleOpen()}>
							<ButtonIcon as={MoreHorizontal} />
						</Button>
					)}
				</Header>

				<ScrollView
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={isRefreshing}
							onRefresh={handleRefresh}
						/>
					}
				>
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
						<AdditionalInfo fellowship={fellowship} />

						{/* 말씀 내용 */}
						<VStack className="gap-8 pb-10">
							{fellowship?.content.iceBreaking &&
								fellowship?.content.iceBreaking.length > 0 && (
									<FellowshipContentLayout title="아이스 브레이킹">
										<FellowshipContentList
											fellowshipId={id}
											contentType="iceBreaking"
											enableReply={enableReply}
										/>
									</FellowshipContentLayout>
								)}
							{fellowship?.content.sermonTopic &&
								fellowship?.content.sermonTopic.length > 0 && (
									<FellowshipContentLayout title="설교 나눔">
										<FellowshipContentList
											fellowshipId={id}
											contentType="sermonTopic"
											enableReply={enableReply}
										/>
									</FellowshipContentLayout>
								)}
							{fellowship?.content.prayerRequest.isActive && (
								<FellowshipContentLayout
									title="기도 제목"
									enableReply={enableReply}
									onPressEdit={() => {
										// id가 content id
										router.push({
											pathname: `/(app)/(fellowship)/${id}/answer`,
											params: { contentType: "prayerRequest", index: "-1" }
										});
									}
									}
								>
									<FellowshipPrayerRequestList
										answers={fellowship.content.prayerRequest.answers}
									/>
								</FellowshipContentLayout>
							)}
						</VStack>
					</VStack>
				</ScrollView>
			</VStack>
			<BottomSheetContainer>
				<BottomSheetListLayout>
					<BottomSheetListHeader label={'나눔 관리'} onPress={handleClose} />
					<BottomSheetListItem
						label={'나눔 수정하기'}
						icon={Edit2}
						onPress={handlePressEditButton}
					/>
					<Divider />
					<BottomSheetListItem
						label={'나눔 삭제하기'}
						icon={Trash}
						onPress={handlePressDeleteButton}
					/>
				</BottomSheetListLayout>
			</BottomSheetContainer>
		</SafeAreaView>
	);
}
