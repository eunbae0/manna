import { handleApiError } from '@/api';
import { updateUser } from '@/api/user';
import { router } from 'expo-router';
import { create } from 'zustand';

const DEFAULT_STEP: OnboardingStep = 'NAME';

export type OnboardingStep =
	| 'EMAIL_SIGN_IN'
	| 'EMAIL_SIGN_UP'
	| 'NAME'
	| 'IMAGE'
	| 'GROUP_LANDING'
	| 'GROUP_CREATE'
	| 'GROUP_JOIN'
	| 'PENDING_SUBMIT'
	| 'FINISH';

export type OnboardingState = {
	currentStep: OnboardingStep;
	userData: {
		displayName: string;
		photoUrl: string | null;
	};
	isPendingCompleteOnboarding: boolean;
	setStep: (step: OnboardingStep) => void;
	setOnboarding: () => void;
	updateUserData: (data: Partial<OnboardingState['userData']>) => void;
	submitOnboardingData: (id: string) => Promise<void>;
	completeOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
	currentStep: DEFAULT_STEP,
	userData: {
		displayName: '',
		photoUrl: null,
	},
	isPendingCompleteOnboarding: true,
	setStep: (step) => set({ currentStep: step }),
	setOnboarding: () =>
		set({
			currentStep: 'NAME',
		}),
	updateUserData: (data) =>
		set((state) => ({
			userData: { ...state.userData, ...data },
		})),
	submitOnboardingData: async (id: string) => {
		const { displayName, photoUrl } = get().userData;
		try {
			set({ currentStep: 'PENDING_SUBMIT' });
			await updateUser(id, {
				displayName,
				photoUrl,
			});
		} catch (error) {
			throw handleApiError(error);
		} finally {
			set({ isPendingCompleteOnboarding: false });
		}
	},
	completeOnboarding: () => {
		set({
			currentStep: DEFAULT_STEP,
			userData: { displayName: '', photoUrl: null },
			isPendingCompleteOnboarding: true,
		});
		router.replace('/(app)');
	},
}));
