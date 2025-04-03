import { updateUser } from '@/api/user';
import type { UserGroup } from '@/shared/types';
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
		id: string;
		name: string;
		group: UserGroup | null;
	};
	setStep: (step: OnboardingStep) => void;
	setOnboarding: (id: string) => void;
	updateUserData: (data: Partial<OnboardingState['userData']>) => void;
	completeOnboarding: () => Promise<void>;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
	currentStep: DEFAULT_STEP,
	userData: {
		id: '',
		name: '',
		group: null,
	},
	setStep: (step) => set({ currentStep: step }),
	setOnboarding: (id: string) =>
		set((state) => ({
			currentStep: 'NAME',
			userData: { ...state.userData, id },
		})),
	updateUserData: (data) =>
		set((state) => ({
			userData: { ...state.userData, ...data },
		})),
	completeOnboarding: async () => {
		const { id, name, group } = get().userData;
		try {
			await updateUser(id, {
				displayName: name,
				groups: group ? [group] : [],
			});
		} catch (error) {
		} finally {
			set({
				currentStep: DEFAULT_STEP,
				userData: { id: '', name: '', group: null },
			});
			router.replace('/(app)');
		}
	},
}));
