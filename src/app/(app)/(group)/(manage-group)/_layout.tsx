import { Stack } from 'expo-router';

export default function GroupLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: 'white' },
			}}
			initialRouteName="manage-group-index"
		>
			<Stack.Screen name="manage-group-index" />
			<Stack.Screen name="manage-member" />
		</Stack>
	);
}
