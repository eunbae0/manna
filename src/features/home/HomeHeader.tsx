import { Pressable } from 'react-native';
import { Button, ButtonIcon } from '#/components/ui/button';
import { HStack } from '#/components/ui/hstack';
import { Heading } from '#/components/ui/heading';
import { Icon } from '#/components/ui/icon';
import {
	ChevronDown,
	MenuIcon,
	HandHelping,
	Library,
	UserRoundPen,
	SettingsIcon,
} from 'lucide-react-native';
import { Divider } from '#/components/ui/divider';

import { useBottomSheet } from '@/hooks/useBottomSheet';
import {
	BottomSheetListHeader,
	BottomSheetListItem,
	BottomSheetListLayout,
} from '@/components/common/bottom-sheet';
import { Menu, MenuItem, MenuItemLabel } from '#/components/ui/menu';
import { Avatar, AvatarGroup } from '../../components/common/avatar';
import type { ClientGroup } from '@/api/group/types';
import { useAuthStore } from '@/store/auth';

type Props = {
	groups: ClientGroup[];
};

function HomeHeader({ groups }: Props) {
	const { currentGroup, updateCurrentGroup } = useAuthStore();
	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();

	const group = groups.find((group) => group.id === currentGroup?.groupId);

	return (
		<HStack className="items-center justify-between pt-2 px-4">
			<Menu
				placement="bottom left"
				offset={5}
				trigger={({ ...triggerProps }) => {
					return (
						<Pressable {...triggerProps}>
							<HStack space="xs" className="items-center">
								<Heading className="text-[24px]">{group?.groupName}</Heading>
								<Icon
									as={ChevronDown}
									className="w-7 h-7 color-typography-900"
								/>
							</HStack>
						</Pressable>
					);
				}}
			>
				{groups.length > 0 &&
					groups.map((group) => (
						<MenuItem
							key={group.id}
							textValue={group.groupName}
							closeOnSelect
							onPress={() => updateCurrentGroup({ groupId: group.id })}
						>
							<MenuItemLabel size="lg">{group.groupName}</MenuItemLabel>
						</MenuItem>
					))}
				<MenuItem key="Plugins" textValue="Plugins">
					<Icon as={SettingsIcon} size="lg" className="mr-2" />
					<MenuItemLabel size="lg">소그룹 관리하기</MenuItemLabel>
				</MenuItem>
			</Menu>
			<HStack space="xl" className="px-1 items-center">
				<AvatarGroup onPress={() => {}}>
					{group?.members
						? group.members.map((member) => (
								<Avatar
									key={member.user.id}
									photoUrl={member.user.photoUrl ?? undefined}
									size="sm"
									className="bg-primary-400"
								/>
							))
						: []}
				</AvatarGroup>

				<Button size="xl" variant="link" onPress={() => handleOpen()}>
					<ButtonIcon
						as={MenuIcon}
						width={24}
						height={24}
						className="color-typography-900"
					/>
				</Button>
			</HStack>
			<BottomSheetContainer>
				<BottomSheetListLayout>
					<BottomSheetListHeader label="소그룹 메뉴" onPress={handleClose} />
					<BottomSheetListItem
						label="기도 제목"
						icon={HandHelping}
						onPress={handleClose}
					/>
					<Divider />
					<BottomSheetListItem
						label="나눔 기록"
						icon={Library}
						onPress={handleClose}
					/>
					<Divider />
					<BottomSheetListItem
						label="소그룹원 관리하기"
						icon={UserRoundPen}
						onPress={handleClose}
					/>
				</BottomSheetListLayout>
			</BottomSheetContainer>
		</HStack>
	);
}

export default HomeHeader;
