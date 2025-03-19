import { Pressable } from 'react-native';
import { Button, ButtonIcon, ButtonText } from '#/components/ui/button';
import { HStack } from '#/components/ui/hstack';
import { Heading } from '#/components/ui/heading';
import { AddIcon, Icon } from '#/components/ui/icon';
import {
	ChevronDown,
	MenuIcon,
	UserRound,
	HandHelping,
	Library,
	UserRoundPen,
	X,
	GlobeIcon,
	PlayIcon,
	SettingsIcon,
} from 'lucide-react-native';
import { Avatar, AvatarBadge, AvatarGroup } from '#/components/ui/avatar';
import { Divider } from '#/components/ui/divider';

import { useBottomSheet } from '@/hooks/useBottomSheet';
import {
	BottomSheetListHeader,
	BottomSheetListItem,
	BottomSheetListLayout,
} from '@/components/common/bottom-sheet';
import { Menu, MenuItem, MenuItemLabel } from '#/components/ui/menu';

function HomeHeader() {
	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();

	return (
		<HStack className="items-center justify-between pt-2 px-4">
			<Menu
				placement="bottom left"
				offset={5}
				trigger={({ ...triggerProps }) => {
					return (
						<Pressable {...triggerProps}>
							<HStack space="xs" className="items-center">
								<Heading className="text-[24px]">길동 사랑방</Heading>
								<Icon
									as={ChevronDown}
									className="w-7 h-7 color-typography-900"
								/>
							</HStack>
						</Pressable>
					);
				}}
			>
				<MenuItem key="Add account" textValue="Add account">
					<MenuItemLabel size="lg">길동 사랑방</MenuItemLabel>
				</MenuItem>
				<MenuItem key="Community" textValue="Community">
					<MenuItemLabel size="lg">철수 순</MenuItemLabel>
				</MenuItem>
				<MenuItem key="Plugins" textValue="Plugins">
					<Icon as={SettingsIcon} size="lg" className="mr-2" />
					<MenuItemLabel size="lg">소그룹 관리하기</MenuItemLabel>
				</MenuItem>
			</Menu>
			<HStack space="xl" className="px-1">
				<AvatarGroup className="justify-between items-center">
					<Avatar size="sm" className="bg-primary-400">
						<Icon as={UserRound} size="sm" className="stroke-white" />
					</Avatar>
					<Avatar size="sm" className="bg-primary-400">
						<Icon as={UserRound} size="sm" className="stroke-white" />
						<AvatarBadge className="bg-yellow-400" />
					</Avatar>
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
