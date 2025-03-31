import { Animated } from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type OnboardingStep, useOnboardingStore } from '@/store/onboarding';

import EmailSignInStepScreen from '@/features/onboarding/screens/EmailSignInStepScreen';
import GroupStepScreen from '@/features/onboarding/screens/GroupStepScreen';
import NameStepScreen from '@/features/onboarding/screens/NameStepScreen';
import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';
import CreateGroupContainerScreen from '@/features/home/group/screens/create-group/CreateGroupContainerScreen';
import JoinGroupScreen from '@/features/home/group/screens/join-group/JoinGroupScreen';
import EmailSignUpScreen from '@/features/onboarding/screens/EmailSignUpScreen';

function OnboardingScreen() {
	const { currentStep } = useOnboardingStore();

	const switchStep = (step: OnboardingStep) => {
		switch (step) {
			case 'EMAIL_SIGN_IN':
				return <EmailSignInStepScreen />;
			case 'EMAIL_SIGN_UP':
				return <EmailSignUpScreen />;
			case 'NAME':
				return <NameStepScreen />;
			case 'GROUP_LANDING':
				return <GroupStepScreen />;
			case 'GROUP_CREATE':
				return <CreateGroupContainerScreen />;
			case 'GROUP_JOIN':
				return <JoinGroupScreen />;
			default:
				return <Redirect href="/+not-found" />;
		}
	};
	return (
		<SafeAreaView className="flex-1">
			<KeyboardAvoidingView>{switchStep(currentStep)}</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

export default OnboardingScreen;
