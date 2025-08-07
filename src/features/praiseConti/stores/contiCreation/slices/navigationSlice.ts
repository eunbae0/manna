// stores/contiCreation/slices/navigationSlice.ts
import type { StateCreator } from 'zustand';
import type { ContiCreationStore } from '../types';

export const createNavigationSlice: StateCreator<
	ContiCreationStore,
	[['zustand/immer', never]],
	[],
	Pick<ContiCreationStore, 'goToStep' | 'nextStep' | 'previousStep'>
> = (set, get) => ({
	goToStep: (step: number, subStep = 1) => {
		set((state) => {
			state.currentStep = step;
			state.currentSubStep = subStep;
		});
	},

	nextStep: () => {
		const { currentStep, currentSubStep } = get();

		set((state) => {
			// 각 스텝별 서브스텝 로직
			switch (currentStep) {
				case 1:
					if (currentSubStep === 1) {
						state.currentSubStep = 2;
					} else {
						state.currentStep = 2;
						state.currentSubStep = 1;
					}
					break;
				case 2:
					if (currentSubStep < 3) {
						state.currentSubStep = currentSubStep + 1;
					} else {
						state.currentStep = 3;
						state.currentSubStep = 1;
					}
					break;
				default:
					if (currentStep < 6) {
						state.currentStep = currentStep + 1;
						state.currentSubStep = 1;
					}
			}
		});
	},

	previousStep: () => {
		const { currentStep, currentSubStep } = get();

		set((state) => {
			switch (currentStep) {
				case 1:
					if (currentSubStep === 2) {
						state.currentSubStep = 1;
					}
					break;
				case 2:
					if (currentSubStep === 1) {
						state.currentStep = 1;
						state.currentSubStep = 2;
					} else {
						state.currentSubStep = currentSubStep - 1;
					}
					break;
				default:
					if (currentStep === 3) {
						state.currentStep = 2;
						state.currentSubStep = 3;
					} else if (currentStep > 1) {
						state.currentStep = currentStep - 1;
						state.currentSubStep = 1;
					}
			}
		});
	},
});
