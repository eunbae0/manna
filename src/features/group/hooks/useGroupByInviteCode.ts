import { fetchGroupByInviteCode } from '@/api/group';
import { useQuery } from '@tanstack/react-query';

const GROUP_BY_INVITE_CODE_QUERY_KEY = 'group_by_invite_code';

export function useGroupByInfiteCode(inviteCode: string) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: [GROUP_BY_INVITE_CODE_QUERY_KEY, inviteCode],
		queryFn: async () => {
			return await fetchGroupByInviteCode(inviteCode);
		},
		enabled: !!inviteCode,
	});

	return { group: data, isLoading, error, refetch };
}
