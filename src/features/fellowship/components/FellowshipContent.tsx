import type React from 'react';
import { VStack } from '#/components/ui/vstack';
import { Avatar } from '@/components/common/avatar';
import { Text } from '@/shared/components/text';
import { HStack } from '#/components/ui/hstack';
import { Edit3, CircleHelp } from 'lucide-react-native';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import type {
	ClientFellowshipContentField,
} from '@/features/fellowship/api/types';
import AnimatedPressable from '@/components/common/animated-pressable';
import { openProfile } from '@/shared/utils/router';
import { useFellowship } from '../hooks/useFellowship';
import { router } from 'expo-router';
import { Box } from '#/components/ui/box';
import { Icon } from '#/components/ui/icon';

type SermonContentItemProps = {
	fellowshipId: string;
	index?: number;
	contentType: 'iceBreaking' | 'sermonTopic';
	fellowshipContent: ClientFellowshipContentField;
	enableReply: boolean;
};

export default function FellowshipContent({
	fellowshipId,
	index,
	contentType,
	fellowshipContent,
	enableReply,
}: SermonContentItemProps) {
	const { id: contentId, question, answers: existedAnswers } = fellowshipContent;

	const {
		fellowship,
	} = useFellowship(fellowshipId);

	if (!fellowship) {
		return null;
	}

	const handlePressSummaryButton = () => {
		router.push({
			pathname: `/(app)/(fellowship)/${fellowshipId}/answer`,
			params: { contentType, index: index?.toString() || undefined }
		});
	}

	return (
		<>
			<VStack space="2xl" className="">
				<HStack space="sm" className="items-center justify-between">
					<Box className="p-2 rounded-full bg-primary-100">
						<Icon as={CircleHelp} size="lg" className="text-primary-500" />
					</Box>
					<Text size="xl" className="font-pretendard-semi-bold flex-1 mr-2">
						{question}
					</Text>
					{enableReply && (
						<Button variant="icon" onPress={handlePressSummaryButton}>
							<ButtonIcon as={Edit3} />
						</Button>
					)}
				</HStack>
				<VStack space="xl" className="pl-2">
					{existedAnswers.map((answer) => (
						<VStack key={answer.member?.id}>
							<VStack space="sm">
								<AnimatedPressable
									onPress={() =>
										!answer.member?.isGuest && openProfile(answer.member?.id)
									}
								>
									<HStack space="sm" className="items-center">
										<Avatar
											size="2xs"
											photoUrl={answer.member?.photoUrl || undefined}
										/>
										<Text
											size="md"
											className="font-pretendard-bold text-typography-600"
										>
											{answer.member?.displayName}
										</Text>
									</HStack>
								</AnimatedPressable>
								<Text size="lg" className="flex-1 mx-1">
									{answer.value}
								</Text>
							</VStack>
						</VStack>
					))}
				</VStack>
			</VStack>
		</>
	);
}
