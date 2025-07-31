import React from 'react';
import { VStack } from '#/components/ui/vstack';
import { Avatar } from '@/components/common/avatar';
import { Text } from '@/shared/components/text';
import { HStack } from '#/components/ui/hstack';
import { MessageCircleQuestionMark, Pen } from 'lucide-react-native';
import AnimatedPressable from '@/components/common/animated-pressable';
import { openProfile } from '@/shared/utils/router';
import { useFellowship } from '../hooks/useFellowship';
import { router } from 'expo-router';
import { Box } from '#/components/ui/box';
import { Icon } from '#/components/ui/icon';
import type {
	ClientFellowship,
	ClientFellowshipParticipantV2,
	FellowshipContentItemV2,
} from '@/features/fellowship/api/types';
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
			.filter((participant) => answers[participant.id]) // 답변이 있는 참가자만 필터링
			.map((participant) => ({
				participant,
				content: answers[participant.id] || '',
			}));
	}, [answers, fellowship?.info.participants]);

	const replyLabel = useMemo(() => {
		switch (contentType) {
			case 'prayerRequest':
				return '기도제목 작성하기';
			default:
				return '답변 작성하기';
		}
	}, [contentType]);

	return (
		<>
			<VStack space="2xl">
				{contentType !== 'prayerRequest' && (
					<HStack space="xs" className="items-center justify-between">
						<HStack space="sm" className="items-start flex-1">
							<Icon
								as={MessageCircleQuestionMark}
								size="lg"
								className="text-primary-400 mt-[2px]"
							/>
							<Text
								size="xl"
								weight="semi-bold"
								className="text-typography-800 flex-1 mr-2"
							>
								{title}
							</Text>
						</HStack>
					</HStack>
				)}
				<VStack
					space="4xl"
					className={cn(answersWithParticipant.length !== 0 && 'pb-6')}
				>
					{answersWithParticipant.map((answer) => (
						<AnswerItem key={answer.participant?.id} answer={answer} />
					))}
				</VStack>
				{enableReply && (
					<AnimatedPressable onPress={handlePressSummaryButton}>
						<HStack
							space="sm"
							className="items-center mb-2 px-4 py-2 bg-background-200/45 rounded-full self-center"
						>
							<Text
								weight="semi-bold"
								size="lg"
								className="text-typography-600"
							>
								{replyLabel}
							</Text>
							<Icon as={Pen} size="sm" className="text-typography-600" />
						</HStack>
					</AnimatedPressable>
				)}
			</VStack>
		</>
	);
});

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
					onPress={() =>
						!answer.participant?.isGuest && openProfile(answer.participant?.id)
					}
					className="self-start"
				>
					<HStack className="items-center gap-[6px]">
						<Avatar
							size="2xs"
							photoUrl={answer.participant?.photoUrl || undefined}
						/>
						<Text size="lg" weight="semi-bold" className="text-typography-600">
							{answer.participant?.displayName}
						</Text>
					</HStack>
				</AnimatedPressable>
				<Box className="px-4 py-3 bg-background-100/60 rounded-xl">
					<Text size="lg" className="text-typography-800">
						{answer.content}
					</Text>
				</Box>
			</VStack>
		</VStack>
	);
}
