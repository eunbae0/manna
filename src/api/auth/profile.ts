import { database } from '@/firebase/config';
import {
	doc,
	getDoc,
	serverTimestamp,
	setDoc,
	updateDoc,
} from '@/firebase/firestore';
import type { User } from '@/types/user';
import { createUserWithServerTimestamp } from '@/utils/auth';
import type { UserProfileService } from './types';
import { handleApiError } from '../errors';

export class FirestoreUserProfile implements UserProfileService {
	/**
	 * 사용자 프로필 조회
	 */
	async getUser(userId: string): Promise<User> {
		try {
			const docSnap = await getDoc(doc(database, 'users', userId));
			if (!docSnap.exists()) {
				throw handleApiError({
					message: '프로필 조회 실패: 프로필이 조회되지 않습니다.',
				});
			}
			return docSnap.data() as User;
		} catch (error) {
			throw handleApiError(error);
		}
	}

	/**
	 * 사용자 프로필 생성
	 */
	async createUser(userId: string, user: Partial<User>): Promise<void> {
		const userWithTimestamp = createUserWithServerTimestamp(user as User);
		try {
			await setDoc(doc(database, 'users', userId), userWithTimestamp);
		} catch (error) {
			throw handleApiError(error);
		}
	}

	/**
	 * 사용자 프로필 업데이트
	 */
	async updateUser(userId: string, data: Partial<User>): Promise<void> {
		try {
			await updateDoc(doc(database, 'users', userId), { ...data });
		} catch (error) {
			throw handleApiError(error);
		}
	}
}
