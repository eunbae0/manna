import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAuthStore } from '@/store/auth';
import { Stack } from 'expo-router';

export default function AuthLayout() {
	const { error, clearError } = useAuthStore();

	useErrorHandler(error, clearError, {
		logPrefix: 'Auth Error',
		context: { component: 'AuthLayout' },
		includeStack: false,
	});
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="onboarding" />
		</Stack>
	);
}
