import type { ViewProps } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import { Button, ButtonIcon } from '#/components/ui/button';
import { ChevronLeftIcon } from '#/components/ui/icon';
import { Divider } from '#/components/ui/divider';
import { VStack } from '#/components/ui/vstack';
import { cn } from '@/shared/utils/cn';
import { router } from 'expo-router';

type Props = {
	label?: string;
	onPressBackButton?: () => void;
	onPressBackButtonWithRouter?: () => void;
	isLabelCentered?: boolean;
	isDividerEnabled?: boolean;
} & ViewProps;

function Header({
	label = '',
	onPressBackButton,
	onPressBackButtonWithRouter,
	isLabelCentered = false,
	isDividerEnabled = false,
	children,
	className,
	...props
}: Props) {
	const defaultHandlePressBackButton = () => {
		router.canGoBack() ? router.back() : router.dismissAll();
	};
	const handlePressBackButton = () => {
		if (onPressBackButtonWithRouter) {
			onPressBackButtonWithRouter();
			defaultHandlePressBackButton();
			return;
		}
		if (onPressBackButton) {
			onPressBackButton();
			return;
		}
		defaultHandlePressBackButton();
	};

	return (
		<VStack space="xs">
			<HStack
				className={cn('w-full relative items-center', className)}
				{...props}
			>
				<HStack space="sm" className="items-center">
					<Button
						size="xl"
						variant="link"
						onPress={handlePressBackButton}
						className="pl-3"
					>
						<ButtonIcon as={ChevronLeftIcon} className="w-8 h-8" />
					</Button>
					<Text
						size="2xl"
						className={cn(
							'font-pretendard-semi-bold',
							isLabelCentered
								? 'absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2'
								: '',
						)}
					>
						{label}
					</Text>
				</HStack>
				{children}
			</HStack>
			{isDividerEnabled && <Divider />}
		</VStack>
	);
}

export default Header;
