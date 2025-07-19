import type {
	ClientFellowshipParticipantV2,
	ClientFellowshipV2,
} from '../../api/types';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { formatLocalDate } from '@/shared/utils/date';
import Heading from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Avatar } from '@/components/common/avatar';
import AnimatedPressable from '@/components/common/animated-pressable';
import { router } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { getFellowshipContentItemList, getFellowshipContentTitleList } from '../../utils';

// 애니메이션 적용된 카테고리 제목 컴포넌트
export const AnimatedCategoryTitle = memo(function AnimatedCategoryTitle({
	content,
	isCurrentId,
}: {
	content: {
		id: string;
		title: string;
	};
	isCurrentId: boolean;
}) {
	const AnimatedText = Animated.createAnimatedComponent(Text);

	// 애니메이션 값 생성
	const scale = useSharedValue(isCurrentId ? 1.05 : 1);
	const opacity = useSharedValue(isCurrentId ? 1 : 0.7);

	// 애니메이션 스타일 정의
	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
	}));

	// isCurrentId가 변경될 때마다 애니메이션 적용
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		scale.value = withTiming(isCurrentId ? 1.05 : 1, { duration: 300 });
		opacity.value = withTiming(isCurrentId ? 1 : 0.7, { duration: 300 });
	}, [isCurrentId]);

	return (
		<AnimatedText
			weight={isCurrentId ? 'bold' : 'medium'}
			className={cn('text-typography-500', isCurrentId && 'text-primary-500')}
			size={isCurrentId ? 'lg' : 'md'}
			style={animatedStyle}
		>
			{content.title}
		</AnimatedText>
	);
});

type FellowshipContentItem = {
	id: string;
	content: Array<{
		member: ClientFellowshipParticipantV2;
		answer: string;
	}>;
};

// 애니메이션 적용된 개별 아이템 컴포넌트
export const AnimatedContentItem = memo(function AnimatedContentItem({
	item,
	index,
}: {
	item: {
		member: ClientFellowshipParticipantV2;
		answer: string;
	};
	index: number;
}) {
	const AnimatedVStack = Animated.createAnimatedComponent(VStack);
	const translateY = useSharedValue(30);
	const opacity = useSharedValue(0);

	// 애니메이션 스타일 정의
	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		opacity: opacity.value,
	}));

	// 컴포넌트가 마운트되면 애니메이션 시작
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const delay = index * 150;
		translateY.value = withDelay(
			delay,
			withSpring(0, { damping: 24, stiffness: 100 }),
		);
		opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
	}, [index]);

	return (
		<AnimatedVStack space="xs" style={animatedStyle}>
			<Text
				size="lg"
				numberOfLines={2}
				weight="medium"
				className="text-typography-600"
			>
				{item.answer}
			</Text>
			<HStack space="xs" className="items-center">
				<Avatar size="2xs" photoUrl={item.member.photoUrl} />
				<Text size="md" weight="regular" className="text-typography-600">
					{item.member.displayName}
				</Text>
			</HStack>
		</AnimatedVStack>
	);
});

export default function FellowshipCard({
	fellowship,
}: {
	fellowship: ClientFellowshipV2;
}) {
	const findMemberInfo = useCallback(
		(id: string) => {
			return fellowship.info.participants.find(
				(participant) => participant.id === id,
			) ?? {
						id,
						displayName: '알수없음',
						isGuest: false,
					};
		},
		[fellowship],
	);

	const fellowshipContentTitleList: Array<{
		id: string;
		title: string;
		items: ClientFellowshipV2['content']['categories'][string]['items'];
	}> = useMemo(
		() => getFellowshipContentTitleList(fellowship.content),
		[fellowship]
	);

	const [currentId, setCurrentId] = useState<string | null>(
		fellowshipContentTitleList[0]?.id || null,
	);

	const fellowshipContentItemList: Array<FellowshipContentItem> = useMemo(
		() =>
			getFellowshipContentItemList(fellowshipContentTitleList, findMemberInfo),
		[fellowshipContentTitleList, findMemberInfo],
	);

	const currentFellowshipContentItem: FellowshipContentItem['content'] =
		useMemo(
			() =>
				currentId
					? fellowshipContentItemList.find((item) => item.id === currentId)
							?.content || []
					: [],
			[currentId, fellowshipContentItemList],
		);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentId((prev) => {
				const ids = fellowshipContentTitleList.map((item) => item.id);
				if (!prev || !ids.includes(prev)) {
					return ids[0] || null;
				}
				const currentIndex = ids.indexOf(prev);
				return ids[(currentIndex + 1) % ids.length] || null;
			});
		}, 7000);

		return () => clearInterval(interval);
	}, [fellowshipContentTitleList]);

	const handlePressCard = () => {
		router.push(`/(app)/(fellowship)/${fellowship.identifiers.id}`);
	};

	const generateRandomSliceRange = useCallback((length: number) => {
		const randomIndex = Math.floor(Math.random() * (length - 1));
		const endIndex = Math.min(randomIndex + 2, length);
		return [randomIndex, endIndex];
	}, []);

	return (
		<AnimatedPressable scale="sm" onPress={handlePressCard}>
			<VStack
				space="md"
				className="bg-gray-50 border border-gray-100 w-96 min-h-72 rounded-2xl p-4"
			>
				<HStack space="xs" className="items-center justify-between">
					<Heading size="xl" className="max-w-48" numberOfLines={1}>
						{fellowship.info.title}
					</Heading>
					<Text className="text-typography-500">
						{formatLocalDate(fellowship.info.date)} 나눔
					</Text>
				</HStack>
				{fellowshipContentTitleList.length > 0 ? (
					<VStack space="sm">
						<HStack space="sm" className="items-center">
							{fellowshipContentTitleList.map((content) => (
								<AnimatedCategoryTitle
									key={content.id}
									content={content}
									isCurrentId={currentId === content.id}
								/>
							))}
						</HStack>
						<VStack space="md">
							{currentFellowshipContentItem
								?.slice(
									...generateRandomSliceRange(
										currentFellowshipContentItem.length,
									),
								)
								?.map((item, index) => (
									<AnimatedContentItem
										key={item.member.id}
										item={item}
										index={index}
									/>
								))}
						</VStack>
					</VStack>
				) : (
					<VStack space="sm" className="pt-6">
						<Text size="lg" weight="semi-bold" className="text-typography-700">
							나눔 답변이 없어요.
						</Text>
						<Text size="md" weight="medium" className="text-typography-500">
							지금 클릭해서 그룹원들의 답변을 적어보세요
						</Text>
					</VStack>
				)}
			</VStack>
		</AnimatedPressable>
	);
}
