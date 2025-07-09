import MainHomeScreen from '@/features/home/screens/MainHomeScreen';

export default function HomeScreen() {
	return <MainHomeScreen />
	// const { user } = useAuthStore();
	// const isGroup = (user?.groups?.length ?? 0) > 0;
	// return isGroup ? (
	// 	<GroupHomeScreen />
	// ) : (
	// 	<EmptyGroupHomeScreen />
	// )
}
