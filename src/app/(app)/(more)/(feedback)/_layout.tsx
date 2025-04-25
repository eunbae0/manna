import { Stack } from 'expo-router';

export default function FeedbackLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: 'white' },
			}}
			initialRouteName="feedback-index"
		>
			<Stack.Screen name="feedback-index" />
			<Stack.Screen name="[id]" />
		</Stack>
	);
}
