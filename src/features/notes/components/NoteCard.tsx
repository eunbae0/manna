import type { FC } from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { Card } from '#/components/ui/card';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import type { Note } from '@/api/notes/types';
import AnimatedPressable from '@/components/common/animated-pressable';
import { shadowStyle } from '@/shared/styles/shadow';

export const NoteCard = ({
	id,
	title,
	date,
	content,
}: Omit<Note, 'worshipType' | 'sermon' | 'preacher'>) => {
	return (
		<AnimatedPressable style={shadowStyle.shadow} onPress={() => router.push(`/(app)/(note)/${id}`)}>
			<Card className="bg-white border border-gray-300 rounded-2xl">
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
									return date.toDate().toLocaleDateString('ko-KR', {
										year: 'numeric',
										month: '2-digit',
										day: '2-digit',
									});
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
			</Card>
		</AnimatedPressable>
	);
};
