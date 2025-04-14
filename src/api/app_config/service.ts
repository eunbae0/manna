import { doc, getDoc } from '@react-native-firebase/firestore';
import { database } from '@/firebase/config';
import type { AppVersionConfig } from './types';

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

	/**
	 * Gets the app version config
	 * @returns App version config data or null if not found
	 */
	async getAppConfigVersion(): Promise<AppVersionConfig | null> {
		const configRef = doc(database, this.collectionPath, this.versionDocPath);
		const configDoc = await getDoc(configRef);

		if (!configDoc.exists) {
			return null;
		}
		return configDoc.data() as AppVersionConfig;
	}
}

export const getAppConfigService = (): FirestoreAppConfigService => {
	return FirestoreAppConfigService.getInstance();
};
