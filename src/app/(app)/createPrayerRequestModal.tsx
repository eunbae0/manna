import { CreatePrayerRequestScreen } from '@/components/home/screens/CreatePrayerRequestScreen';
import { getKSTDate } from '@/utils/date';

/**
 * Modal screen for creating a new prayer request
 * This is a wrapper component that uses the implementation from components/home/screens
 */
export default function CreatePrayerRequestModal() {
	return <CreatePrayerRequestScreen date={getKSTDate(new Date())} />;
}
