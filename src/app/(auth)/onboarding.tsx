import { Animated } from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type OnboardingStep, useOnboardingStore } from '@/store/onboarding';

import EmailSignInStepScreen from '@/features/onboarding/screens/EmailSignInStepScreen';
import GroupStepScreen from '@/features/onboarding/screens/GroupStepScreen';
import NameStepScreen from '@/features/onboarding/screens/NameStepScreen';

function OnboardingScreen() {
	const { currentStep } = useOnboardingStore();

	const switchStep = (step: OnboardingStep) => {
		switch (step) {
			case 'EMAIL':
				return <EmailSignInStepScreen />;
			case 'NAME':
				return <NameStepScreen />;
			case 'GROUP':
				return <GroupStepScreen />;
			default:
				return <Redirect href="/+not-found" />;
		}
	};
	return (
		<SafeAreaView>
			<Animated.View
			// style={{ transform: [{ translateX: slideAnim }] }}
			>
				{switchStep(currentStep)}
			</Animated.View>
		</SafeAreaView>
	);
}

export default OnboardingScreen;
