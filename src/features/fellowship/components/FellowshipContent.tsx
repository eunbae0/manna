import React from 'react';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { HStack } from '#/components/ui/hstack';
import { MessageCircleQuestionMark, Pen } from 'lucide-react-native';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useFellowship } from '../hooks/useFellowship';
import { router } from 'expo-router';
import { Icon } from '#/components/ui/icon';
import type {
	AnswerCommentWithAuthorInfo,
	AnswerContentWithAuthorInfo,
	ClientFellowship,
	FellowshipContentItemV2,
} from '@/features/fellowship/api/types';
import { useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { AnswerItem } from './answer/AnswerItem';
import { useGroupMembers } from '@/features/group/hooks/useGroupMembers';

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

	const { members: groupMembers } = useGroupMembers(
		fellowship?.identifiers.groupId ?? '',
	);

	if (!fellowship) {
		return null;
	}

	const handlePressSummaryButton = () => {
		router.push({
			pathname: `/(app)/(fellowship)/${fellowshipId}/answer`,
			params: { contentType, answerId: contentId },
		});
	};

	const answersWithParticipant: AnswerContentWithAuthorInfo[] = useMemo(() => {
		if (!answers || !fellowship?.info.participants) return [];

		return fellowship.info.participants
			.filter((participant) => {
				const answerContent = answers[participant.id];
				if (typeof answerContent === 'string') return !!answerContent;
				return !!answerContent?.content;
			}) // 답변이 있는 참가자만 필터링
			.map((author) => {
				const answerContent = answers[author.id];
				if (typeof answerContent === 'string') {
					return {
						author,
						commentCount: 0,
						comments: {},
						content: answerContent,
						reactions: {
							likes: [],
							likeCount: 0,
						},
						// answerContent,
					};
				}

				const commentsWithAuthorInfo = Object.entries(
					answerContent.comments || {},
				).reduce<Record<string, AnswerCommentWithAuthorInfo>>(
					(acc, [commentId, comment]) => {
						const commentAuthor = groupMembers.find(
							(p) => p.id === comment.authorId,
						);
						if (commentAuthor) {
							const { authorId, ...rest } = comment;
							acc[commentId] = {
								...rest,
								author: { ...commentAuthor, isGuest: false },
							};
						}
						return acc;
					},
					{},
				);

				return {
					author,
					...answerContent,
					comments: commentsWithAuthorInfo,
				};
			});
	}, [groupMembers, answers, fellowship?.info.participants]);

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
						<AnswerItem
							fellowshipId={fellowshipId}
							answerId={contentId}
							contentType={contentType}
							key={answer.author.id}
							answer={answer}
						/>
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
