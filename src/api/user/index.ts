import { getUserService } from './service';
import type {
	ClientUser,
	AuthType,
	UpdateUserInput,
	UserGroup,
} from '@/shared/types';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';
import { generateRandomDisplayName } from '@/shared/utils/nameGenerator';

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
	async (userId: string, data: UpdateUserInput): Promise<void> => {
		try {
			const userService = getUserService();
			await userService.updateUser(userId, data);
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
