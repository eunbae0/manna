import { getUserService } from './service';
import type { ClientUser, UpdateUserInput } from './types';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';
import { arrayUnion } from '@react-native-firebase/firestore';
import { getAuthService } from '../auth/service';
import type { AuthType } from '@/shared/types';

/**
 * 사용자 프로필 조회
 */
export const getUser = withApiLogging(
	async (userId: string): Promise<ClientUser | null> => {
		try {
			const authService = getUserService();
			return await authService.getUser(userId);
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
	): Promise<void> => {
		try {
			const authService = getUserService();
			await authService.createUser(userId, userData);
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
			const authService = getUserService();
			const { groups, ...firestoreUserData } = data;

			await authService.updateUser(userId, {
				...firestoreUserData,
				//@ts-expect-error: groups can be FieldValue
				groups: arrayUnion(...(data.groups || [])),
			});
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
			const authService = getUserService();
			await authService.updateLastLogin(userId);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'updateLastLogin',
	'auth',
);
