import { auth } from '@/firebase/config';

/**
 * @deprecated
 */
export class FirestoreService {
	// 싱글톤 인스턴스를 저장할 정적 변수
	private static instance: FirestoreService | null = null;

	userId: string;

	// 싱글톤 인스턴스를 반환하는 정적 메서드
	public static getInstance(): FirestoreService {
		if (!FirestoreService.instance) {
			FirestoreService.instance = new FirestoreService();
		}
		return FirestoreService.instance;
	}

	// 생성자를 protected로 설정하여 상속 클래스에서만 생성할 수 있도록 함
	protected constructor() {
		this.userId = this.getUserId();
	}

	getUserId() {
		return auth.currentUser?.uid || '';
	}

	updateUserId() {
		this.userId = this.getUserId();
	}
}
