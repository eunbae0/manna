import { createFellowship, updateFellowship } from '@/features/fellowship/api';
import { router } from 'expo-router';
import { create } from 'zustand';
import type {
	FellowShipStoreData,
	FellowshipStoreStep,
	FellowshipStoreType,
} from './types';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';

export const FELLOWSHIP_DEFAULT_STEP: FellowshipStoreStep = 'INFO';
export const FELLOWSHIP_DEFAULT_TYPE: FellowshipStoreType = 'CREATE';

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
	transformFellowshipData: () => FellowShipStoreData;
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
	type: FELLOWSHIP_DEFAULT_TYPE,
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

		// change members client to server
		info.members = info.members.map((member) => {
			const { photoUrl, ...restMemberField } = member;
			return restMemberField;
		});

		return {
			info,
			content,
		};
	},

	completeFellowship: async ({ type, fellowshipId, groupId }) => {
		const fellowshipData = get().transformFellowshipData();

		switch (type) {
			case 'CREATE': {
				const id = await createFellowship(
					{
						groupId,
					},
					fellowshipData,
				);
				get().clearFellowship();

				// tracking amplitude
				trackAmplitudeEvent('나눔 생성', {
					screen: 'Fellowship_Create',
					fellowship_ice_breaking_count:
						fellowshipData.content.iceBreaking.length,
					fellowship_sermon_topic_count:
						fellowshipData.content.sermonTopic.length,
					fellowship_prayer_request_enabled:
						fellowshipData.content.prayerRequest.isActive,
					fellowship_disabled_pracher: !fellowshipData.info.preacher?.isActive,
					fellowship_disabled_preach_text:
						!fellowshipData.info.preachText?.isActive,
					fellowship_member_count: fellowshipData.info.members.length,
				});
				router.replace(`/(app)/(fellowship)/${id}`);
				break;
			}
			case 'EDIT': {
				if (!fellowshipId) return;

				await updateFellowship(
					{
						groupId,
						fellowshipId,
					},
					fellowshipData,
				);

				// Set lastUpdatedId to let components know this ID needs to be refreshed
				set({ lastUpdatedId: fellowshipId });

				trackAmplitudeEvent('나눔 수정', {
					screen: 'Fellowship_Edit',
					fellowship_ice_breaking_count:
						fellowshipData.content.iceBreaking.length,
					fellowship_sermon_topic_count:
						fellowshipData.content.sermonTopic.length,
					fellowship_prayer_request_enabled:
						fellowshipData.content.prayerRequest.isActive,
					fellowship_disabled_pracher: !fellowshipData.info.preacher?.isActive,
					fellowship_disabled_preach_text:
						!fellowshipData.info.preachText?.isActive,
					fellowship_member_count: fellowshipData.info.members.length,
				});

				get().clearFellowship();
				router.dismiss();
				break;
			}
		}
	},

	clearFellowship: () => {
		set({
			fellowshipId: null,
			type: FELLOWSHIP_DEFAULT_TYPE,
			currentStep: FELLOWSHIP_DEFAULT_STEP,
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
		});
	},
}));
