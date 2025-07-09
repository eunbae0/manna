import { functions } from '@/firebase/config';
import type { httpsCallable } from '@react-native-firebase/functions';
import type { RequestData, ResponseData } from './types';

/**
 * Feed service class for handling Firestore operations related to Feed data
 */
export class FirestoreFeedService {
	private static instance: FirestoreFeedService | null = null;

	public static getInstance(): FirestoreFeedService {
		if (!FirestoreFeedService.instance) {
			FirestoreFeedService.instance = new FirestoreFeedService();
		}
		return FirestoreFeedService.instance;
	}

	getUserFeeds({
		lastVisible = null,
		limit = 10,
	}: RequestData): ReturnType<ReturnType<typeof httpsCallable<ResponseData>>> {
		return functions.httpsCallable('getUserFeeds')({
			lastVisible,
			limit,
		});
	}
}

export const getFeedService = (): FirestoreFeedService => {
	return FirestoreFeedService.getInstance();
};
