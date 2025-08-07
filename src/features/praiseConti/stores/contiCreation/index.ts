// stores/contiCreation/store.ts
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Slices
import { createNavigationSlice } from './slices/navigationSlice';
import { createDataManagementSlice } from './slices/dataManagementSlice';
import { createApiSlice } from './slices/apiSlice';
import type { ContiCreationState, ContiCreationStore } from './types';

const initialState: ContiCreationState = {
	currentStep: 1,
	currentSubStep: 1,
	contiData: {
		identifier: {
			id: '',
			authorId: '',
		},
		metadata: {
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: undefined,
			isDeleted: undefined,
		},
		title: '',
		thumbnailUrl: '',
		tags: [],
		songs: [],
	},
	currentSong: {},
	tags: [],
	searchedYTMusicSongs: [],
	sheetMusics: [],

	isLoading: false,
	errors: {},
	isDirty: false,
};

export const useContiCreationStore = create<ContiCreationStore>()(
	devtools(
		persist(
			subscribeWithSelector(
				immer((set, get, api) => ({
					...initialState,

					// Navigation slice
					...createNavigationSlice(set, get),

					// Data management slice
					...createDataManagementSlice(set, get),

					// API slice
					...createApiSlice(set, get),
				})),
			),
			{
				name: 'conti-creation-store',
				partialize: (state) => ({
					contiData: state.contiData,
					currentStep: state.currentStep,
					currentSubStep: state.currentSubStep,
					currentSong: state.currentSong,
				}),
			},
		),
		{ name: 'ContiCreationStore' },
	),
);
