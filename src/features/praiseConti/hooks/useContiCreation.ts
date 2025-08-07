// hooks/useContiCreation.ts
import { useCallback } from 'react';
import { useContiCreationStore } from '../stores/contiCreation';

export const useContiNavigation = () => {
	const { currentStep, currentSubStep, goToStep, nextStep, previousStep } =
		useContiCreationStore();

	const canGoNext = useCallback(() => {
		const state = useContiCreationStore.getState();

		switch (currentStep) {
			case 1:
				return currentSubStep === 1 ? true : state.contiData.tags.length > 0;
			case 2:
				if (currentSubStep === 1) return !!state.currentSong.name;
				if (currentSubStep === 2) return !!state.currentSong.chord;
				return true;
			default:
				return true;
		}
	}, [currentStep, currentSubStep]);

	return {
		currentStep,
		currentSubStep,
		goToStep,
		nextStep,
		previousStep,
		canGoNext,
	};
};

export const useContiForm = () => {
	const {
		contiData,
		currentSong,
		updateContiTitle,
		toggleContiTag,
		updateCurrentSong,
		addContiSong,
		resetCurrentSong,
		tags,
		errors,
	} = useContiCreationStore();

	return {
		contiData,
		currentSong,
		updateContiTitle,
		toggleContiTag,
		updateCurrentSong,
		addContiSong,
		resetCurrentSong,
		tags,
		errors,
	};
};
