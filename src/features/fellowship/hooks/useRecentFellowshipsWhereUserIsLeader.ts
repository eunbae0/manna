import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { fetchRecentFellowshipsWhereUserIsLeader } from '../api';

/**
 * 특정 유저가 **리더로** 참여한 나눔의 최근 목록을 조회하는 훅
 * @param userId 유저 ID
 * @returns 나눔 목록과 로딩 상태
 */
export function useRecentFellowshipsWhereUserIsLeader(userId: string) {
	const { currentGroup } = useAuthStore();
	const groupId = currentGroup?.groupId || '';

	return useQuery({
		queryKey: ['fellowships', 'recent', groupId, userId],
		queryFn: async () => {
			return await fetchRecentFellowshipsWhereUserIsLeader({
				groupId,
				userId,
			});
		},
		staleTime: 0, // 항상 stale 상태로 설정하여 매번 새로 가져옴
		refetchOnMount: true, // 컴포넌트 마운트시 항상 새로 가져옴
		refetchOnWindowFocus: true, // 윈도우 포커스 시 항상 새로 가져옴
		enabled: !!groupId && !!userId,
	});
}
