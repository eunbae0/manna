import { CreatePrayerRequestScreen } from '@/features/home/screens/CreatePrayerRequestScreen';
import { getKSTDate } from '@/shared/utils/date';

/**
 * Modal screen for creating a new prayer request
 * This is a wrapper component that uses the implementation from components/home/screens
 */
export default function CreatePrayerRequestModal() {
	return <CreatePrayerRequestScreen />;
}
