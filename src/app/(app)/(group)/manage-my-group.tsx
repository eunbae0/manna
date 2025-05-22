import { useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useGroups } from '@/features/home/group/hooks/useGroups';
import { useLeaveGroup } from '@/features/home/group/hooks/useLeaveGroup';
import Header from '@/components/common/Header';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { Heading } from '@/shared/components/heading';
import { Box } from '#/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { LogOut, UserPlus, Users, Settings } from 'lucide-react-native';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import type { ClientGroup } from '@/api/group/types';
import type { UserGroup } from '@/shared/types';
import { useToastStore } from '@/store/toast';
import { GROUPS_CREATE_LIMIT } from '@/shared/constants';

export default function ManageMyGroupScreen() {
	const { user, updateAllUserGroupProfile } = useAuthStore();

	const [refreshing, setRefreshing] = useState(false);

	const { groups, isLoading, refetch } = useGroups(user?.groups ?? []);

	const { leaveGroup, isLeaving } = useLeaveGroup();

	const { showInfo } = useToastStore();

	const handleRefresh = async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	};

	const handleCreateGroup = () => {
		if (groups.length >= GROUPS_CREATE_LIMIT) {
			showInfo(
				'더 생성하고 싶다면 기존 그룹을 삭제해주세요',
				'더 이상 그룹을 생성할 수 없어요',
			);
			return;
		}
		router.push('/(app)/(group)/create-group');
	};

	const handleJoinGroup = () => {
		if (groups.length >= GROUPS_CREATE_LIMIT) {
			showInfo(
				'더 생성하고 싶다면 기존 그룹을 삭제해주세요',
				'더 이상 그룹을 생성할 수 없어요',
			);
			return;
		}
		router.push('/(app)/(group)/join-group');
	};

	const handleManageGroup = (groupId: string) => {
		router.push({
			pathname: '/(app)/(group)/(manage-group)/manage-group-index',
			params: { groupId },
		});
	};

	const handleLeaveGroup = (group: ClientGroup) => {
		// Check if user is the leader of the group
		const userMember = group.members.find((m) => m.id === user?.id);
		const isLeader = userMember?.role === 'leader';

		if (isLeader) {
			Alert.alert(
				'그룹장은 나갈 수 없어요',
				'그룹장은 그룹을 나갈 수 없어요. 다른 멤버에게 그룹장 권한을 넘기거나 그룹을 삭제해주세요.',
				[{ text: '확인', style: 'default' }],
				{ cancelable: true },
			);
			return;
		}

		Alert.alert(
			'그룹 나가기',
			`정말 ${group.groupName} 그룹을 나갈까요?`,
			[
				{ text: '취소', style: 'cancel' },
				{
					text: '나가기',
					style: 'destructive',
					onPress: () => leaveGroup(group),
				},
			],
			{ cancelable: true },
		);
	};

	const renderGroupItem = ({ item }: { item: ClientGroup }) => {
		const userMember = item.members.find((m) => m.id === user?.id);
		const isLeader = userMember?.role === 'leader';
		const role = isLeader ? '그룹장' : '멤버';
		// 대표 그룹 여부
		const isMain = user?.groups?.find((g) => g.groupId === item.id)?.isMain;

		const handleSetMainGroup = async () => {
			if (!user || !user.groups) return;
			const updatedGroups: UserGroup[] = user.groups.map((g) => ({
				...g,
				isMain: g.groupId === item.id,
			}));

			await updateAllUserGroupProfile(user.id, updatedGroups);
		};

		return (
			<Box className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
				<VStack space="md">
					<HStack className="justify-between items-center">
						<HStack space="sm" className="items-center">
							<Heading size="lg">{item.groupName}</Heading>
							{isMain && (
								<Box className="bg-primary-100 px-2 py-1 rounded-md ml-2">
									<Text size="xs" className="text-primary-700 font-semibold">
										대표 그룹
									</Text>
								</Box>
							)}
						</HStack>
						<Text
							size="sm"
							className={
								isLeader
									? 'text-primary-600 font-semibold'
									: 'text-typography-500'
							}
						>
							{role}
						</Text>
					</HStack>

					<HStack className="justify-between items-center">
						<Text size="sm" className="text-typography-600">
							멤버 {item.members.length}명
						</Text>

						<HStack space="sm">
							{!isMain && (
								<Button
									variant="outline"
									action="primary"
									size="sm"
									onPress={handleSetMainGroup}
									rounded
								>
									<ButtonText>대표 그룹 지정</ButtonText>
								</Button>
							)}
							{isLeader ? (
								<Button
									variant="outline"
									action="primary"
									size="sm"
									onPress={() => handleManageGroup(item.id)}
									rounded
								>
									<ButtonIcon as={Settings} />
									<ButtonText>그룹 관리</ButtonText>
								</Button>
							) : (
								<Button
									variant="outline"
									action="negative"
									size="sm"
									onPress={() => handleLeaveGroup(item)}
									disabled={isLeaving}
									rounded
								>
									<ButtonIcon as={LogOut} />
									<ButtonText>나가기</ButtonText>
								</Button>
							)}
						</HStack>
					</HStack>
				</VStack>
			</Box>
		);
	};

	return (
		<SafeAreaView className="h-full bg-background-50">
			<KeyboardDismissView>
				<Header label="내 그룹 관리" />
				<VStack space="xl" className="flex-1 px-4 py-4">
					{/* 그룹 생성 및 참여 버튼 */}
					<HStack space="sm" className="mb-4">
						<Button
							variant="solid"
							action="primary"
							size="md"
							onPress={handleCreateGroup}
							className="flex-1"
						>
							<ButtonIcon as={Users} />
							<ButtonText>새 그룹 생성하기</ButtonText>
						</Button>

						<Button
							variant="outline"
							action="primary"
							size="md"
							onPress={handleJoinGroup}
							className="flex-1"
						>
							<ButtonIcon as={UserPlus} />
							<ButtonText>새 그룹 참여하기</ButtonText>
						</Button>
					</HStack>

					<VStack space="xl">
						<Heading size="xl">내 그룹 목록</Heading>
						{groups.length === 0 ? (
							<VStack className="items-center justify-center flex-1">
								<Text className="text-typography-500">
									참여 중인 그룹이 없어요
								</Text>
							</VStack>
						) : (
							<FlatList
								data={groups}
								renderItem={renderGroupItem}
								keyExtractor={(item) => item.id}
								style={{ height: '100%' }}
								contentContainerStyle={{ paddingBottom: 20 }}
								showsVerticalScrollIndicator={false}
								refreshControl={
									<RefreshControl
										refreshing={refreshing}
										onRefresh={handleRefresh}
										tintColor="#362303"
										title="새로고침 중..."
										titleColor="#362303"
									/>
								}
							/>
						)}
					</VStack>
				</VStack>
			</KeyboardDismissView>
		</SafeAreaView>
	);
}
