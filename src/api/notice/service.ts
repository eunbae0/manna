import {
	doc,
	getDoc,
	collection,
	query,
	where,
	orderBy,
	getDocs,
} from '@react-native-firebase/firestore';
import { database } from '@/firebase/config';
import type { Notice } from './types';

/**
 * Firestore service for notice operations
 */
export class FirestoreNoticeService {
	// 싱글톤 인스턴스를 저장할 정적 변수
	private static instance: FirestoreNoticeService | null = null;

	// 싱글톤 인스턴스를 반환하는 정적 메서드
	public static getInstance(): FirestoreNoticeService {
		if (!FirestoreNoticeService.instance) {
			FirestoreNoticeService.instance = new FirestoreNoticeService();
		}
		return FirestoreNoticeService.instance;
	}

	private constructor() {}
	private readonly collectionPath: string = 'notice';

	/**
	 * Gets all notices
	 * @returns Array of notices or null if not found
	 */
	async getAllNotices(): Promise<Notice[] | null> {
		try {
			const noticesRef = collection(database, this.collectionPath);
			const q = query(noticesRef, orderBy('date', 'desc'));

			const snapshot = await getDocs(q);

			if (snapshot.empty) {
				return null;
			}

			const notices: Notice[] = [];
			for (const doc of snapshot.docs) {
				const data = doc.data();
				if (!data) continue;

				notices.push({
					id: doc.id,
					title: data.title || '',
					content: data.content || '',
					date: data.date?.toDate() || new Date(),
					isPinned: Boolean(data.isPinned),
					showOnMain: Boolean(data.showOnMain),
					mainDisplayText: data.mainDisplayText || '',
					metadata: {
						status:
							(data.metadata?.status as 'published' | 'archived') ||
							'published',
					},
				});
			}

			return notices;
		} catch (error) {
			console.error('Error fetching notices:', error);
			return null;
		}
	}

	/**
	 * Gets a specific notice by ID
	 * @param id Notice ID
	 * @returns Notice data or null if not found
	 */
	async getNoticeById(id: string): Promise<Notice | null> {
		try {
			const noticeRef = doc(database, this.collectionPath, id);
			const noticeDoc = await getDoc(noticeRef);

			if (!noticeDoc.exists()) {
				return null;
			}

			const data = noticeDoc.data();
			if (!data) return null;

			return {
				id: noticeDoc.id,
				title: data.title || '',
				content: data.content || '',
				date: data.date?.toDate() || new Date(),
				isPinned: Boolean(data.isPinned),
				showOnMain: Boolean(data.showOnMain),
				mainDisplayText: data.mainDisplayText || '',
				metadata: {
					status:
						(data.metadata?.status as 'published' | 'archived') || 'published',
				},
			};
		} catch (error) {
			console.error(`Error fetching notice with ID ${id}:`, error);
			return null;
		}
	}

	/**
	 * Gets all pinned notices
	 * @returns Array of pinned notices or null if not found
	 */
	async getPinnedNotices(): Promise<Notice[] | null> {
		try {
			const noticesRef = collection(database, this.collectionPath);
			const q = query(
				noticesRef,
				where('isPinned', '==', true),
				orderBy('date', 'desc'),
			);

			const snapshot = await getDocs(q);

			if (snapshot.empty) {
				return null;
			}

			const notices: Notice[] = [];
			for (const doc of snapshot.docs) {
				const data = doc.data();
				if (!data) continue;

				notices.push({
					id: doc.id,
					title: data.title || '',
					content: data.content || '',
					date: data.date?.toDate() || new Date(),
					isPinned: Boolean(data.isPinned),
					showOnMain: Boolean(data.showOnMain),
					mainDisplayText: data.mainDisplayText || '',
					metadata: {
						status:
							(data.metadata?.status as 'published' | 'archived') ||
							'published',
					},
				});
			}

			return notices;
		} catch (error) {
			console.error('Error fetching pinned notices:', error);
			return null;
		}
	}

	/**
	 * Gets all notices that should be displayed on the main screen
	 * @returns Array of notices for main screen or null if not found
	 */
	async getMainScreenNotices(): Promise<Notice[] | null> {
		try {
			const noticesRef = collection(database, this.collectionPath);
			const q = query(
				noticesRef,
				where('showOnMain', '==', true),
				where('metadata.status', '==', 'published'),
				orderBy('date', 'desc'),
			);

			const snapshot = await getDocs(q);

			if (snapshot.empty) {
				return null;
			}

			const notices: Notice[] = [];
			for (const doc of snapshot.docs) {
				const data = doc.data();
				if (!data) continue;

				notices.push({
					id: doc.id,
					title: data.title || '',
					content: data.content || '',
					date: data.date?.toDate() || new Date(),
					isPinned: Boolean(data.isPinned),
					showOnMain: Boolean(data.showOnMain),
					mainDisplayText: data.mainDisplayText || '',
					metadata: {
						status:
							(data.metadata?.status as 'published' | 'archived') ||
							'published',
					},
				});
			}

			return notices;
		} catch (error) {
			console.error('Error fetching main screen notices:', error);
			return null;
		}
	}
}

/**
 * Returns the notice service instance
 */
export function getNoticeService(): FirestoreNoticeService {
	return FirestoreNoticeService.getInstance();
}
