import { Pressable, View } from 'react-native';
import { Text } from '@/shared/components/text';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { ChevronRight } from 'lucide-react-native';

type Props = {
	title: string;
	description: string;
	lottieView: React.JSX.Element;
	onPress: () => void;
};

export function HomeBannerItem({
	title,
	description,
	lottieView,
	onPress,
}: Props) {
	return (
		<Pressable onPress={onPress}>
			<View className="relative mx-4 bg-background-100/70 h-[80px] rounded-2xl overflow-hidden border border-primary-100">
				<HStack className="w-full h-[80px] pl-5 pr-2 items-center justify-between">
					<VStack space="xs">
						<Text size="lg" className="text-typography-700">
							{description}
						</Text>
						<HStack className="gap-px items-center">
							<Text size="xl" weight="bold" className="text-typography-900">
								{title}
							</Text>
							<Icon as={ChevronRight} className="text-typography-900" />
						</HStack>
					</VStack>
					{lottieView}
				</HStack>
			</View>
		</Pressable>
	);
}
