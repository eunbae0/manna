import { Stack } from 'expo-router';

export default function HomeLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				// contentStyle: { backgroundColor: 'transparent' },
			}}
		>
			<Stack.Screen name="create" />
			<Stack.Screen name="[id]" />
		</Stack>
	);
}
