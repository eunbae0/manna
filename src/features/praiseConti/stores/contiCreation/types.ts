import type {
	ClientPraiseConti,
	PraiseContiTag,
	PraiseSong,
	YTMusicSearchResult,
} from '../../types';

export interface ContiCreationState {
	// 현재 플로우 상태
	currentStep: number;
	currentSubStep: number;

	// 폼 데이터
	contiData: ClientPraiseConti;

	// 현재 편집 중인 아이템
	currentSong: Partial<PraiseSong>;

	// API 응답 데이터
	tags: PraiseContiTag[];
	searchedYTMusicSongs: YTMusicSearchResult[];
	sheetMusics: string[];

	// UI 상태
	isLoading: boolean;
	errors: Record<string, string>;

	// 임시 저장 상태
	isDirty: boolean;
}

// stores/contiCreation/types.ts
export interface ContiCreationActions {
	// Navigation
	goToStep: (step: number, subStep?: number) => void;
	nextStep: () => void;
	previousStep: () => void;

	// Data Management
	updateContiTitle: (title: string) => void;
	toggleContiTag: (tag: PraiseContiTag) => void;
	updateCurrentSong: (updates: Partial<PraiseSong>) => void;
	addContiSong: () => void;
	removeContiSong: (itemId: string) => void;
	resetCurrentSong: () => void;

	// API Actions
	fetchContiTags: () => Promise<void>;
	searchYTMusicSongs: (query: string) => Promise<void>;
	fetchSheetMusic: (songName: string, chord: string) => Promise<void>;
	saveConti: (groupId: string, authorId: string) => Promise<void>;

	// Utility
	resetCurrentItem: () => void;
	resetStore: () => void;
	setLoading: (isLoading: boolean) => void;
	setError: (field: string, error: string) => void;
	clearErrors: () => void;
}

export type ContiCreationStore = ContiCreationState & ContiCreationActions;
