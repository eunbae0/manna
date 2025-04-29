import { HStack } from '#/components/ui/hstack';
import { Heading } from '@/shared/components/heading';
import { Button, ButtonIcon } from '@/components/common/button';
import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { cn } from '@/shared/utils/cn';
import { isIOS } from '@/shared/utils/platform';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';

export function NotificationScreenHeader() {
	return (
		<HStack
			className={cn(
				isIOS ? 'pt-5' : 'pt-6',
				'pl-5 pr-3 pb-4 items-center justify-between',
			)}
		>
			<Heading size="2xl">알림센터</Heading>
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
		</HStack>
	);
}
