import { useLocalSearchParams } from 'expo-router';
import FellowshipDetailScreen from '@/features/fellowship/screens/[id]/FellowshipDetailScreen';

export default function FellowshipDetailScreenContainer() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return <FellowshipDetailScreen id={id || ''} />;
}
