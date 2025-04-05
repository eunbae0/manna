import { handleApiError } from '@/api';
import { updateUser } from '@/api/user';
import { router } from 'expo-router';
import { create } from 'zustand';

const DEFAULT_STEP: OnboardingStep = 'NAME';

export type OnboardingStep =
	| 'EMAIL_SIGN_IN'
	| 'EMAIL_SIGN_UP'
	| 'NAME'
	| 'GROUP_LANDING'
	| 'GROUP_CREATE'
	| 'GROUP_JOIN';

type OnboardingState = {
	currentStep: OnboardingStep;
	userData: {
		displayName: string;
	};
	setStep: (step: OnboardingStep) => void;
	setOnboarding: () => void;
	updateUserData: (data: Partial<OnboardingState['userData']>) => void;
	completeOnboarding: (id: string) => Promise<void>;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
	currentStep: DEFAULT_STEP,
	userData: {
		displayName: '',
	},
	setStep: (step) => set({ currentStep: step }),
	setOnboarding: () =>
		set({
			currentStep: 'NAME',
		}),
	updateUserData: (data) =>
		set((state) => ({
			userData: { ...state.userData, ...data },
		})),
	completeOnboarding: async (id: string) => {
		const { displayName } = get().userData;
		console.log(displayName);
		try {
			await updateUser(id, {
				displayName,
			});
		} catch (error) {
			throw handleApiError(error);
		} finally {
			set({
				currentStep: DEFAULT_STEP,
				userData: { displayName: '' },
			});
			router.replace('/(app)');
		}
	},
}));
