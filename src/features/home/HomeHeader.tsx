import { Pressable, View } from 'react-native';
import { useState } from 'react';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Heading } from '@/shared/components/heading';
import { Icon } from '#/components/ui/icon';
import { useCopyInviteCode } from '@/shared/hooks/useCopyInviteCode';
import {
	ChevronDown,
	MenuIcon,
	Library,
	Settings,
	SettingsIcon,
	Copy,
	Users,
	ChevronRight,
} from 'lucide-react-native';
import { Divider } from '#/components/ui/divider';

import { useBottomSheet } from '@/hooks/useBottomSheet';
import {
	BottomSheetListHeader,
	BottomSheetListItem,
	BottomSheetListLayout,
} from '@/components/common/bottom-sheet';
import { Menu, MenuItem, MenuItemLabel } from '#/components/ui/menu';
import { Avatar, AvatarGroup } from '@/components/common/avatar';
import type { ClientGroup } from '@/api/group/types';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { router } from 'expo-router';
import { Box } from '#/components/ui/box';
import { cn } from '@/shared/utils/cn';
import { ScrollView } from 'react-native-gesture-handler';
import { isIOS } from '@/shared/utils/platform';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import type { AmplitudeLocation } from '@/shared/constants/amplitude';

const MAX_INNER_MEMBER_LIST_HEIGHT = 200;

type Props = {
	groups: ClientGroup[];
};

function HomeHeader({ groups }: Props) {
	const { user, currentGroup, updateCurrentGroup } = useAuthStore();
	const [isExpanded, setIsExpanded] = useState(false);

	const {
		handleOpen: handleOpenMenu,
		handleClose: handleCloseMenu,
		BottomSheetContainer: MenuBottomSheetContainer,
	} = useBottomSheet();
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

	// const handlePressPrayerRequestList = () => {
	// 	router.push('/(app)/(prayerRequest)/list');
	// 	handleCloseMenu();
	// };

	const handlePressFellowshipList = () => {
		trackAmplitudeEvent('View Fellowship List', {
			screen: 'Tab_Home',
			symbol: 'Home_Header',
			location: 'Group_Menu_Bottom_Sheet',
		});
		router.push('/(app)/(fellowship)/list');
		handleCloseMenu();
	};

	const handlePressMemberGroup = () => {
		trackAmplitudeEvent('View Group Member Avatar List', {
			screen: 'Tab_Home',
			symbol: 'Home_Header',
		});
		setIsExpanded((prev) => !prev);
		handleOpenMember();
	};

	const handlePressManageMember = () => {
		trackAmplitudeEvent('Manage Group', {
			screen: 'Tab_Home',
			symbol: 'Home_Header',
			location: 'Group_Menu_Bottom_Sheet',
		});
		router.push('/(app)/(group)/(manage-group)');
		handleCloseMenu();
	};

	const isLeader =
		group?.members?.find((m) => m.id === user?.id)?.role === 'leader';

	const handlePressManageMyGroup = () => {
		trackAmplitudeEvent('Manage My Group', {
			screen: 'Tab_Home',
			symbol: 'Home_Header',
			location: 'Group_List_Menu',
		});
		router.push('/(app)/(group)/manage-my-group');
		handleCloseMenu();
	};

	const handlePressGroupMemberList = (
		location: keyof typeof AmplitudeLocation,
	) => {
		trackAmplitudeEvent('View Group Member List', {
			screen: 'Tab_Home',
			symbol: 'Home_Header',
			location,
		});
		handleCloseMember();
		handleCloseMenu();
		router.push('/(app)/(group)/member-list');
	};

	return (
		<HStack
			className={cn(
				'items-center justify-between pl-4 pr-3',
				isIOS ? 'pt-2' : 'pt-5',
			)}
		>
			<Menu
				placement="bottom left"
				offset={5}
				trigger={({ ...triggerProps }) => {
					return (
						<Pressable
							{...triggerProps}
							onPress={() => {
								trackAmplitudeEvent('Open Group List', {
									screen: 'Tab_Home',
									symbol: 'Home_Header',
									location: 'Group_List_Menu',
								});
								triggerProps?.onPress();
							}}
						>
							<HStack space="xs" className="items-center">
								<Heading size="2xl">{group?.groupName}</Heading>
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
							onPress={() => {
								trackAmplitudeEvent('Select Group', {
									screen: 'Tab_Home',
									symbol: 'Home_Header',
									location: 'Group_List_Menu',
								});
								updateCurrentGroup({ groupId: group.id });
							}}
						>
							<MenuItemLabel size="lg">{group.groupName}</MenuItemLabel>
						</MenuItem>
					))}
				<MenuItem
					key="Plugins"
					textValue="Plugins"
					onPress={handlePressManageMyGroup}
				>
					<Icon as={SettingsIcon} size="lg" className="mr-2" />
					<MenuItemLabel size="lg">내 그룹 관리하기</MenuItemLabel>
				</MenuItem>
			</Menu>
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

				<Button
					size="xl"
					variant="icon"
					onPress={() => {
						trackAmplitudeEvent('Open Group Menu', {
							screen: 'Tab_Home',
							symbol: 'Home_Header',
							location: 'Group_Menu_Bottom_Sheet',
						});
						handleOpenMenu();
					}}
				>
					<ButtonIcon as={MenuIcon} />
				</Button>
			</HStack>
			<MenuBottomSheetContainer>
				<BottomSheetListLayout>
					<BottomSheetListHeader
						label="소그룹 메뉴"
						onPress={handleCloseMenu}
					/>
					{/* <BottomSheetListItem
						label="기도 제목 모아보기"
						icon={HandHelping}
						onPress={handlePressPrayerRequestList}
					/> */}
					<BottomSheetListItem
						label="그룹원 목록"
						icon={Users}
						onPress={() =>
							handlePressGroupMemberList('Group_Menu_Bottom_Sheet')
						}
					/>
					<Divider />
					<BottomSheetListItem
						label="나눔 기록"
						icon={Library}
						onPress={handlePressFellowshipList}
					/>

					{isLeader && (
						<>
							<Divider />
							<BottomSheetListItem
								label="소그룹 관리하기"
								icon={Settings}
								onPress={handlePressManageMember}
							/>
						</>
					)}
				</BottomSheetListLayout>
			</MenuBottomSheetContainer>

			{/* Group Members Bottom Sheet */}
			<MemberBottomSheetContainer>
				<VStack space="md" className="px-6 py-2">
					<BottomSheetListHeader
						label="그룹원 목록"
						onPress={handleCloseMember}
					/>

					{/* Group Members List */}
					<View className="pb-5">
						{group?.members && group.members.length > 0 ? (
							<ScrollView style={{ maxHeight: MAX_INNER_MEMBER_LIST_HEIGHT }}>
								<VStack space="md">
									{group.members.map((member) => (
										<View key={member.id} className="bg-white rounded-xl py-4">
											<HStack className="items-center justify-between">
												<HStack space="md" className="items-center">
													<Avatar
														size="sm"
														photoUrl={member.photoUrl ?? undefined}
													/>
													<VStack>
														<Text
															size="lg"
															className="font-pretendard-semi-bold"
														>
															{member.displayName || '이름없음'}
														</Text>
													</VStack>
													<Box
														className={cn(
															'px-2 rounded-full py-1',
															member.role === 'leader'
																? 'bg-primary-400'
																: 'bg-gray-500',
														)}
													>
														<Text size="xs" className="text-typography-50">
															{member.role === 'leader' ? '리더' : '그룹원'}
														</Text>
													</Box>
												</HStack>
											</HStack>
										</View>
									))}
								</VStack>
							</ScrollView>
						) : (
							<Text className="text-center py-4">그룹원이 없어요.</Text>
						)}
					</View>
					<HStack space="md" className="w-full py-4">
						<Button
							size="lg"
							variant="outline"
							className="flex-1"
							rounded
							onPress={() =>
								handlePressGroupMemberList('Group_Member_List_Bottom_Sheet')
							}
						>
							<ButtonText>그룹원 더보기</ButtonText>
							<ButtonIcon as={ChevronRight} />
						</Button>
					</HStack>
				</VStack>
			</MemberBottomSheetContainer>
		</HStack>
	);
}

export default HomeHeader;
