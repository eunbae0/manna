import {
	doc,
	getDoc,
	collection,
	query,
	where,
	orderBy,
	limit,
	getDocs,
} from '@react-native-firebase/firestore';
import { database } from '@/firebase/config';
import type { AppUpdate, AppVersionConfig } from './types';

/**
 * Firestore service for app config operations
 */
export class FirestoreAppConfigService {
	// 싱글톤 인스턴스를 저장할 정적 변수
	private static instance: FirestoreAppConfigService | null = null;

	// 싱글톤 인스턴스를 반환하는 정적 메서드
	public static getInstance(): FirestoreAppConfigService {
		if (!FirestoreAppConfigService.instance) {
			FirestoreAppConfigService.instance = new FirestoreAppConfigService();
		}
		return FirestoreAppConfigService.instance;
	}

	private constructor() {}
	private readonly collectionPath: string = 'AppConfig';
	private readonly versionDocPath: string = 'version';
	private readonly appUpdatesDocPath: string = 'app_updates';

	/**
	 * Gets the app version config
	 * @returns App version config data or null if not found
	 */
	async getAppConfigVersion(): Promise<AppVersionConfig | null> {
		const configRef = doc(database, this.collectionPath, this.versionDocPath);
		const configDoc = await getDoc(configRef);

		if (!configDoc.exists()) {
			return null;
		}
		return configDoc.data() as AppVersionConfig;
	}

	async getAllUpdateNotes(): Promise<AppUpdate[] | null> {
		try {
			const updatesRef = collection(
				database,
				this.collectionPath,
				this.versionDocPath,
				this.appUpdatesDocPath,
			);
			const q = query(updatesRef, orderBy('version', 'desc'));

			const snapshot = await getDocs(q);

			if (snapshot.empty) {
				return null;
			}

			const updates: AppUpdate[] = [];
			for (const doc of snapshot.docs) {
				updates.push(doc.data() as AppUpdate);
			}

			return updates;
		} catch (error) {
			console.error('Error fetching app updates:', error);
			return null;
		}
	}

	async getLatestUpdateNote(): Promise<AppUpdate | null> {
		try {
			const updatesRef = collection(
				database,
				this.collectionPath,
				this.versionDocPath,
				this.appUpdatesDocPath,
			);
			const q = query(
				updatesRef,
				where('isActive', '==', true),
				orderBy('version', 'desc'),
				limit(1),
			);

			const snapshot = await getDocs(q);

			if (snapshot.empty) {
				return null;
			}

			const updateDoc = snapshot.docs[0];
			const updateData = updateDoc.data();

			return {
				version: updateData.version,
				releaseDate: updateData.releaseDate?.toDate() || new Date(),
				notes: updateData.notes || [],
				isActive: updateData.isActive || true,
			};
		} catch (error) {
			console.error('Error fetching app update:', error);
			return null;
		}
	}
}

export const getAppConfigService = (): FirestoreAppConfigService => {
	return FirestoreAppConfigService.getInstance();
};
