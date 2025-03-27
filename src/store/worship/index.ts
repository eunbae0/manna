import type { ClientWorshipType } from '@/api/worship-types/types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type WorshipState = {
	worshipTypes: ClientWorshipType[];
	selectedWorshipType: ClientWorshipType | null;
	isLoading: boolean;
};

type WorshipActions = {
	setWorshipTypes: (types: ClientWorshipType[]) => void;
	addWorshipType: (type: ClientWorshipType) => void;
	removeWorshipType: (type: ClientWorshipType) => void;
	setSelectedWorshipType: (type: ClientWorshipType | null) => void;
	setIsLoading: (isLoading: boolean) => void;
};

export const useWorshipStore = create<WorshipState & WorshipActions>()(
	immer((set) => ({
		worshipTypes: [],
		selectedWorshipType: null,
		isLoading: true,

		setWorshipTypes: (types) =>
			set((state) => {
				state.worshipTypes = types;
				state.isLoading = false;
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

		setIsLoading: (isLoading) =>
			set((state) => {
				state.isLoading = isLoading;
			}),
	})),
);
