import { updateFirestoreUser } from '@/services/auth';
import { router } from 'expo-router';
import { create } from 'zustand';

export type OnboardingStep = 'EMAIL_SIGNUP' | 'EMAIL_SIGNIN' | 'NAME' | 'GROUP';

type OnboardingState = {
	currentStep: OnboardingStep;
	userData: {
		uid: string;
		name: string;
		group: string;
	};
	setStep: (step: OnboardingStep) => void;
	updateUserData: (data: Partial<OnboardingState['userData']>) => void;
	completeOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
	currentStep: 'NAME',
	userData: {
		uid: '',
		name: '',
		group: '',
	},
	setStep: (step) => set({ currentStep: step }),
	updateUserData: (data) =>
		set((state) => ({
			userData: { ...state.userData, ...data },
		})),
	completeOnboarding: async () => {
		try {
			await updateFirestoreUser(get().userData.uid, {
				displayName: get().userData.name,
			});
		} catch (error) {
		} finally {
			set({ currentStep: 'NAME' });
			router.replace('/(auth)');
		}
	},
}));
