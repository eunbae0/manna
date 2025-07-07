import HomeHeader from '@/features/group/components/GroupHomeHeader';
import HomeList from '@/features/group/components/GroupHomeList';
import { useGroups } from '@/features/group/hooks/useGroups';
import { useAuthStore } from '@/store/auth';
import { GroupHomeHeaderSkeleton } from '@/features/group/components/GroupHomeHeaderSkeleton';

export default function GroupHomeScreen() {
	const { user } = useAuthStore();

	const { groups, isLoading } = useGroups(user?.groups ?? []);

	return (
		<>
			{isLoading ? <GroupHomeHeaderSkeleton /> : <HomeHeader groups={groups} />}
			<HomeList />
		</>
	);
}
