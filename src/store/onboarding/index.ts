import { router } from 'expo-router';
import { create } from 'zustand';

export type OnboardingStep = 'EMAIL_SIGNUP' | 'EMAIL_SIGNIN' | 'NAME' | 'GROUP';

type OnboardingState = {
	currentStep: OnboardingStep;
	userData: {
		name: string;
		group: string;
	};
	setStep: (step: OnboardingStep) => void;
	updateUserData: (data: Partial<OnboardingState['userData']>) => void;
	completeOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
	currentStep: 'NAME',
	userData: {
		name: '',
		group: '',
	},
	setStep: (step) => set({ currentStep: step }),
	updateUserData: (data) =>
		set((state) => ({
			userData: { ...state.userData, ...data },
		})),
	completeOnboarding: () => {
		set({ currentStep: 'NAME' });
		router.replace('/');
	},
}));
