import { Stack } from 'expo-router';

export default function HomeLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: 'white' },
			}}
			initialRouteName="board-index"
		>
			<Stack.Screen name="board-index" />
			<Stack.Screen name="create" />
			<Stack.Screen name="[id]" />
		</Stack>
	);
}
