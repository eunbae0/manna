import { updateUser } from '@/api/auth';
import type { ClientUser } from '@/api/auth/types';
import { router } from 'expo-router';
import { create } from 'zustand';

const DEFAULT_STEP: OnboardingStep = 'NAME';

export type OnboardingStep =
	| 'EMAIL'
	| 'NAME'
	| 'GROUP_LANDING'
	| 'GROUP_CREATE'
	| 'GROUP_JOIN';

type OnboardingState = {
	currentStep: OnboardingStep;
	userData: {
		id: string;
		name: string;
		group: string;
	};
	setStep: (step: OnboardingStep) => void;
	updateUserData: (data: Partial<OnboardingState['userData']>) => void;
	completeOnboarding: (groups: ClientUser['groups']) => void;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
	currentStep: DEFAULT_STEP,
	userData: {
		id: '',
		name: '',
		group: '',
	},
	setStep: (step) => set({ currentStep: step }),
	updateUserData: (data) =>
		set((state) => ({
			userData: { ...state.userData, ...data },
		})),
	completeOnboarding: async (groups: ClientUser['groups']) => {
		try {
			await updateUser(get().userData.id, {
				displayName: get().userData.name,
				groups,
			});
		} catch (error) {
		} finally {
			set({ currentStep: DEFAULT_STEP });
			router.replace('/(app)');
		}
	},
}));
