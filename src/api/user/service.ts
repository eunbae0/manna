import { database } from '@/firebase/config';
import {
	doc,
	getDoc,
	setDoc,
	updateDoc,
	serverTimestamp,
	collection,
	getDocs,
	deleteDoc,
	addDoc,
} from '@react-native-firebase/firestore';

import { createUserWithServerTimestamp } from '@/shared/utils/auth';
import type { ClientUser, FirestoreUser, UserGroup } from './types';
import type { AuthType } from '@/shared/types';

/**
 * Firestore service for user profile operations
 */
export class FirestoreUserService {
	// 싱글톤 인스턴스를 저장할 정적 변수
	private static instance: FirestoreUserService | null = null;

	// 싱글톤 인스턴스를 반환하는 정적 메서드
	public static getInstance(): FirestoreUserService {
		if (!FirestoreUserService.instance) {
			FirestoreUserService.instance = new FirestoreUserService();
		}
		return FirestoreUserService.instance;
	}

	// 생성자를 private으로 설정하여 외부에서 인스턴스 생성을 방지
	private constructor() {}
	private readonly usersCollectionPath: string = 'users';

	/**
	 * Converts a Firestore user to a client user
	 * @param data Firestore user data
	 * @returns Client user
	 */
	convertToClientUser(
		data: FirestoreUser,
		groups: UserGroup[] | null,
	): ClientUser {
		return {
			id: data.id,
			email: data.email,
			displayName: data.displayName,
			photoUrl: data.photoUrl,
			authType: data.authType,
			authId: data.authId,
			groups: groups || undefined,
			isDeleted: data.isDeleted,
		};
	}

	/**
	 * Gets a user from Firestore by ID
	 * @param userId ID of the user
	 * @returns User data or null if not found
	 */
	async getUser(userId: string): Promise<FirestoreUser | null> {
		const userRef = doc(database, this.usersCollectionPath, userId);
		const userDoc = await getDoc(userRef);

		if (!userDoc.exists) {
			return null;
		}

		return userDoc.data() as FirestoreUser;
	}

	/**
	 * Creates a new user profile
	 * @param userId ID of the user
	 * @param userData User data to be saved
	 */
	async createUser(
		userId: string,
		userData: Partial<FirestoreUser> & { authType: AuthType },
	): Promise<ClientUser> {
		const userRef = doc(database, this.usersCollectionPath, userId);
		const userWithTimestamp = createUserWithServerTimestamp(
			Object.assign({ id: userId, authType: userData.authType }, userData),
		);

		await setDoc(userRef, userWithTimestamp);
		return { id: userId, ...userData };
	}

	/**
	 * Updates an existing user profile
	 * @param userId ID of the user to update
	 * @param userData Updated user data
	 */
	async updateUser(
		userId: string,
		userData: Partial<FirestoreUser>,
	): Promise<void> {
		const userRef = doc(database, this.usersCollectionPath, userId);

		await updateDoc(userRef, userData);
	}

	/**
	 * Updates a user's last login timestamp
	 * @param userId ID of the user
	 */
	async updateLastLogin(userId: string): Promise<void> {
		const userRef = doc(database, this.usersCollectionPath, userId);
		await updateDoc(userRef, {
			lastLogin: serverTimestamp(),
		});
	}

	// userGroup

	async getUserGroups(userId: string): Promise<UserGroup[] | null> {
		const userGroupsRef = collection(database, 'users', userId, 'groups');
		const userGroupsDoc = await getDocs(userGroupsRef);

		if (userGroupsDoc.empty) {
			return null;
		}

		const data = userGroupsDoc.docs.map((doc) => doc.data() as UserGroup);
		return data;
	}

	async createUserGroup(userId: string, group: UserGroup): Promise<void> {
		const userGroupsRef = doc(
			database,
			'users',
			userId,
			'groups',
			group.groupId,
		);
		await setDoc(userGroupsRef, group);
	}

	async updateUserGroup(userId: string, group: UserGroup): Promise<void> {
		const userGroupsRef = doc(
			database,
			'users',
			userId,
			'groups',
			group.groupId,
		);
		await updateDoc(userGroupsRef, group);
	}

	async removeUserGroup(userId: string, groupId: string): Promise<void> {
		const userGroupsRef = doc(database, 'users', userId, 'groups', groupId);
		await deleteDoc(userGroupsRef);
	}
}

export const getUserService = (): FirestoreUserService => {
	return FirestoreUserService.getInstance();
};
