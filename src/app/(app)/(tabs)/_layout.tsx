import React from 'react';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/common/HapticTab';
import { Colors } from '@/constants/Colors';
import { Icon } from '#/components/ui/icon';
import { Bell, HouseIcon, NotebookPen, Ellipsis } from 'lucide-react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
	const colorScheme = useColorScheme();
	return (
		<Tabs
			screenOptions={({ route }) => ({
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarStyle: [
					{
						paddingLeft: 14,
						paddingRight: 14,
					},
				],
				sceneStyle: { backgroundColor: 'transparent' },
			})}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: '나의 소그룹',
					tabBarIcon: ({ color }) => (
						<Icon size="xl" as={HouseIcon} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="note"
				options={{
					title: '설교 노트',
					tabBarIcon: ({ color }) => (
						<Icon size="xl" as={NotebookPen} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="notification"
				options={{
					title: '알림',
					tabBarIcon: ({ color }) => <Icon size="xl" as={Bell} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="more"
				options={{
					title: '더보기',
					tabBarIcon: ({ color }) => (
						<Icon size="xl" as={Ellipsis} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
