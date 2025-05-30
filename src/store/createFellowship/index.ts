import { createFellowship, updateFellowship } from '@/features/fellowship/api';
import { router } from 'expo-router';
import { create } from 'zustand';
import type {
	FellowShipStoreData,
	FellowshipStoreStep,
	FellowshipStoreType,
} from './types';
import type {
	ClientFellowshipV2,
	CreateFellowshipInputV2,
} from '@/features/fellowship/api/types';
import type { DeepPartial } from '@/shared/utils/deepPartial';
import { deepMerge } from '@/shared/utils/deepMerge';

export const FELLOWSHIP_DEFAULT_STEP: FellowshipStoreStep = 'INFO';
export const FELLOWSHIP_DEFAULT_TYPE: FellowshipStoreType = 'CREATE';

type FellowShipStoreState = FellowShipStoreData & {
	currentStep: FellowshipStoreStep;
	type: FellowshipStoreType;
	fellowshipId?: string | null;
	hasShownRecentRecommendSheet: boolean;
	lastUpdatedId?: string | null;
	isFirstRender: boolean;
	setStep: (step: FellowshipStoreStep) => void;
	setType: (type: FellowshipStoreType) => void;
	setFellowshipId: (fellowshipId: string | null) => void;
	setHasShownRecentRecommendSheet: (
		hasShownRecentRecommendSheet: boolean,
	) => void;
	setIsFirstRender: (isFirstRender: boolean) => void;
	getLastUpdatedIdAndReset: () => string | null;
	updateFellowshipInfo: (data: Partial<FellowShipStoreState['info']>) => void;
	updateFellowshipContent: (
		data: DeepPartial<FellowShipStoreState['content']>,
	) => void;
	updateFellowshipOptions: (
		data: Partial<FellowShipStoreState['options']>,
	) => void;
	updateFellowshipRoles: (data: Partial<FellowShipStoreState['roles']>) => void;
	transformFellowshipData: (groupId: string) => CreateFellowshipInputV2;
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
	hasShownRecentRecommendSheet: false,
	isFirstRender: true,
	info: {
		date: new Date(),
		title: '',
		preacher: '',
		preachText: '',
		participants: [],
	},
	roles: {
		leaderId: '',
	},
	content: {
		categories: {
			iceBreaking: {
				id: 'iceBreaking',
				title: '아이스 브레이킹',
				order: 0,
				type: 'iceBreaking',
				isActive: false,
				items: {},
			},
			sermonTopic: {
				id: 'sermonTopic',
				title: '설교 나눔',
				order: 0,
				type: 'sermonTopic',
				isActive: false,
				items: {},
			},
			prayerRequest: {
				id: 'prayerRequest',
				title: '기도 제목',
				order: 0,
				type: 'prayerRequests',
				isActive: true,
				items: {
					prayerRequest: {
						id: 'prayerRequest',
						title: '',
						order: 0,
						answers: {},
					},
				},
			},
		},
	},
	options: {
		enableMemberReply: false,
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
			content: deepMerge(state.content, data),
		})),
	updateFellowshipOptions: (data) =>
		set((state) => ({
			options: deepMerge(state.options, data),
		})),
	updateFellowshipRoles: (data) =>
		set((state) => ({
			roles: deepMerge(state.roles, data),
		})),
	/**
	 * Transforms store data into the format expected by the API
	 * @returns Fellowship data in the format expected by createFellowship API
	 */
	transformFellowshipData: (groupId: string) => {
		const { info, roles, content, options } = get();

		const formattedContent = {
			categories: Object.entries(content.categories).reduce(
				(acc, [categoryKey, category]) => {
					// 카테고리의 items 필터링
					const filteredItems = Object.entries(category.items).reduce(
						(itemsAcc, [itemKey, item]) => {
							// 임시 항목이면서 제목이 비어있는 경우 제외
							const isTempEmpty =
								(itemKey === 'iceBreaking_temp' ||
									itemKey === 'sermonTopic_temp') &&
								item.title === '';

							if (!isTempEmpty) {
								itemsAcc[itemKey] = item;
							}
							return itemsAcc;
						},
						{} as Record<string, any>,
					);

					// 필터링된 items로 카테고리 업데이트
					acc[categoryKey] = {
						...category,
						items: filteredItems,
					};

					return acc;
				},
				{} as Record<string, any>,
			),
		};

		return {
			identifiers: {
				groupId,
			},
			info: {
				...info,
				participants: info.participants.map((participant) => {
					return Object.assign(
						{ id: participant.id },
						participant.isGuest ? { displayName: participant.displayName } : {},
					);
				}),
			},
			content: formattedContent,
			options,
			roles,
		};
	},

	completeFellowship: async ({ type, fellowshipId, groupId }) => {
		const fellowshipData = get().transformFellowshipData(groupId);

		switch (type) {
			case 'CREATE': {
				const id = await createFellowship(fellowshipData);
				get().clearFellowship();

				// tracking amplitude
				// trackAmplitudeEvent('나눔 생성', {
				// 	screen: 'Fellowship_Create',
				// 	fellowship_ice_breaking_count:
				// 		fellowshipData.content.iceBreaking.length,
				// 	fellowship_sermon_topic_count:
				// 		fellowshipData.content.sermonTopic.length,
				// 	fellowship_prayer_request_enabled:
				// 		fellowshipData.content.prayerRequest.isActive,
				// 	fellowship_disabled_pracher: !fellowshipData.info.preacher?.isActive,
				// 	fellowship_disabled_preach_text:
				// 		!fellowshipData.info.preachText?.isActive,
				// 	fellowship_member_count: fellowshipData.info.members.length,
				// });
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

				// trackAmplitudeEvent('나눔 수정', {
				// 	screen: 'Fellowship_Edit',
				// 	fellowship_ice_breaking_count:
				// 		fellowshipData.content.iceBreaking.length,
				// 	fellowship_sermon_topic_count:
				// 		fellowshipData.content.sermonTopic.length,
				// 	fellowship_prayer_request_enabled:
				// 		fellowshipData.content.prayerRequest.isActive,
				// 	fellowship_disabled_pracher: !fellowshipData.info.preacher?.isActive,
				// 	fellowship_disabled_preach_text:
				// 		!fellowshipData.info.preachText?.isActive,
				// 	fellowship_member_count: fellowshipData.info.members.length,
				// });

				get().clearFellowship();
				router.dismiss();
				break;
			}
		}
	},
	setHasShownRecentRecommendSheet: (hasShownRecentRecommendSheet) =>
		set({ hasShownRecentRecommendSheet }),
	setIsFirstRender: (isFirstRender) => set({ isFirstRender }),
	clearFellowship: () => {
		set({
			fellowshipId: null,
			type: FELLOWSHIP_DEFAULT_TYPE,
			currentStep: FELLOWSHIP_DEFAULT_STEP,
			hasShownRecentRecommendSheet: false,
			isFirstRender: true,
			info: {
				date: new Date(),
				title: '',
				preacher: '',
				preachText: '',
				participants: [],
			},
			roles: {
				leaderId: '',
			},
			content: {
				categories: {
					iceBreaking: {
						id: 'iceBreaking',
						title: '아이스 브레이킹',
						order: 0,
						type: 'iceBreaking',
						isActive: false,
						items: {},
					},
					sermonTopic: {
						id: 'sermonTopic',
						title: '설교 나눔',
						order: 0,
						type: 'sermonTopic',
						isActive: false,
						items: {},
					},
					prayerRequest: {
						id: 'prayerRequest',
						title: '기도 제목',
						order: 0,
						type: 'prayerRequests',
						isActive: true,
						items: {
							prayerRequest: {
								id: 'prayerRequest',
								title: '',
								order: 0,
								answers: {},
							},
						},
					},
				},
			},
			options: {
				enableMemberReply: false,
			},
		});
	},
}));
