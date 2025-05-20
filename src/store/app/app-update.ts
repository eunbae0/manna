import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentAppVersion } from '@/shared/utils/app/app_version';

interface AppUpdateState {
	lastShownVersion: string | null;
	shouldShowUpdateSheet: boolean;
	setLastShownVersion: (version: string) => Promise<void>;
	checkShouldShowUpdateSheet: () => Promise<boolean>;
	resetUpdateSheet: () => void;
}

const STORAGE_KEY = '@app_update_last_shown';

export const useAppUpdateStore = create<AppUpdateState>((set, get) => ({
	lastShownVersion: null,
	shouldShowUpdateSheet: false,

	setLastShownVersion: async (version: string) => {
		await AsyncStorage.setItem(STORAGE_KEY, version);
		set({ lastShownVersion: version, shouldShowUpdateSheet: false });
	},

	checkShouldShowUpdateSheet: async () => {
		try {
			const currentVersion = getCurrentAppVersion();
			const lastShownVersion = await AsyncStorage.getItem(STORAGE_KEY);

			// 업데이트 시트를 보여줘야 하는 조건:
			// 1. 마지막으로 보여준 버전이 없거나
			// 2. 현재 버전이 마지막으로 보여준 버전과 다를 때
			const shouldShow =
				!lastShownVersion || lastShownVersion !== currentVersion;

			set({
				lastShownVersion: lastShownVersion || null,
				shouldShowUpdateSheet: shouldShow,
			});

			return shouldShow;
		} catch (error) {
			console.error('Error checking update sheet status:', error);
			return false;
		}
	},

	resetUpdateSheet: () => {
		set({ shouldShowUpdateSheet: false });
	},
}));
