import type { ViewProps } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import { Button, ButtonIcon } from '#/components/ui/button';
import { ChevronLeftIcon } from '#/components/ui/icon';
import { Divider } from '#/components/ui/divider';
import { VStack } from '#/components/ui/vstack';

type Props = {
	label: string;
	onPressBackButton: () => void;
} & ViewProps;

function Header({ label, onPressBackButton, children, ...props }: Props) {
	return (
		<VStack space="xs">
			<HStack space="md" className="ml-4 items-center" {...props}>
				<Button size="xl" variant="link" onPress={onPressBackButton}>
					<ButtonIcon as={ChevronLeftIcon} />
				</Button>
				{/* <IconSymbol
						size={28}
						name="chevron.left"
						color=""
						// color={colors['neutral-900']}
					/> */}
				<Text bold={true} size="xl">
					{label}
				</Text>
				{children}
			</HStack>
			<Divider />
		</VStack>
	);
}

export default Header;
