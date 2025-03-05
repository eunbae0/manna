import type { ViewProps } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import { Button, ButtonIcon } from '#/components/ui/button';
import { ChevronLeftIcon } from '#/components/ui/icon';
import { Divider } from '#/components/ui/divider';
import { VStack } from '#/components/ui/vstack';
import { cn } from '@/utils/cn';

type Props = {
	label: string;
	onPressBackButton: () => void;
	isLabelCentered?: boolean;
	isDividerEnabled?: boolean;
} & ViewProps;

function Header({
	label,
	onPressBackButton,
	isLabelCentered = false,
	isDividerEnabled = false,
	children,
	...props
}: Props) {
	return (
		<VStack space="xs">
			<HStack space="sm" className="pl-3 items-center" {...props}>
				<Button size="xl" variant="link" onPress={onPressBackButton}>
					<ButtonIcon as={ChevronLeftIcon} className="w-8 h-8" />
				</Button>
				<Text
					size="2xl"
					className={cn(
						'font-pretendard-semi-bold',
						isLabelCentered ? 'absolute left-0 right-0 text-center' : '',
					)}
				>
					{label}
				</Text>
				{children}
			</HStack>
			{isDividerEnabled && <Divider />}
		</VStack>
	);
}

export default Header;
