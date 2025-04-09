import { Pressable, View } from 'react-native';
import { useState } from 'react';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Heading } from '#/components/ui/heading';
import { Icon } from '#/components/ui/icon';
import * as Clipboard from 'expo-clipboard';
import {
	ChevronDown,
	MenuIcon,
	HandHelping,
	Library,
	Settings,
	SettingsIcon,
	Copy,
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
import { useToastStore } from '@/store/toast';
import { router } from 'expo-router';
import { Box } from '#/components/ui/box';
import { cn } from '@/shared/utils/cn';

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
	const { showToast } = useToastStore();

	const group = groups.find((group) => group.id === currentGroup?.groupId);

	const handlePressPrayerRequestList = () => {
		router.push('/(app)/(prayerRequest)/list');
		handleCloseMenu();
	};

	const handlePressFellowshipList = () => {
		router.push('/(app)/(fellowship)/list');
		handleCloseMenu();
	};

	const handlePressMemberGroup = () => {
		setIsExpanded((prev) => !prev);
		handleOpenMember();
	};

	const handleCopyInviteCode = async () => {
		if (group?.inviteCode) {
			try {
				await Clipboard.setStringAsync(group.inviteCode);
				showToast({
					title: '성공',
					message: '초대 코드가 클립보드에 복사되었습니다.',
					type: 'success',
				});
			} catch (error) {
				showToast({
					title: '오류',
					message: '초대 코드 복사에 실패했습니다. 직접 코드를 입력해주세요.',
					type: 'error',
				});
				console.error('Clipboard error:', error);
			}
		}
	};

	const handlePressManageMember = () => {
		router.push('/(app)/(group)/(manage-group)');
		handleCloseMenu();
	};

	const isLeader =
		group?.members?.find((m) => m.id === user?.id)?.role === 'leader';

	const handlePressManageMyGroup = () => {
		router.push('/(app)/(group)/manage-my-group');
		handleCloseMenu();
	};

	return (
		<HStack className="items-center justify-between pt-2 pl-4 pr-3">
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

				<Button size="xl" variant="icon" onPress={() => handleOpenMenu()}>
					<ButtonIcon as={MenuIcon} />
				</Button>
			</HStack>
			<MenuBottomSheetContainer>
				<BottomSheetListLayout>
					<BottomSheetListHeader
						label="소그룹 메뉴"
						onPress={handleCloseMenu}
					/>
					<BottomSheetListItem
						label="기도 제목 모아보기"
						icon={HandHelping}
						onPress={handlePressPrayerRequestList}
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
					<VStack space="md" className="pb-5">
						{group?.members && group.members.length > 0 ? (
							group.members.map((member) => (
								<View key={member.id} className="bg-white rounded-xl py-4">
									<HStack className="items-center justify-between">
										<HStack space="md" className="items-center">
											<Avatar
												size="sm"
												photoUrl={member.photoUrl || undefined}
											/>
											<VStack>
												<Text size="lg" className="font-pretendard-semi-bold">
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
							))
						) : (
							<Text className="text-center py-4">그룹원이 없습니다.</Text>
						)}
					</VStack>
					<VStack space="md" className="py-2">
						<Text size="sm">
							아래 코드를 공유하여 새로운 그룹원을 초대해보세요
						</Text>

						<HStack className="items-center justify-between bg-gray-100 rounded-lg p-4">
							<Text size="lg" className="font-pretendard-semi-bold">
								{group?.inviteCode}
							</Text>
							<Pressable onPress={handleCopyInviteCode} className="p-2">
								<Icon as={Copy} size="md" className="stroke-primary-500" />
							</Pressable>
						</HStack>
					</VStack>
					{/* Action Buttons */}
					<HStack space="md" className="w-full py-2">
						<Button
							size="lg"
							variant="solid"
							className="flex-1"
							rounded
							onPress={handleCopyInviteCode}
						>
							<ButtonText>초대링크 복사하기</ButtonText>
						</Button>
					</HStack>
				</VStack>
			</MemberBottomSheetContainer>
		</HStack>
	);
}

export default HomeHeader;
