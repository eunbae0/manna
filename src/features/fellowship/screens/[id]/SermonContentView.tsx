import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { Avatar } from '@/components/common/avatar';
import type { ClientFellowshipContentField } from '@/features/fellowship/api/types';

interface SermonContentViewProps {
	sermonTopic: ClientFellowshipContentField[];
}

export default function SermonContentView({
	sermonTopic,
}: SermonContentViewProps) {
	if (!sermonTopic || sermonTopic.length === 0) {
		return (
			<Text className="text-typography-500 italic">말씀 내용이 없어요.</Text>
		);
	}

	return (
		<VStack space="md">
			{sermonTopic.map((topic) => (
				<VStack key={topic.id} space="sm">
					<Text className="font-medium">{topic.question}</Text>
					<VStack space="xs">
						{topic.answers.map((answer) => (
							<HStack
								key={`${topic.id}-${answer.member.id || Math.random().toString(36).substring(7)}`}
								space="xs"
								className="items-start"
							>
								<Avatar
									size="xs"
									label={answer.member.displayName || ''}
									photoUrl={answer.member.photoUrl || ''}
								/>
								<Text className="flex-1">{answer.value}</Text>
							</HStack>
						))}
					</VStack>
				</VStack>
			))}
		</VStack>
	);
}
