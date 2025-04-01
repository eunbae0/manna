import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

export class FirestoreMessagingService {
	// private readonly usersCollectionPath: string = 'users';
	// 싱글톤 인스턴스를 저장할 정적 변수
	private static instance: FirestoreMessagingService | null = null;

	// 싱글톤 인스턴스를 반환하는 정적 메서드
	public static getInstance(): FirestoreMessagingService {
		if (!FirestoreMessagingService.instance) {
			FirestoreMessagingService.instance = new FirestoreMessagingService();
		}
		return FirestoreMessagingService.instance;
	}

	// 생성자를 private으로 설정하여 외부에서 인스턴스 생성을 방지
	private constructor() {}

	async requestUserPermission(): Promise<boolean> {
		const authStatus = await messaging().requestPermission();
		if (Platform.OS === 'android') {
			PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
			);
		}
		return (
			authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
			authStatus === messaging.AuthorizationStatus.PROVISIONAL
		);
	}

	async getToken(): Promise<string> {
		return await messaging().getToken();
	}
}

// 싱글톤 인스턴스를 export하는 함수
export const getMessagingService = (): FirestoreMessagingService => {
	return FirestoreMessagingService.getInstance();
};
