import { Button, ButtonIcon } from '@/components/common/button';
import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import Header from '@/components/common/Header';

export function NotificationScreenHeader() {
	return (
		<Header label="알림 센터" className="justify-between pr-3 mb-5">
			<Button
				variant="icon"
				size="lg"
				onPress={() => {
					trackAmplitudeEvent('알림설정 클릭', {
						screen: 'Tab_Notification',
					});
					router.push('/(app)/(more)/(notification-setting)/setting-index');
				}}
			>
				<ButtonIcon as={Settings} />
			</Button>
		</Header>
	);
}
