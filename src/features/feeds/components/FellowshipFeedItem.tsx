import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { Avatar } from '@/components/common/avatar';
import { Text } from '@/shared/components/text';
import type { FellowshipFeed } from '../api/types';
import { formatLocalDate } from '@/shared/utils/date';
import { VStack } from '#/components/ui/vstack';
import { useGroup } from '@/features/group/hooks/useGroup';
import { Timestamp } from '@react-native-firebase/firestore';
import { getCompactFellowshipContents } from '@/features/fellowship/utils';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';

export function FellowshipFeedItem({ item }: { item: FellowshipFeed }) {
	const { group } = useGroup(item.identifier.groupId);
	const { updateCurrentGroup } = useAuthStore();

	const findMemberInfo = useCallback(
		(id: string) => {
			return (
				item.members.find((member) => member.id === id) || {
					id,
					displayName:
						item.data.info.participants.find((member) => member.id === id)
							?.displayName || '알수없음',
				}
			);
		},
		[item],
	);
	const compactFellowshipContents = useMemo(
		() => getCompactFellowshipContents(item.data.content, findMemberInfo),
		[item.data.content, findMemberInfo],
	);

	const ts = new Timestamp(
		// @ts-expect-error: make date object manually (date is Object, not Timestamp)
		item.data.info.date._seconds,
		// @ts-expect-error: make date object manually (date is Object, not Timestamp)
		item.data.info.date._nanoseconds,
	);
	const date = ts.toDate();

	const handlePress = useCallback(() => {
		updateCurrentGroup({ groupId: item.identifier.groupId });
		router.push(`/(app)/(fellowship)/${item.identifier.id}`);
	}, [item, updateCurrentGroup]);

	return (
		<AnimatedPressable scale="sm" onPress={handlePress}>
			<View className="bg-white rounded-xl p-4">
				<HStack space="sm" className="items-center mb-3">
					<VStack space="xs" className="flex-1">
						<HStack space="sm" className="items-center">
							<Text
								size="xl"
								weight="semi-bold"
								className="text-typography-800"
							>
								{item.data.info.title}
							</Text>
							<View className="bg-primary-200/50 px-2 py-1 rounded-full items-center">
								<Text size="xs" className="text-primary-600">
									{group?.groupName}
								</Text>
							</View>
						</HStack>
						<Text size="md" className="text-typography-500">
							{formatLocalDate(date)}
						</Text>
					</VStack>
				</HStack>
				{compactFellowshipContents.length > 0 ? (
					<VStack space="sm">
						<VStack space="lg">
							{compactFellowshipContents.map((item) => (
								<ContentItem key={item.id} item={item} />
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
			</View>
		</AnimatedPressable>
	);
}

function ContentItem({
	item,
}: { item: ReturnType<typeof getCompactFellowshipContents>[number] }) {
	if (!item.content) return null;
	const answerText =
		typeof item.content.answer === 'string'
			? item.content.answer
			: item.content.answer.content;
	return (
		<VStack space="xs">
			<Text size="lg" numberOfLines={1} className="text-typography-800">
				{answerText}
			</Text>
			<HStack className="gap-[2px] items-center">
				<HStack space="xs" className="items-center">
					<Avatar
						size="2xs"
						photoUrl={item.content.member?.photoUrl || undefined}
					/>
					<Text size="md" weight="regular" className="text-typography-600">
						{item.content.member.displayName}
					</Text>
				</HStack>
				<Text size="md" className="text-typography-400">
					•
				</Text>
				<Text size="md" className="text-typography-500">
					{item.title}
				</Text>
			</HStack>
		</VStack>
	);
}
