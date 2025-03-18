import type { User } from '@/types/user';
import { router } from 'expo-router';
import { create } from 'zustand';

export type Fellowship = {
	info: {
		date: Date;
		preachTitle: FellowshipInfoField;
		preacher: FellowshipInfoField;
		preachText: FellowshipInfoField;
		members: FellowshipMember[];
	};
	content: {
		iceBreaking: FellowshipContentField[];
		sermonTopic: FellowshipContentField[];
		prayerRequest: FellowshipAnswerField[];
	};
};

export type FellowShipStoreData = {
	info: {
		date: Date | null;
		preachTitle: FellowshipInfoField;
		preacher: FellowshipInfoField;
		preachText: FellowshipInfoField;
		members: FellowshipMember[];
	};
	content: {
		iceBreaking: string[];
		sermonTopic: string[];
		prayerRequest: boolean;
	};
};

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

export type FellowshipInfoField = { value?: string; disabled: boolean };
export type FellowshipContentField = {
	id: string;
	question: string;
	answers: FellowshipAnswerField[];
};
export type FellowshipAnswerField = {
	member: FellowshipMember;
	value: string;
};

export const FELLOWSHIP_DEFAULT_STEP: FellowshipStep = 'INFO';

type FellowShipStoreState = FellowShipStoreData & {
	currentStep: FellowshipStep;
	setStep: (step: FellowshipStep) => void;
	updateFellowshipInfo: (data: Partial<FellowShipStoreState['info']>) => void;
	updateFellowshipContent: (
		data: Partial<FellowShipStoreState['content']>,
	) => void;
	completeFellowship: () => void;
	clearFellowship: () => void;
};

export const useFellowshipStore = create<FellowShipStoreState>((set, get) => ({
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
