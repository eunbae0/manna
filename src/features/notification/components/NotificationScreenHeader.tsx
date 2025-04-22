import { HStack } from '#/components/ui/hstack';
import { Heading } from '@/shared/components/heading';
import { Button, ButtonIcon } from '@/components/common/button';
import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';

export function NotificationScreenHeader() {
	return (
		<HStack className="pl-5 pr-3 pt-4 pb-7 items-center justify-between">
			<Heading size="2xl">알림센터</Heading>
			<Button
				variant="icon"
				size="lg"
				onPress={() => {
					router.push('/(app)/(more)/notification');
				}}
			>
				<ButtonIcon as={Settings} />
			</Button>
		</HStack>
	);
}
