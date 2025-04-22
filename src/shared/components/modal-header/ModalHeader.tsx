import { HStack } from '#/components/ui/hstack';
import { cn } from '@/shared/utils/cn';
import { Button, ButtonIcon } from '@/components/common/button';
import { Text } from '#/components/ui/text';
import { X, ChevronLeft } from 'lucide-react-native';
import { isAndroid } from '@/shared/utils/platform';

type Props = {
	title: string;
	onBackPress?: () => void;
};

export const ModalHeader = ({ title, onBackPress }: Props) => {
	return (
		<HStack
			className={cn(
				'relative items-center font-pretendard-semi-bold',
				isAndroid ? 'justify-start' : 'justify-end',
			)}
		>
			{isAndroid && (
				<Button className="ml-2" variant="icon" onPress={onBackPress} size="lg">
					<ButtonIcon as={ChevronLeft} />
				</Button>
			)}
			<Text
				size="xl"
				className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 font-pretendard-semi-bold"
			>
				{title}
			</Text>
			{!isAndroid && (
				<Button className="mr-3" size="lg" variant="icon" onPress={onBackPress}>
					<ButtonIcon as={X} />
				</Button>
			)}
		</HStack>
	);
};
