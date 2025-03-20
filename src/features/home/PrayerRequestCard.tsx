import { Button, ButtonIcon, ButtonText } from '#/components/ui/button';
import { Card } from '#/components/ui/card';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { togglePrayerRequestReaction } from '@/api/prayer-request';
import type { ClientPrayerRequest, Member } from '@/api/prayer-request/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserRound, Heart } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text } from '#/components/ui/text';
import { Icon } from '#/components/ui/icon';
import type { YYYYMMDD } from '@/shared/types/date';
import { useAuthStore } from '@/store/auth';
import { Avatar } from '../../components/common/avatar';

type Props = {
	prayerRequest: ClientPrayerRequest;
	member: Member;
	selectedDate: YYYYMMDD;
};

const PrayerRequestCard = ({ prayerRequest, member, selectedDate }: Props) => {
	const { currentGroup } = useAuthStore();
	const queryClient = useQueryClient();
	const hasLiked = prayerRequest.reactions.some(
		(reaction) => reaction.type === 'LIKE' && reaction.member.id === member.id,
	);

	const { mutate: toggleLike } = useMutation({
		mutationFn: async () => {
			return togglePrayerRequestReaction(
				currentGroup?.groupId || '',
				prayerRequest.id,
				{
					type: 'LIKE',
					member,
				},
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [
					'prayer-requests',
					currentGroup?.groupId || '',
					selectedDate,
				],
			});
		},
	});

	// Create a double tap gesture
	const doubleTap = Gesture.Tap()
		.maxDuration(250)
		.numberOfTaps(2)
		.onEnd(() => {
			// TODO: Fix crash when executed
			// toggleLike();
		});

	return (
		<GestureDetector gesture={doubleTap}>
			<Card variant="filled" className="bg-background-0 rounded-2xl">
				<VStack space="lg" className="pb-4">
					<HStack space="sm" className="items-center">
						<Avatar size="sm" className="bg-primary-400" />
						<Text size="lg" className="font-pretendard-bold">
							{prayerRequest.member.displayName || '익명'}
						</Text>
					</HStack>
					<Text size="lg" className="">
						{prayerRequest.value}
					</Text>
				</VStack>
				<Button
					variant="outline"
					size="xs"
					className={`z-10 absolute -bottom-4 right-4 rounded-full ${hasLiked ? 'bg-primary-50' : 'bg-white'}`}
					onPress={() => toggleLike()}
				>
					<ButtonIcon
						size="sm"
						as={Heart}
						className={
							hasLiked ? 'stroke-primary-500 fill-primary-500' : 'color-black'
						}
					/>
					<HStack space="xs">
						<ButtonText
							size="sm"
							className={hasLiked ? 'text-primary-500' : ''}
						>
							{prayerRequest.reactions.length}
						</ButtonText>
					</HStack>
				</Button>
			</Card>
		</GestureDetector>
	);
};

export { PrayerRequestCard };
