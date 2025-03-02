import { Stack } from 'expo-router';

export default function HomeLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: 'transparent' },
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="group/[id]" />
			<Stack.Screen name="group/create" />
		</Stack>
	);
}
