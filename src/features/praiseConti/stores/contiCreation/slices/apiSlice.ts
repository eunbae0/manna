// stores/contiCreation/slices/apiSlice.ts
import type { StateCreator } from 'zustand';
import type { ContiCreationStore } from '../types';
import {
	createPraiseConti,
	searchYTMusicSongs,
} from '../../../api/contis/index';
import {
	getAllPraiseContiTags,
	getPraiseContiTag,
} from '@/features/praiseConti/api';

export const createApiSlice: StateCreator<
	ContiCreationStore,
	[['zustand/immer', never]],
	[],
	Pick<
		ContiCreationStore,
		| 'fetchContiTags'
		| 'searchYTMusicSongs'
		| 'fetchSheetMusic'
		| 'saveConti'
		| 'setLoading'
		| 'setError'
		| 'clearErrors'
	>
> = (set, get) => ({
	fetchContiTags: async () => {
		set((state) => {
			state.isLoading = true;
			delete state.errors.tags;
		});

		try {
			const tags = await getAllPraiseContiTags();
			set((state) => {
				state.tags = tags;
				state.isLoading = false;
			});
		} catch (error) {
			set((state) => {
				state.isLoading = false;
				state.errors.tags = '콘티 태그를 불러오는데 실패했습니다.';
			});
		}
	},

	searchYTMusicSongs: async (query: string) => {
		if (!query.trim()) return;

		set((state) => {
			state.isLoading = true;
			delete state.searchedYTMusicSongs;
		});

		try {
			const songs = await searchYTMusicSongs(query);
			set((state) => {
				state.searchedYTMusicSongs = songs;
				state.isLoading = false;
			});
		} catch (error) {
			set((state) => {
				state.isLoading = false;
				state.errors.searchedYTMusicSongs = '음악 검색에 실패했습니다.';
			});
		}
	},

	fetchSheetMusic: async (songName: string, chord: string) => {
		set((state) => {
			state.isLoading = true;
			delete state.errors.sheetMusic;
		});

		try {
			const sheetMusic = await getSheetMusic(songName, chord);
			set((state) => {
				state.availableSheetMusic = sheetMusic;
				state.isLoading = false;
			});
		} catch (error) {
			set((state) => {
				state.isLoading = false;
				state.errors.sheetMusic = '악보를 불러오는데 실패했습니다.';
			});
		}
	},

	saveConti: async (groupId, authorId) => {
		const { contiData } = get();

		set((state) => {
			state.isLoading = true;
			delete state.errors.save;
		});

		try {
			const savedConti = await createPraiseConti({
				...contiData,
				groupId,
				authorId,
			});

			set((state) => {
				// state.contiData = savedConti;
				state.isLoading = false;
				state.isDirty = false;
			});

			return savedConti;
		} catch (error) {
			set((state) => {
				state.isLoading = false;
				state.errors.save = '콘티 저장에 실패했습니다.';
			});
			throw error;
		}
	},

	setLoading: (isLoading: boolean) => {
		set((state) => {
			state.isLoading = isLoading;
		});
	},

	setError: (field: string, error: string) => {
		set((state) => {
			state.errors[field] = error;
		});
	},

	clearErrors: () => {
		set((state) => {
			state.errors = {};
		});
	},
});
