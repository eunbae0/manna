import { database } from '@/firebase/config';
import { doc, getDoc, setDoc, updateDoc } from '@/firebase/firestore';
import type { User } from '@/types/user';
import { createUserWithServerTimestamp } from '@/utils/auth';
import type { UserProfileService } from './types';
import { handleApiError } from '../errors';

export class FirestoreUserProfile implements UserProfileService {
	/**
	 * 사용자 프로필 조회
	 */
	async getUser(userId: string): Promise<User | null> {
		try {
			const docSnap = await getDoc(doc(database, 'users', userId));
			if (!docSnap.exists()) {
				return null;
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
		const userWithTimestamp = createUserWithServerTimestamp(
			Object.assign({ id: userId }, user),
		);
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
