import HomeHeader from '@/features/home/HomeHeader';
import HomeList from '@/features/home/HomeList';
import { useGroups } from '../group/hooks/useGroups';
import { useAuthStore } from '@/store/auth';
import { Text } from 'react-native';

export default function GroupHomeScreen() {
	const { user } = useAuthStore();

	const { groups, isLoading, error } = useGroups(
		user?.groups?.map((g) => g.groupId) ?? [],
	);

	return (
		<>
			{isLoading ? <Text>로딩중</Text> : <HomeHeader groups={groups} />}
			<HomeList />
		</>
	);
}
