import { HStack } from '#/components/ui/hstack';
import { Button, ButtonText } from '@/components/common/button';

export const NotificationController = () => {
	return (
		<HStack>
			<Button>
				<ButtonText>모두 읽음으로 표시</ButtonText>
			</Button>
		</HStack>
	);
};
