// stores/contiCreation/slices/dataManagementSlice.ts
import type { StateCreator } from 'zustand';
import type { ContiCreationStore } from '../types';
import type { PraiseContiTag, PraiseSong } from '@/features/praiseConti/types';
import { v4 as uuidv4 } from 'uuid';

export const createDataManagementSlice: StateCreator<
	ContiCreationStore,
	[['zustand/immer', never]],
	[],
	Pick<
		ContiCreationStore,
		| 'updateContiTitle'
		| 'toggleContiTag'
		| 'updateCurrentSong'
		| 'addContiSong'
		| 'removeContiSong'
		| 'resetCurrentSong'
	>
> = (set, get) => ({
	updateContiTitle: (title: string) => {
		set((state) => {
			state.contiData.title =
				title || new Date().toISOString().slice(0, 10).replace(/-/g, '/');
			state.isDirty = true;
		});
	},

	toggleContiTag: (tag: PraiseContiTag) => {
		set((state) => {
			const existingIndex = state.contiData.tags.findIndex(
				(t) => t.id === tag.id,
			);

			if (existingIndex !== -1) {
				state.contiData.tags.splice(existingIndex, 1);
			} else {
				state.contiData.tags.push(tag);
			}
			state.isDirty = true;
		});
	},

	updateCurrentSong: (updates: Partial<PraiseSong>) => {
		set((state) => {
			state.currentSong = { ...state.currentSong, ...updates };
			state.isDirty = true;
		});
	},

	addContiSong: () => {
		const { currentSong } = get();

		if (!currentSong.name || !currentSong.chord || !currentSong.imageUrl) {
			return;
		}

		set((state) => {
			const order =
				state.contiData.songs.length > 0
					? Math.max(...state.contiData.songs.map((s) => s.order || 0)) + 1
					: 1;
			const newSong: PraiseSong = {
				...currentSong,
				id: uuidv4(),
				name: currentSong.name!,
				chord: currentSong.chord!,
				imageUrl: currentSong.imageUrl!,
				order,

				createdAt: new Date(),
			};

			state.contiData.songs.push(newSong);
			state.currentSong = {};
			state.isDirty = true;
		});
	},

	removeContiSong: (songId: string) => {
		set((state) => {
			const index = state.contiData.songs.findIndex(
				(song) => song.id === songId,
			);
			if (index !== -1) {
				state.contiData.songs.splice(index, 1);
				state.isDirty = true;
			}
		});
	},

	resetCurrentSong: () => {
		set((state) => {
			state.currentSong = {};
		});
	},
});
