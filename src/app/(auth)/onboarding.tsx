import { Animated } from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type OnboardingStep, useOnboardingStore } from '@/store/onboarding';

import EmailSignInStepScreen from '@/features/onboarding/screens/EmailSignInStepScreen';
import GroupStepScreen from '@/features/onboarding/screens/GroupStepScreen';
import NameStepScreen from '@/features/onboarding/screens/NameStepScreen';
import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';
import CreateGroupContainerScreen from '@/features/group/screens/create-group/CreateGroupContainerScreen';
import JoinGroupScreen from '@/features/group/screens/join-group/JoinGroupScreen';
import EmailSignUpScreen from '@/features/onboarding/screens/EmailSignUpScreen';
import ImageStepScreen from '@/features/onboarding/screens/ImageStepScreen';
import PendingSubmitScreen from '@/features/onboarding/screens/PendingSubmitScreen';
import FinishStepScreen from '@/features/onboarding/screens/FinishStepScreen';

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
			case 'IMAGE':
				return <ImageStepScreen />;
			case 'GROUP_LANDING':
				return <GroupStepScreen />;
			case 'GROUP_CREATE':
				return <CreateGroupContainerScreen />;
			case 'GROUP_JOIN':
				return <JoinGroupScreen />;
			case 'PENDING_SUBMIT':
				return <PendingSubmitScreen />;
			case 'FINISH':
				return <FinishStepScreen />;
			default:
				return <Redirect href="/+not-found" />;
		}
	};

	return (
		<SafeAreaView className="bg-white h-full">
			<KeyboardAvoidingView>{switchStep(currentStep)}</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

export default OnboardingScreen;
