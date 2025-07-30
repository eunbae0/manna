import { handleApiError } from '@/api';
import { updateUser } from '@/api/user';
import { routingToHome } from '@/shared/utils/router';
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
	isOnboarding: boolean;
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
	isOnboarding: true,
	setStep: (step) => set({ currentStep: step }),
	setOnboarding: () =>
		set({
			currentStep: 'NAME',
			isOnboarding: true,
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
			set({ isOnboarding: false });
		}
	},
	completeOnboarding: () => {
		set({
			currentStep: DEFAULT_STEP,
			userData: { displayName: '', photoUrl: null },
			isOnboarding: false,
		});
		routingToHome();
	},
}));
