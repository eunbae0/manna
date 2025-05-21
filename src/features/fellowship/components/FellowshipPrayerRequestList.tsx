import type React from 'react';
import { VStack } from '#/components/ui/vstack';
import { Avatar } from '@/components/common/avatar';
import { Text } from '@/shared/components/text';
import { HStack } from '#/components/ui/hstack';
import type {
	ClientFellowshipAnswerField,
} from '@/features/fellowship/api/types';
import AnimatedPressable from '@/components/common/animated-pressable';
import { openProfile } from '@/shared/utils/router';

type FellowshipPrayerRequestListProps = {
	answers: ClientFellowshipAnswerField[];
};

export default function FellowshipPrayerRequestList({
	answers: existedAnswers,
}: FellowshipPrayerRequestListProps) {
	return (
		<>
			<VStack space="xl" className="pl-2">
				{existedAnswers.map((answer) => (
					<VStack key={answer.member.id}>
						<VStack space="sm" className="">
							<AnimatedPressable
								onPress={() =>
									!answer.member.isGuest && openProfile(answer.member.id)
								}
							>
								<HStack space="sm" className="items-center">
									<Avatar
										size="2xs"
										photoUrl={answer.member.photoUrl || undefined}
									/>
									<Text
										size="md"
										className="font-pretendard-bold text-typography-600"
									>
										{answer.member.displayName}
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
		</>
	);
}
