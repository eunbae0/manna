import { Stack } from 'expo-router';

export default function HomeLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: 'white' },
			}}
		>
			<Stack.Screen name="screen" />
			<Stack.Screen name="account" />
			<Stack.Screen name="support" />
			<Stack.Screen name="(feedback)" />
			<Stack.Screen name="notice" />
			<Stack.Screen name="update-note" />
		</Stack>
	);
}
