import GroupHomeScreen from '@/features/group/screens/GroupHomeScreen';

export default function HomeScreen() {
	return <GroupHomeScreen />
	// const { user } = useAuthStore();
	// const isGroup = (user?.groups?.length ?? 0) > 0;
	// return isGroup ? (
	// 	<GroupHomeScreen />
	// ) : (
	// 	<EmptyGroupHomeScreen />
	// )
}
