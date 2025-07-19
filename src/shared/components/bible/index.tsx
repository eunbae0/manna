import type { ViewProps } from 'react-native';
import { VStack } from '#/components/ui/vstack';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import type { SelectedBible } from '@/features/bible/types/selectedBible';
import { Plus } from 'lucide-react-native';
import { X } from 'lucide-react-native';
import { cn } from '@/shared/utils/cn';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useRedirectBible } from '@/shared/hooks/useRedirectBible';

type Props = {
	selectedBible: SelectedBible[];
	setSelectedBible?: React.Dispatch<React.SetStateAction<SelectedBible[]>>;
	handleOpenBibleSelector?: () => void;
	deleteBible?: (selectedBible: SelectedBible) => void;
	isReadonly?: boolean;
} & ViewProps;

export function SelectedBibleList({
	selectedBible,
	setSelectedBible,
	handleOpenBibleSelector,
	deleteBible,
	isReadonly = false,
	className,
	...props
}: Props) {
	const handlePressDeleteButton = (verse: SelectedBible) => {
		setSelectedBible?.((prev) => prev.filter((v) => v.title !== verse.title));
		deleteBible?.(verse);
	};

	const { redirectToBible } = useRedirectBible();
	return (
		<>
			{selectedBible.map((verse) => (
				<VStack
					key={verse.title}
					className={cn(isReadonly && 'gap-2', className)}
					{...props}
				>
					<HStack className="items-center justify-between">
						<Text size="xl" weight="medium" className="text-typography-800">
							{verse.title}
						</Text>
						{!isReadonly && (
							<Button
								variant="text"
								size="sm"
								onPress={() => handlePressDeleteButton(verse)}
							>
								<ButtonText className="text-red-600">지우기</ButtonText>
								<ButtonIcon as={X} className="text-red-600" />
							</Button>
						)}
					</HStack>
					<VStack className="gap-px">
						{verse.content.map((content) => (
							<AnimatedPressable
								scale="sm"
								disabled={!isReadonly}
								key={content.verse}
								onPress={() => {
									redirectToBible({
										book: content.bookId,
										chapter: content.chapter,
										verse: content.verse,
									});
								}}
							>
								<VStack key={content.verse}>
									<HStack space="xs">
										<Text
											size="sm"
											weight="medium"
											className="text-primary-600/55"
										>
											{' '}
											{content.verse}.
										</Text>
										<Text
											size="sm"
											weight="regular"
											className="text-typography-600 flex-1"
										>
											{content.text}
										</Text>
									</HStack>
								</VStack>
							</AnimatedPressable>
						))}
					</VStack>
				</VStack>
			))}
			{!isReadonly && (
				<HStack className="items-center justify-center mt-2 pb-4">
					<Button
						onPress={handleOpenBibleSelector}
						variant="text"
						size="md"
						fullWidth
					>
						<ButtonText>설교 본문 추가하기</ButtonText>
						<ButtonIcon as={Plus} />
					</Button>
				</HStack>
			)}
		</>
	);
}
