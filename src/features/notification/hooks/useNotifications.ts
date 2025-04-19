import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getNotifications,
	markNotificationAsRead,
	deleteNotification,
} from '../api';
import type { ClientNotification } from '../api/types';
import { setBadgeCountAsync } from 'expo-notifications';
import { useEffect, useMemo } from 'react';

const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export function useNotifications() {
	const queryClient = useQueryClient();

	const {
		data: notifications = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<ClientNotification[]>({
		queryKey: NOTIFICATIONS_QUERY_KEY,
		queryFn: getNotifications,
		staleTime: 1 * 60 * 1000, // 1 minute
	});

	const unreadCount = useMemo(
		() => notifications.filter((notification) => !notification.isRead).length,
		[notifications],
	);

	const markAsReadMutation = useMutation({
		mutationFn: markNotificationAsRead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
			setBadgeCountAsync(unreadCount - 1);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteNotification,
		onSuccess: (deletedNotification) => {
			queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
			if (!deletedNotification.isRead) {
				setBadgeCountAsync(unreadCount - 1);
			}
		},
	});
	useEffect(() => {
		if (unreadCount > 0) {
			setBadgeCountAsync(unreadCount);
		}
	}, [unreadCount]);

	return {
		notifications,
		isLoading,
		isError,
		error,
		refetch,
		unreadCount,
		markAsRead: (id: string) => {
			markAsReadMutation.mutate(id);
			queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
		},
		deleteNotification: (id: string) => {
			deleteMutation.mutate(id);
			queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
		},
		isDeleting: deleteMutation.isPending,
	};
}
