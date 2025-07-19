import type { ViewProps } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { Button, ButtonIcon } from '@/components/common/button';
import { ChevronLeft } from 'lucide-react-native';
import { Divider } from '#/components/ui/divider';
import { VStack } from '#/components/ui/vstack';
import { cn } from '@/shared/utils/cn';
import { router } from 'expo-router';
import { isAndroid } from '@/shared/utils/platform';
import { goBackOrReplaceHome } from '@/shared/utils/router';

type Props = {
	label?: string;
	labelSize?:
		| 'md'
		| 'sm'
		| 'lg'
		| 'xl'
		| '2xl'
		| 'xs'
		| '3xl'
		| '4xl'
		| '2xs'
		| '5xl'
		| '6xl';
	onPressBackButton?: () => void;
	onPressBackButtonWithRouter?: () => void;
	isLabelCentered?: boolean;
	isDividerEnabled?: boolean;
	disableBackButton?: boolean;
} & ViewProps;

function Header({
	label = '',
	labelSize = '2xl',
	onPressBackButton,
	onPressBackButtonWithRouter,
	isLabelCentered = false,
	isDividerEnabled = false,
	children,
	className,
	disableBackButton = false,
	...props
}: Props) {
	const defaultHandlePressBackButton = () => {
		goBackOrReplaceHome();
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
				className={cn(
					'w-full relative items-center',
					isAndroid && 'mt-4',
					className,
				)}
				{...props}
			>
				<HStack className="items-center">
					{!disableBackButton && (
						<Button
							size="xl"
							variant="icon"
							onPress={handlePressBackButton}
							className="ml-1"
						>
							<ButtonIcon as={ChevronLeft} />
						</Button>
					)}
					<Text
						size={labelSize}
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
