import { router } from 'expo-router';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import type { Note } from '@/features/note/types';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Icon } from '#/components/ui/icon';
import { ChevronRight } from 'lucide-react-native';
import { shadowStyle } from '@/shared/styles/shadow';
import { formatLocalDate } from '@/shared/utils/date';

export const NoteCard = ({ note }: { note: Note }) => {
	const { id, title, date, content, worshipType } = note;
	return (
		<AnimatedPressable onPress={() => router.push(`/(app)/(note)/${id}`)}>
			<HStack
				style={shadowStyle.shadow}
				className="pl-4 pr-3 py-3 bg-background-50 rounded-2xl items-center justify-between"
			>
				<VStack space="xs">
					<Text size="xl" className="font-pretendard-semi-bold">
						{title}
					</Text>
					<HStack space="md" className="items-center">
						<Text
							size="md"
							className="font-pretendard-Regular text-typography-500"
						>
							{(() => {
								try {
									return formatLocalDate(new Date(date));
								} catch (error) {
									console.error('Error formatting date:', error);
									return 'Invalid date';
								}
							})()}
						</Text>
						<Text
							size="md"
							numberOfLines={1}
							className="font-pretendard-Regular text-typography-500 truncate max-w-[200px]"
						>
							{content.trim()}
						</Text>
					</HStack>
				</VStack>
				<Icon as={ChevronRight} size="xl" />
			</HStack>
		</AnimatedPressable>
	);
};
