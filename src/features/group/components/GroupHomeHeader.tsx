import { View } from 'react-native';
import { useRef, useState } from 'react';
import { Button, ButtonIcon } from '@/components/common/button';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { Heading } from '@/shared/components/heading';
import { ChevronLeft, UserPlus } from 'lucide-react-native';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { BottomSheetListHeader } from '@/components/common/bottom-sheet';
import { Avatar, AvatarGroup } from '@/components/common/avatar';
import type { ClientGroup } from '@/api/group/types';
import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';
import { cn } from '@/shared/utils/cn';
import { FlatList } from 'react-native-gesture-handler';
import { isIOS } from '@/shared/utils/platform';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import { openProfile } from '@/shared/utils/router';
import { MemberListItem } from '../../profile/components/MemberListItem';
import * as Haptics from 'expo-haptics';
import { ShareInviteCodeSheet } from '@/shared/components/invite-code-sheet';

const MAX_INNER_MEMBER_LIST_HEIGHT = 400;

type Props = {
	groups: ClientGroup[];
};

function GroupHomeHeader({ groups }: Props) {
	const { currentGroup } = useAuthStore();
	const [isExpanded, setIsExpanded] = useState(false);
	const ref = useRef<{ handleOpenInviteCodeSheet: () => void }>(null);

	const {
		handleOpen: handleOpenMember,
		handleClose: handleCloseMember,
		BottomSheetContainer: MemberBottomSheetContainer,
	} = useBottomSheet({
		onClose: () => {
			setIsExpanded(false);
		},
	});

	const group = groups.find((group) => group.id === currentGroup?.groupId);

	const handlePressMemberGroup = () => {
		trackAmplitudeEvent('그룹 홈 멤버 list 클릭', {
			screen: 'Tab_Home',
			symbol: 'Home_Header',
		});
		setIsExpanded((prev) => !prev);
		handleOpenMember();
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then(() =>
			setTimeout(() => {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
			}, 50),
		);
	};

	const handlePressInvite = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
		trackAmplitudeEvent('그룹 홈 그룹원 초대 sheet 클릭', {
			screen: 'Tab_Home',
			symbol: 'Home_Header',
			location: 'Group_Menu_Bottom_Sheet',
		});
		ref.current?.handleOpenInviteCodeSheet();
	};

	return (
		<HStack
			className={cn(
				'items-center justify-between pr-2',
				isIOS ? 'pt-2' : 'pt-5',
			)}
		>
			<HStack className="items-center">
				<Button size="xl" variant="icon" onPress={() => router.back()}>
					<ButtonIcon as={ChevronLeft} />
				</Button>
				<Heading size="2xl">{group?.groupName}</Heading>
			</HStack>
			<HStack space="xs" className="items-center">
				<AvatarGroup onPress={handlePressMemberGroup} isExpanded={isExpanded}>
					{group?.members
						? group.members.map((member) => (
								<Avatar
									key={member.id}
									photoUrl={member.photoUrl ?? undefined}
									size="sm"
									className="bg-primary-400"
								/>
							))
						: []}
				</AvatarGroup>

				<Button size="lg" variant="icon" onPress={handlePressInvite}>
					<ButtonIcon as={UserPlus} />
				</Button>
			</HStack>
			{/* Group Members Bottom Sheet */}
			<MemberBottomSheetContainer>
				<VStack className="px-6 py-2">
					<BottomSheetListHeader
						label="그룹원 목록"
						onPress={handleCloseMember}
					/>
					<View className="pb-5">
						{group?.members && group.members.length > 0 ? (
							<FlatList
								data={group.members}
								renderItem={({ item: member }) => (
									<MemberListItem
										key={member.id}
										member={member}
										onPress={() => {
											handleCloseMember();
											openProfile(member.id);
										}}
									/>
								)}
								keyExtractor={(member) => member.id}
								showsVerticalScrollIndicator={false}
								style={{ maxHeight: MAX_INNER_MEMBER_LIST_HEIGHT }}
							/>
						) : (
							<Text className="text-center py-4">그룹원이 없어요.</Text>
						)}
					</View>
				</VStack>
			</MemberBottomSheetContainer>
			<ShareInviteCodeSheet inviteCode={group?.inviteCode || ''} ref={ref} />
		</HStack>
	);
}

export default GroupHomeHeader;
