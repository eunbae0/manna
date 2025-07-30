import { Stack } from 'expo-router';

export default function GroupLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: 'white' },
			}}
		>
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="(manage-group)" />
			<Stack.Screen name="group-selection" />
			<Stack.Screen name="join-group" />
			<Stack.Screen name="create-group" />
			<Stack.Screen name="cover-images-management" />
			<Stack.Screen name="group-invited" />
		</Stack>
	);
}
