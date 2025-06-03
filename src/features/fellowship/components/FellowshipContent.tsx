import React from 'react';
import { VStack } from '#/components/ui/vstack';
import { Avatar } from '@/components/common/avatar';
import { Text } from '@/shared/components/text';
import { HStack } from '#/components/ui/hstack';
import { Edit3, CircleHelp } from 'lucide-react-native';
import { Button, ButtonIcon } from '@/components/common/button';
import AnimatedPressable from '@/components/common/animated-pressable';
import { openProfile } from '@/shared/utils/router';
import { useFellowship } from '../hooks/useFellowship';
import { router } from 'expo-router';
import { Box } from '#/components/ui/box';
import { Icon } from '#/components/ui/icon';
import type { ClientFellowship, ClientFellowshipParticipantV2, FellowshipContentItemV2 } from '@/features/fellowship/api/types';
import { useMemo } from 'react';
import { cn } from '@/shared/utils/cn';

type SermonContentItemProps = {
	fellowshipId: string;
	contentType: keyof ClientFellowship['content'];
	fellowshipContent: FellowshipContentItemV2;
	enableReply: boolean;
};

export default React.memo(function FellowshipContent({
	fellowshipId,
	contentType,
	fellowshipContent,
	enableReply,
}: SermonContentItemProps) {
	const { id: contentId, title, answers } = fellowshipContent;

	const { fellowship } = useFellowship(fellowshipId);

	if (!fellowship) {
		return null;
	}

	const handlePressSummaryButton = () => {
		router.push({
			pathname: `/(app)/(fellowship)/${fellowshipId}/answer`,
			params: { contentType, answerId: contentId },
		});
	};

	const answersWithParticipant = useMemo(() => {
		if (!answers || !fellowship?.info.participants) return [];

		return fellowship.info.participants
			.filter(participant => answers[participant.id]) // 답변이 있는 참가자만 필터링
			.map(participant => ({
				participant,
				content: answers[participant.id] || '',
			}));
	}, [answers, fellowship?.info.participants]);

	return (
		<>
			<VStack space="2xl">
				{contentType !== 'prayerRequest' && <HStack space="xs" className="items-center justify-between">
					<HStack space="xs" className="items-start flex-1">
						<Box className="p-1 rounded-full bg-primary-100">
							<Icon as={CircleHelp} size="md" className="text-primary-500" />
						</Box>
						<Text size="xl" className="font-pretendard-semi-bold flex-1 mr-2 mt-[2px]">
							{title}
						</Text>
					</HStack>
					{enableReply && (
						<Button variant="icon" onPress={handlePressSummaryButton}>
							<ButtonIcon as={Edit3} />
						</Button>
					)}
				</HStack>}
				<VStack space="xl" className={cn("pl-2", answersWithParticipant.length !== 0 && "pb-6")}>
					{answersWithParticipant.map((answer) => (
						<AnswerItem
							key={answer.participant?.id}
							answer={answer}
						/>
					))}
				</VStack>
			</VStack>
		</>
	);
})

function AnswerItem({
	answer,
}: {
	answer: {
		participant: ClientFellowshipParticipantV2;
		content: string;
	};
}) {
	return (
		<VStack key={answer.participant?.id}>
			<VStack space="sm" className="">
				<AnimatedPressable
					scale="sm"
					onPress={() =>
						!answer.participant?.isGuest &&
						openProfile(answer.participant?.id)
					}
				>
					<HStack space="sm" className="items-center">
						<Avatar
							size="2xs"
							photoUrl={answer.participant?.photoUrl || undefined}
						/>
						<Text
							size="md"
							className="font-pretendard-bold text-typography-600"
						>
							{answer.participant?.displayName}
						</Text>
					</HStack>
				</AnimatedPressable>
				<Text size="lg" className="mx-1">
					{answer.content}
				</Text>
			</VStack>
		</VStack>
	)
}
