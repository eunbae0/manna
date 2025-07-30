import { router } from 'expo-router';
import { joinGroup } from '@/api/group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GROUPS_QUERY_KEY } from './useGroups';
import { useToastStore } from '@/store/toast';
import type { JoinGroupInput } from '@/api/group/types';
import { useAuthStore } from '@/store/auth';
import { useOnboardingStore } from '@/store/onboarding';
import { routingToHome } from '@/shared/utils/router';
import { FEEDS_QUERY_KEY } from '@/features/feeds/hooks/useFeeds';

export function useJoinGroup(isOnboarding: boolean) {
	const { showInfo, showError } = useToastStore();
	const { user, addUserGroupProfile } = useAuthStore();
	const { submitOnboardingData } = useOnboardingStore();
	const queryClient = useQueryClient();

	const joinGroupMutation = useMutation({
		mutationFn: async ({ inviteCode, member }: JoinGroupInput) => {
			const group = await joinGroup({
				inviteCode,
				member,
			});
			const isMain = user?.groups?.findIndex((g) => g.isMain === true) === -1;

			await addUserGroupProfile(member.id, {
				groupId: group.id,
				notificationPreferences: {
					fellowship: true,
					prayerRequest: true,
					board: {
						activity: true,
						newPost: true,
					},
				},
				isMain,
			});
			return { group, userId: member.id };
		},
		onSuccess: async ({ group, userId }) => {
			if (isOnboarding) await submitOnboardingData(userId);
			else {
				showInfo(`${group.groupName}에 참여했어요`);
				queryClient.invalidateQueries({
					queryKey: [GROUPS_QUERY_KEY],
					refetchType: 'all',
				});
				queryClient.invalidateQueries({ queryKey: [FEEDS_QUERY_KEY] });
			}
			routingToHome();
		},
		onError: (error) => {
			showError(error.message);
		},
	});

	return { joinGroupMutation };
}
