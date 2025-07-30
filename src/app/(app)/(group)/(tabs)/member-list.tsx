import { View } from 'react-native';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { useGroupMembers } from '@/features/group/hooks/useGroupMembers';
import { useAuthStore } from '@/store/auth';
import Header from '@/components/common/Header';
import { openProfile } from '@/shared/utils/router';
import { ShareInviteCodeSheet } from '@/shared/components/invite-code-sheet';
import { FlashList } from '@shopify/flash-list';
import { MemberListItem } from '@/features/profile/components/MemberListItem';
import { useMemo, useRef, useState } from 'react';
import { ChevronDown, UserPlus } from 'lucide-react-native';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Icon } from '#/components/ui/icon';
import { HStack } from '#/components/ui/hstack';
import {
	PopupMenu,
	PopupMenuItem,
	PopupMenuItemLabel,
} from '@/shared/components/popup-menu';

export default function MemberListScreen() {
	const { currentGroup } = useAuthStore();
	const groupId = currentGroup?.groupId;
	const { group, members } = useGroupMembers(groupId || '');
	const ref = useRef<{ handleOpenInviteCodeSheet: () => void }>(null);
	const memberListRef = useRef<FlashList<any>>(null);

	const [sort, setSort] = useState<'기본 순' | '가나다 순'>('기본 순');

	const sortedMemberList = useMemo(() => {
		switch (sort) {
			case '기본 순':
				return members?.sort((a, b) => {
					if (a.role === 'leader' && b.role !== 'leader') return -1;
					if (a.role !== 'leader' && b.role === 'leader') return 1;
					return 0;
				});
			case '가나다 순':
				return members?.sort((a, b) =>
					(a.displayName || '').localeCompare(b.displayName || '', 'ko-KR'),
				);
			default:
				return members;
		}
	}, [members, sort]);

	const handlePressSort = (_sort: '기본 순' | '가나다 순') => {
		setSort(_sort);
		memberListRef.current?.scrollToOffset({ animated: true, offset: 0 });
	};

	return (
		<>
			<VStack className="flex-1">
				<Header label="그룹원 목록" className="justify-between">
					<AnimatedPressable
						className="mr-4 px-4 py-2 bg-background-200/50 rounded-2xl"
						onPress={() => ref.current?.handleOpenInviteCodeSheet()}
					>
						<HStack space="sm" className="items-center">
							<Text
								size="md"
								weight="semi-bold"
								className="text-typography-600"
							>
								그룹원 초대하기
							</Text>
							<Icon size="sm" as={UserPlus} className="text-typography-600" />
						</HStack>
					</AnimatedPressable>
				</Header>
				<PopupMenu
					placement="bottom left"
					hasBackdrop={false}
					trigger={({ ...triggerProps }) => {
						return (
							<AnimatedPressable
								{...triggerProps}
								scale="sm"
								className="px-5 py-2 mt-4"
							>
								<HStack space="xs" className="items-center">
									<Text
										size="lg"
										weight="semi-bold"
										className="text-typography-700"
									>
										{sort}
									</Text>
									<Icon
										as={ChevronDown}
										size="md"
										className="text-typography-700"
									/>
								</HStack>
							</AnimatedPressable>
						);
					}}
				>
					<PopupMenuItem
						closeOnSelect
						onPress={() => handlePressSort('기본 순')}
					>
						<PopupMenuItemLabel size="md">기본 순</PopupMenuItemLabel>
					</PopupMenuItem>
					<PopupMenuItem
						closeOnSelect
						onPress={() => handlePressSort('가나다 순')}
					>
						<PopupMenuItemLabel size="md">가나다 순</PopupMenuItemLabel>
					</PopupMenuItem>
				</PopupMenu>
				{members && members.length > 0 ? (
					<View className="flex-1 px-5">
						<FlashList
							ref={memberListRef}
							data={sortedMemberList}
							renderItem={({ item: member }) => (
								<MemberListItem
									member={member}
									onPress={() => openProfile(member.id)}
								/>
							)}
							keyExtractor={(item) => item.id} // ID와 인덱스 조합
							estimatedItemSize={70}
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{ paddingVertical: 8 }}
							ItemSeparatorComponent={() => <View className="h-2" />}
							getItemType={(item) => item.id}
							extraData={[members, sort]}
						/>
					</View>
				) : (
					<Text className="text-center py-4">그룹원이 없어요.</Text>
				)}
			</VStack>
			<ShareInviteCodeSheet inviteCode={group?.inviteCode || ''} ref={ref} />
		</>
	);
}
