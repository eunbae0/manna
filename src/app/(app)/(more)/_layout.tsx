import { Stack } from 'expo-router';

export default function HomeLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: 'white' },
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="screen" />
			<Stack.Screen name="notification" />
			<Stack.Screen name="account" />
			<Stack.Screen name="policy" />
		</Stack>
	);
}
