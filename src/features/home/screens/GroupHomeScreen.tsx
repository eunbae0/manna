import HomeHeader from '@/features/home/HomeHeader';
import HomeList from '@/features/home/HomeList';
import { useGroups } from '../group/hooks/useGroups';
import { useAuthStore } from '@/store/auth';
import { HomeHeaderSkeleton } from '@/features/home/components/HomeHeaderSkeleton';

export default function GroupHomeScreen() {
	const { user } = useAuthStore();

	const { groups, isLoading } = useGroups(user?.groups ?? []);

	return (
		<>
			{isLoading ? <HomeHeaderSkeleton /> : <HomeHeader groups={groups} />}
			<HomeList />
		</>
	);
}
