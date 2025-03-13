import { auth } from '@/firebase/config';

export class FirestoreService {
	userId: string;

	constructor() {
		this.userId = this.getUserId();
	}

	getUserId() {
		return auth.currentUser?.uid || '';
	}
	updateUserId() {
		this.userId = this.getUserId();
	}
}
