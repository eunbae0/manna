import type { WorshipType } from '@/api/worshipTypes/types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type WorshipState = {
	worshipTypes: WorshipType[];
	selectedWorshipType: WorshipType | null;
};

type WorshipActions = {
	setWorshipTypes: (types: WorshipType[]) => void;
	addWorshipType: (type: WorshipType) => void;
	removeWorshipType: (type: WorshipType) => void;
	setSelectedWorshipType: (type: WorshipType | null) => void;
};

export const useWorshipStore = create<WorshipState & WorshipActions>()(
	immer((set) => ({
		worshipTypes: [],
		selectedWorshipType: null,

		setWorshipTypes: (types) =>
			set((state) => {
				state.worshipTypes = types;
			}),

		addWorshipType: (type) =>
			set((state) => {
				if (!state.worshipTypes.includes(type)) {
					state.worshipTypes.push(type);
				}
			}),

		removeWorshipType: (type) =>
			set((state) => {
				state.worshipTypes = state.worshipTypes.filter(
					(t) => t.name !== type.name,
				);
			}),

		setSelectedWorshipType: (type) =>
			set((state) => {
				state.selectedWorshipType = type;
			}),
	})),
);
