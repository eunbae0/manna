import { create } from 'zustand';

interface SplashAnimationState {
	isAnimationComplete: boolean;
	setAnimationComplete: (isComplete: boolean) => void;
}

export const useSplashAnimationStore = create<SplashAnimationState>((set) => ({
	isAnimationComplete: false,
	setAnimationComplete: (isComplete) =>
		set({ isAnimationComplete: isComplete }),
}));
