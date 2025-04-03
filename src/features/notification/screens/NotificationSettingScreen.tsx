import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import Header from '@/components/common/Header';
import { NotificationSettingItem } from '../components/NotificationSettingItem';
import { Pressable, View } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useGroups } from '@/features/home/group/hooks/useGroups';
import type { ClientGroup } from '@/api/group/types';
import { cn } from '@/shared/utils/cn';

type TabType = Pick<ClientGroup, 'id' | 'groupName'>;

export default function NotificationSettingScreen() {
	const { user, currentGroup, updateCurrentGroup } = useAuthStore();

	const { groups, isLoading, error } = useGroups(
		user?.groups?.map((g) => g.groupId) ?? [],
	);

	// 그룹별 탭 생성
	const allTabs = groups.map((g) => ({ id: g.id, groupName: g.groupName }));
	const [selectedTab, setSelectedTab] = useState<TabType>(allTabs[0] || {});

	// 그룹별 알림 설정 상태 관리
	const [notificationSettings, setNotificationSettings] = useState<
		Record<
			string,
			{
				prayerRequest: boolean;
				fellowship: boolean;
			}
		>
	>({});

	// 초기 탭 선택
	useEffect(() => {
		if (groups.length > 0 && !selectedTab) {
			setSelectedTab(groups[0]);
		}
	}, [groups, selectedTab]);

	useEffect(() => {
		if (groups.length > 0) {
			const initialSettings: Record<
				string,
				{ prayerRequest: boolean; fellowship: boolean }
			> = {};

			for (const group of groups) {
				// 해당 그룹에 대한 사용자 설정 찾기
				const userGroupSettings = user?.groups?.find(
					(g) => g.groupId === group.id,
				);

				initialSettings[group.groupName] = {
					prayerRequest:
						userGroupSettings?.notificationPreferences?.prayerRequest ?? true,
					fellowship:
						userGroupSettings?.notificationPreferences?.fellowship ?? true,
				};
			}

			setNotificationSettings(initialSettings);
		}
	}, [groups, user?.groups]);

	// 알림 설정 변경 함수
	const handleNotificationChange = (
		groupName: string,
		type: 'prayerRequest' | 'fellowship',
		value: boolean,
	) => {
		// 상태 업데이트
		setNotificationSettings((prev) => ({
			...prev,
			[groupName]: {
				...prev[groupName],
				[type]: value,
			},
		}));

		// 해당 그룹 ID 찾기
		const group = groups.find((g) => g.groupName === groupName);
		if (group && currentGroup?.groupId === group.id) {
			// 현재 그룹이면 업데이트
			updateCurrentGroup({
				...currentGroup,
				notificationPreferences: {
					fellowship:
						type === 'fellowship'
							? value
							: (currentGroup.notificationPreferences?.fellowship ?? true),
					prayerRequest:
						type === 'prayerRequest'
							? value
							: (currentGroup.notificationPreferences?.prayerRequest ?? true),
				},
			});
		}

		// TODO: 서버에 알림 설정 업데이트 저장 로직 추가 필요
	};

	const renderSettingItems = () => {
		if (isLoading) {
			return (
				<VStack space="4xl" className="items-center justify-center py-10">
					<Text>로딩중...</Text>
				</VStack>
			);
		}

		if (error) {
			return (
				<VStack space="4xl" className="items-center justify-center py-10">
					<Text className="text-red-500">
						오류가 발생했어요. 다시 시도해주세요.
					</Text>
				</VStack>
			);
		}

		// 특정 그룹 탭일 경우 해당 그룹의 설정만 표시
		const selectedGroup = groups.find((g) => g.id === selectedTab.id);
		if (selectedGroup) {
			return (
				<VStack space="4xl" className="px-6">
					<NotificationSettingItem
						title="기도 제목 알림"
						description="기도 제목이 등록된 경우 알림"
						enabled={
							notificationSettings[selectedGroup.groupName]?.prayerRequest ??
							true
						}
						onValueChange={(value) =>
							handleNotificationChange(
								selectedGroup.groupName,
								'prayerRequest',
								value,
							)
						}
					/>
					<NotificationSettingItem
						title="나눔 알림"
						description="나눔이 등록된 경우 알림"
						enabled={
							notificationSettings[selectedGroup.groupName]?.fellowship ?? true
						}
						onValueChange={(value) =>
							handleNotificationChange(
								selectedGroup.groupName,
								'fellowship',
								value,
							)
						}
					/>
				</VStack>
			);
		}

		return null;
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<Header label="알림 설정" />
			<VStack className="py-6">
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="mb-8 border-b border-gray-300"
				>
					<HStack className="px-6">
						{allTabs.map((tab) => (
							<Pressable key={tab.id} onPress={() => setSelectedTab(tab)}>
								<VStack className="items-center">
									<Text
										size="xl"
										className={cn(
											selectedTab.id === tab.id
												? 'font-pretendard-bold text-primary-500'
												: 'text-typography-500',
											'py-2 px-3',
										)}
									>
										{tab.groupName}
									</Text>
									<View
										className={cn(
											'w-full h-0.5',
											selectedTab.id === tab.id
												? 'bg-primary-500'
												: 'bg-transparent',
										)}
									/>
								</VStack>
							</Pressable>
						))}
					</HStack>
				</ScrollView>
				{renderSettingItems()}
			</VStack>
		</SafeAreaView>
	);
}
