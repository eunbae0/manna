import { Heading } from '@/shared/components/heading';
import { VStack } from '#/components/ui/vstack';
import type { ViewProps } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import Divider from '@/shared/components/divider';

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
		<VStack space="2xl" {...props}>
			<HStack className="items-center justify-between">
				<Heading size="2xl" className="text-typography-900">
					{title}
				</Heading>
			</HStack>
			{children}
			<Divider />
		</VStack>
	);
}
