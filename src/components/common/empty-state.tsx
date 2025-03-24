import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Heading } from '#/components/ui/heading';
import { Icon } from '#/components/ui/icon';
import { AlertCircle } from 'lucide-react-native';

type EmptyStateProps = {
	title: string;
	description: string;
	icon?: React.ReactNode;
};

export function EmptyState({
	title,
	description,
	icon = <Icon as={AlertCircle} size="xl" className="text-typography-400" />,
}: EmptyStateProps) {
	return (
		<VStack className="items-center justify-center py-8 px-4" space="md">
			{icon}
			<VStack className="items-center" space="xs">
				<Heading size="md" className="text-center">
					{title}
				</Heading>
				<Text className="text-center text-typography-500">{description}</Text>
			</VStack>
		</VStack>
	);
}
