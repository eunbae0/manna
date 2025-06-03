import type React from 'react';
import { VStack } from '#/components/ui/vstack';
import { Avatar } from '@/components/common/avatar';
import { Text } from '@/shared/components/text';
import { HStack } from '#/components/ui/hstack';
import type {
	ClientFellowshipAnswerV2,
} from '@/features/fellowship/api/types';
import AnimatedPressable from '@/components/common/animated-pressable';
import { openProfile } from '@/shared/utils/router';

type FellowshipPrayerRequestListProps = {
	answers: ClientFellowshipAnswerV2[];
};

export default function FellowshipPrayerRequestList({
	answers: existedAnswers,
}: FellowshipPrayerRequestListProps) {
	return (
		<>
			<VStack space="xl" className="pl-2">
				{existedAnswers.map((answer) => (
					<VStack key={answer.participant.id}>
						<VStack space="sm" className="">
							<AnimatedPressable
								onPress={() =>
									!answer.participant.isGuest && openProfile(answer.participant.id)
								}
							>
								<HStack space="sm" className="items-center">
									<Avatar
										size="2xs"
										photoUrl={answer.participant.photoUrl || undefined}
									/>
									<Text
										size="md"
										className="font-pretendard-bold text-typography-600"
									>
										{answer.participant.displayName}
									</Text>
								</HStack>
							</AnimatedPressable>
							<Text size="lg" className="mx-1">
								{answer.content}
							</Text>
						</VStack>
					</VStack>
				))}
			</VStack>
		</>
	);
}
