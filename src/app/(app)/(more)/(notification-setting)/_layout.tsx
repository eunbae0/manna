import { Stack } from 'expo-router';

export default function NotificationSettingLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: 'white' },
			}}
			initialRouteName="setting-index"
		>
			<Stack.Screen name="setting-index" />
			<Stack.Screen name="board" />
		</Stack>
	);
}
