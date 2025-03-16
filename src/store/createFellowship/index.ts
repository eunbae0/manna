import { updateFirestoreUser } from '@/api/auth';
import type { User } from '@/types/user';
import { router } from 'expo-router';
import { create } from 'zustand';

export type FellowshipStep =
	| 'INFO'
	| 'CONTENT'
	| 'CONTENT_ICEBREAKING'
	| 'CONTENT_SERMON';

export type FellowshipMember = Partial<
	Pick<User, 'id' | 'displayName' | 'photoUrl'>
> & {
	isLeader: boolean;
};

export type FellowshipField = { value?: string; disabled: boolean };

export const FELLOWSHIP_DEFAULT_STEP: FellowshipStep = 'INFO';

type FellowshipState = {
	currentStep: FellowshipStep;
	info: {
		date: Date | null;
		preachTitle: FellowshipField;
		preacher: FellowshipField;
		preachText: FellowshipField;
		members: FellowshipMember[];
	};
	content: {
		iceBreaking: string[];
		sermonTopic: string[];
		prayerRequest: boolean;
	};
	setStep: (step: FellowshipStep) => void;
	updateFellowshipInfo: (data: Partial<FellowshipState['info']>) => void;
	updateFellowshipContent: (data: Partial<FellowshipState['content']>) => void;
	completeFellowship: () => void;
	clearFellowship: () => void;
};

export const useFellowshipStore = create<FellowshipState>((set, get) => ({
	currentStep: FELLOWSHIP_DEFAULT_STEP,
	info: {
		date: null,
		preachTitle: { disabled: false, value: '' },
		preacher: { disabled: false, value: '' },
		preachText: { disabled: false, value: '' },
		members: [],
	},
	content: {
		iceBreaking: [],
		sermonTopic: [],
		prayerRequest: true,
	},
	setStep: (step) => set({ currentStep: step }),
	updateFellowshipInfo: (data) =>
		set((state) => ({
			info: { ...state.info, ...data },
		})),
	updateFellowshipContent: (data) =>
		set((state) => ({
			content: { ...state.content, ...data },
		})),
	completeFellowship: async () => {
		get().clearFellowship();
		set({ currentStep: FELLOWSHIP_DEFAULT_STEP });
		router.replace('/(app)/(fellowship)/[id]');
	},
	clearFellowship: () => {
		set({
			info: {
				date: null,
				preachTitle: { disabled: false, value: '' },
				preacher: { disabled: false, value: '' },
				preachText: { disabled: false, value: '' },
				members: [],
			},
			content: {
				iceBreaking: [],
				sermonTopic: [],
				prayerRequest: true,
			},
		});
	},
}));
