import { Stack } from 'expo-router';

export default function GroupLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: 'white' },
			}}
		>
			<Stack.Screen name="create-group" />
			<Stack.Screen name="join-group" />
			<Stack.Screen name="manage-group" />
		</Stack>
	);
}
