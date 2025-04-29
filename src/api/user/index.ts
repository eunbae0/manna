import { getUserService } from './service';
import type {
	ClientUser,
	AuthType,
	UpdateUserInput,
	UserGroup,
	FirestoreUser,
} from '@/shared/types';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';
import { generateRandomDisplayName } from '@/shared/utils/nameGenerator';
import type { UpdateGroupMemberInput } from '../group/types';
import { fetchGroupsByUserId } from '../group';
import { database } from '@/firebase/config';
import { writeBatch, doc } from '@react-native-firebase/firestore';

/**
 * 사용자 프로필 조회
 */
export const getUser = withApiLogging(
	async (userId: string): Promise<ClientUser | null> => {
		try {
			const userService = getUserService();

			const user = await userService.getUser(userId);
			if (!user) return null;

			const groups = await userService.getUserGroups(userId);

			return userService.convertToClientUser(user, groups);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'getUser',
	'auth',
);

/**
 * 사용자 프로필 생성
 */
export const createUser = withApiLogging(
	async (
		userId: string,
		userData: Partial<ClientUser> & { authType: AuthType },
	): Promise<ClientUser> => {
		try {
			const userService = getUserService();
			const randomDisplayName = generateRandomDisplayName();
			return await userService.createUser(userId, {
				...userData,
				displayName: randomDisplayName,
			});
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'createUser',
	'auth',
);

/**
 * 사용자 프로필 업데이트
 */
export const updateUser = withApiLogging(
	async (
		userId: string,
		data: UpdateUserInput,
	): Promise<Partial<FirestoreUser>> => {
		try {
			const userService = getUserService();

			const updatedUserData = await userService.updateUser(userId, data);

			if (!data.displayName && !data.photoUrl && !data.statusMessage)
				return updatedUserData;
			const processedData = Object.assign(
				{ id: userId },
				data.displayName ? { displayName: data.displayName } : {},
				data.photoUrl ? { photoUrl: data.photoUrl } : {},
				data.statusMessage ? { statusMessage: data.statusMessage } : {},
			) satisfies UpdateGroupMemberInput;

			const groups = await fetchGroupsByUserId(userId);

			// 여러 그룹의 멤버 정보를 batch로 한 번에 업데이트
			if (groups.length > 0) {
				const batch = writeBatch(database);

				for (const group of groups) {
					const memberRef = doc(
						database,
						`groups/${group.id}/members/${userId}`,
					);
					batch.update(memberRef, processedData);
				}

				// batch 커밋
				await batch.commit();
			}

			return updatedUserData;
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'updateUser',
	'auth',
);

/**
 * 사용자 마지막 로그인 시간 업데이트
 */
export const updateLastLogin = withApiLogging(
	async (userId: string): Promise<void> => {
		try {
			const userService = getUserService();
			await userService.updateLastLogin(userId);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'updateLastLogin',
	'auth',
);

// userGroups

export const getUserGroups = withApiLogging(
	async (userId: string): Promise<UserGroup[] | null> => {
		try {
			const userService = getUserService();
			return await userService.getUserGroups(userId);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'getUserGroups',
	'auth',
);

export const createUserGroup = withApiLogging(
	async (userId: string, data: UserGroup): Promise<void> => {
		try {
			const userService = getUserService();
			await userService.createUserGroup(userId, data);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'createUserGroup',
	'auth',
);

export const updateUserGroup = withApiLogging(
	async (userId: string, data: UserGroup): Promise<void> => {
		try {
			const userService = getUserService();
			await userService.updateUserGroup(userId, data);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'updateUserGroup',
	'auth',
);
export const updateAllUserGroup = withApiLogging(
	async (userId: string, data: UserGroup[]): Promise<void> => {
		try {
			const userService = getUserService();
			await userService.updateAllUserGroup(userId, data);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'updateAllUserGroup',
	'auth',
);

export const removeUserGroup = withApiLogging(
	async (userId: string, groupId: string): Promise<void> => {
		try {
			const userService = getUserService();
			await userService.removeUserGroup(userId, groupId);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'removeUserGroup',
	'auth',
);
