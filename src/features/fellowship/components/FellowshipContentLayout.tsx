import { Heading } from '@/shared/components/heading';
import { VStack } from '#/components/ui/vstack';
import type { ViewProps } from 'react-native';
import { Button, ButtonIcon } from '@/components/common/button';
import { Edit3 } from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';

type Props = ViewProps & {
	title: string;
	onPressEdit?: () => void;
	enableReply?: boolean;
};

export default function FellowshipContentLayout({
	title,
	children,
	enableReply,
	onPressEdit,
	...props
}: Props) {
	return (
		<VStack space="lg" {...props}>
			<HStack className="items-center justify-between">
				<Heading size="xl" className="text-typography-900">
					{title}
				</Heading>
				{enableReply && (
					<Button variant="icon" onPress={onPressEdit}>
						<ButtonIcon as={Edit3} />
					</Button>
				)}
			</HStack>
			{children}
		</VStack>
	);
}
