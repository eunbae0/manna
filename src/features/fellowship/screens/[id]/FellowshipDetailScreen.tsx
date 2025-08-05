import { VStack } from '#/components/ui/vstack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, ScrollView } from 'react-native';
import { Icon } from '#/components/ui/icon';
import { Text } from '@/shared/components/text';
import {
	BookText,
	Text as TextIcon,
	Megaphone,
	RefreshCw,
	Users,
	MoreHorizontal,
	Edit2,
	Trash,
	ChevronDown,
} from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import { useCallback, useMemo, useRef, useState } from 'react';
import Animated, {} from 'react-native-reanimated';
import { useFellowshipStore } from '@/store/createFellowship';
import { Heading } from '@/shared/components/heading';
import { Avatar } from '@/components/common/avatar';
import { useAuthStore } from '@/store/auth';
import { Button, ButtonText, ButtonIcon } from '@/components/common/button';
import { useFellowship } from '@/features/fellowship/hooks/useFellowship';
import { FellowshipSkeleton } from './FellowshipSkeleton';
import FellowshipContentList from '../../components/FellowshipContentList';
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
import { useExpandAnimation } from '@/shared/hooks/animation/useExpandAnimation';
import { cn } from '@/shared/utils/cn';
import { SelectedBibleList } from '@/shared/components/bible';

interface FellowshipDetailScreenProps {
	id: string;
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

	// 실시간 데이터 페칭
	const { fellowship, isLoading, isError, updateFellowship, deleteFellowship } =
		useFellowship(id);

	// null을 undefined로 변환하여 타입 호환성 유지
	const fellowshipData = fellowship || undefined;

	// 실시간 업데이트를 사용하민로 화면 포커스 시 리페치는 불필요
	// 단, 스토어 상태 초기화는 유지
	useFocusEffect(
		useCallback(() => {
			getLastUpdatedIdAndReset();
		}, [getLastUpdatedIdAndReset]),
	);

	const handlePressEditButton = () => {
		if (!fellowshipData) return;

		setType('EDIT');
		setFellowshipId(fellowshipData.identifiers.id);
		updateFellowshipInfo({
			...fellowshipData.info,
		});
		updateFellowshipContent({
			...fellowshipData.content,
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
			fellowshipData
				? user?.id ===
					fellowshipData.info.participants.find(
						(participant) => participant.id === fellowshipData.roles.leaderId,
					)?.id
				: false,
		[fellowshipData, user],
	);

	const enableReply = useMemo(() => {
		return fellowshipData?.options?.enableMemberReply ? true : isLeader;
	}, [fellowshipData, isLeader]);

	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();

	const {
		toggle: toggleDetail,
		isExpanded: detailExpanded,
		containerStyle: detailContainerStyle,
		iconStyle: detailIconStyle,
		onContentLayout: onDetailContentLayout,
	} = useExpandAnimation({
		initiallyExpanded: true,
	});

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
					className="mt-4"
					onPress={() => router.replace('/(app)')}
				>
					<ButtonText>메인으로 가기</ButtonText>
				</Button>
			</VStack>
		);
	}

	return (
		<SafeAreaView className="h-full">
			<VStack space="md" className="h-full">
				<Header className="justify-between pr-4">
					{isLeader && (
						<Button variant="icon" onPress={() => handleOpen()}>
							<ButtonIcon as={MoreHorizontal} />
						</Button>
					)}
				</Header>

				<ScrollView showsVerticalScrollIndicator={false}>
					<VStack>
						{/* 나눔 노트 제목 및 정보 */}
						<VStack space="sm" className="px-5">
							<Text size="lg" className="text-typography-500">
								{fellowshipData?.info.date?.toLocaleDateString('ko-KR', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									weekday: 'long',
								})}{' '}
								나눔
							</Text>
							<HStack space="sm" className="items-center justify-between">
								<Heading size="3xl" className="flex-1">
									{fellowshipData?.info.title}
								</Heading>
								<AnimatedPressable onPress={() => toggleDetail()}>
									<Animated.View style={[detailIconStyle]}>
										<Icon
											as={ChevronDown}
											// @ts-ignore
											size="2xl"
											className="text-typography-500"
										/>
									</Animated.View>
								</AnimatedPressable>
							</HStack>
						</VStack>

						<Animated.View style={[detailContainerStyle]} className="px-5">
							<VStack
								space="xl"
								className="pt-6"
								onLayout={onDetailContentLayout}
							>
								{/* 설교 본문 */}
								<VStack space="xs">
									<HStack space="sm" className="items-center">
										<Icon
											as={BookText}
											size="sm"
											className="text-typography-600"
										/>
										<Text
											size="lg"
											weight="medium"
											className="text-typography-500"
										>
											설교 본문
										</Text>
									</HStack>

									{typeof fellowship?.info.preachText !== 'string' ? (
										<SelectedBibleList
											selectedBible={fellowship?.info.preachText || []}
											isReadonly
											className="mt-1 ml-6"
										/>
									) : (
										<Text
											size="xl"
											className={cn(
												'ml-6',
												!fellowship?.info.preachText && 'text-typography-500',
											)}
										>
											{fellowship?.info.preachText || '비어 있음'}
										</Text>
									)}
								</VStack>
								{/* 설교자 */}
								<VStack space="xs">
									<HStack space="sm" className="items-center">
										<Icon
											as={Megaphone}
											size="sm"
											className="text-typography-600"
										/>
										<Text
											size="lg"
											weight="medium"
											className="text-typography-500"
										>
											설교자
										</Text>
									</HStack>
									<Text
										size="xl"
										className={cn(
											'ml-6',
											!fellowship?.info.preacher
												? 'text-typography-500'
												: 'text-typography-800',
										)}
									>
										{fellowship?.info.preacher || '비어 있음'}
									</Text>
								</VStack>
								<VStack space="xs">
									<HStack space="sm" className="items-center">
										<Icon
											as={Users}
											size="sm"
											className="text-typography-600"
										/>
										<Text size="md" className="text-typography-600">
											참여자
										</Text>
									</HStack>
									<HStack space="sm" className="flex-wrap ml-6">
										{fellowship?.info.participants &&
										fellowship.info.participants.length > 0 ? (
											<ScrollView
												horizontal
												showsHorizontalScrollIndicator={false}
											>
												<HStack space="md" className="itmes-center">
													{fellowship.info.participants.map((participant) => (
														<AnimatedPressable
															key={participant.id}
															onPress={() =>
																!participant.isGuest &&
																openProfile(participant.id)
															}
														>
															<Avatar
																label={participant.displayName || ''}
																photoUrl={participant.photoUrl || ''}
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
							</VStack>
						</Animated.View>

						<Divider className="bg-background-100 my-6" />

						{/* 말씀 내용 */}
						<VStack className="gap-8 pb-10 px-5">
							{fellowshipData?.content.categories.iceBreaking.items &&
								Object.keys(fellowshipData.content.categories.iceBreaking.items)
									.length > 0 && (
									<FellowshipContentLayout title="아이스 브레이킹">
										<FellowshipContentList
											fellowshipId={id}
											contentType="iceBreaking"
											enableReply={enableReply}
										/>
									</FellowshipContentLayout>
								)}
							{fellowshipData?.content.categories.sermonTopic.items &&
								Object.keys(fellowshipData.content.categories.sermonTopic.items)
									.length > 0 && (
									<FellowshipContentLayout title="설교 나눔">
										<FellowshipContentList
											fellowshipId={id}
											contentType="sermonTopic"
											enableReply={enableReply}
										/>
									</FellowshipContentLayout>
								)}
							{fellowshipData?.content.categories.prayerRequest.isActive && (
								<FellowshipContentLayout
									title="기도 제목"
									enableReply={enableReply}
									onPressEdit={() => {
										// id가 content id
										router.push({
											pathname: `/(app)/(fellowship)/${id}/answer`,
											params: {
												contentType: 'prayerRequest',
												answerId: 'prayerRequest',
											},
										});
									}}
								>
									<FellowshipContentList
										fellowshipId={id}
										contentType="prayerRequest"
										enableReply={enableReply}
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
						label={'나눔 정보 수정하기'}
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
