import { useQuery } from '@tanstack/react-query';
import { getUser } from '../../../api/user';
import type { ClientUser } from '@/shared/types';

/**
 * 사용자 쿼리 키
 */
export const userKeys = {
	all: ['user'] as const,
	profile: (userId?: string) => [...userKeys.all, 'profile', userId] as const,
};

/**
 * 사용자 프로필 조회 훅
 * @param userId 사용자 ID (없으면 현재 로그인한 사용자)
 * @param currentUser 현재 로그인한 사용자 (userId가 없을 때 사용)
 */
export function useUserProfile(
	userId?: string,
	currentUser?: ClientUser | null,
) {
	return useQuery({
		queryKey: userKeys.profile(userId),
		queryFn: async (): Promise<ClientUser | null> => {
			if (userId) {
				return getUser(userId);
			}

			// userId가 없으면 현재 로그인한 사용자 정보 반환
			return currentUser || null;
		},
		enabled: !!userId || !!currentUser,
	});
}
