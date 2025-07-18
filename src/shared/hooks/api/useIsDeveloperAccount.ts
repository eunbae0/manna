import { isDeveloper } from '@/api/feedback/service';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';

const DEVELOPER_STATUS_KEY = ['isDeveloper'];

export function useIsDeveloperAccount(enabled?: boolean | undefined) {
	const { user } = useAuthStore();
	return useQuery({
		queryKey: [...DEVELOPER_STATUS_KEY, user?.id],
		queryFn: async () => {
			if (!user) return false;
			return isDeveloper(user.id);
		},
		enabled: enabled !== undefined ? enabled : !!user,
		staleTime: Number.POSITIVE_INFINITY, // 개발자 상태는 세션 내에서 변경되지 않음
		gcTime: Number.POSITIVE_INFINITY,
	});
}
