import { createFellowship, updateFellowship } from '@/api/fellowship';
import type { ClientFellowship } from '@/api/fellowship/types';
import { router } from 'expo-router';
import { create } from 'zustand';
import type {
	FellowShipStoreData,
	FellowshipStoreStep,
	FellowshipStoreType,
} from './types';

export const FELLOWSHIP_DEFAULT_STEP: FellowshipStoreStep = 'INFO';

type FellowShipStoreState = FellowShipStoreData & {
	currentStep: FellowshipStoreStep;
	type: FellowshipStoreType;
	fellowshipId?: string | null;
	lastUpdatedId?: string | null;
	setStep: (step: FellowshipStoreStep) => void;
	setType: (type: FellowshipStoreType) => void;
	setFellowshipId: (fellowshipId: string | null) => void;
	getLastUpdatedIdAndReset: () => string | null;
	updateFellowshipInfo: (data: Partial<FellowShipStoreState['info']>) => void;
	updateFellowshipContent: (
		data: Partial<FellowShipStoreState['content']>,
	) => void;
	transformFellowshipData: () => Omit<
		ClientFellowship,
		'id' | 'groupId' | 'createdAt' | 'updatedAt'
	>;
	completeFellowship: ({
		type,
		groupId,
		fellowshipId,
	}: {
		type: FellowshipStoreType;
		groupId: string;
		fellowshipId?: string | null;
	}) => Promise<void>;
	clearFellowship: () => void;
};

export const useFellowshipStore = create<FellowShipStoreState>((set, get) => ({
	currentStep: FELLOWSHIP_DEFAULT_STEP,
	type: 'CREATE',
	fellowshipId: null,
	info: {
		date: new Date(),
		preachTitle: '',
		preacher: { isActive: true, value: '' },
		preachText: { isActive: true, value: '' },
		members: [],
	},
	content: {
		iceBreaking: [],
		sermonTopic: [],
		prayerRequest: { isActive: true, answers: [] },
	},
	setStep: (step) => set({ currentStep: step }),
	setType: (type) => set({ type }),
	setFellowshipId: (fellowshipId) => set({ fellowshipId }),
	getLastUpdatedIdAndReset: () => {
		const id = get().lastUpdatedId || null;
		set({ lastUpdatedId: null });
		return id;
	},

	updateFellowshipInfo: (data) =>
		set((state) => ({
			info: { ...state.info, ...data },
		})),
	updateFellowshipContent: (data) =>
		set((state) => ({
			content: { ...state.content, ...data },
		})),

	/**
	 * Transforms store data into the format expected by the API
	 * @returns Fellowship data in the format expected by createFellowship API
	 */
	transformFellowshipData: () => {
		const { info, content } = get();

		return {
			info,
			content,
		};
	},

	completeFellowship: async ({ type, fellowshipId, groupId }) => {
		const fellowshipData = get().transformFellowshipData();

		switch (type) {
			case 'CREATE': {
				const id = await createFellowship(groupId, fellowshipData);
				get().clearFellowship();
				set({ currentStep: FELLOWSHIP_DEFAULT_STEP });
				router.replace(`/(app)/(fellowship)/${id}`);
				break;
			}
			case 'EDIT': {
				if (!fellowshipId) return;

				await updateFellowship(groupId, fellowshipId, fellowshipData);

				// Set lastUpdatedId to let components know this ID needs to be refreshed
				set({ lastUpdatedId: fellowshipId });

				get().clearFellowship();
				set({ currentStep: FELLOWSHIP_DEFAULT_STEP });
				router.back();
				break;
			}
		}
	},

	clearFellowship: () => {
		set({
			fellowshipId: null,
			info: {
				date: new Date(),
				preachTitle: '',
				preacher: { isActive: false, value: '' },
				preachText: { isActive: false, value: '' },
				members: [],
			},
			content: {
				iceBreaking: [],
				sermonTopic: [],
				prayerRequest: { isActive: false, answers: [] },
			},
		});
	},
}));
