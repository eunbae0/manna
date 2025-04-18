import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getNotifications,
	markNotificationAsRead,
	deleteNotification,
} from '../api';
import type { ClientNotification } from '../api/types';

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

	const markAsReadMutation = useMutation({
		mutationFn: markNotificationAsRead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteNotification,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
		},
	});

	const unreadCount = notifications.filter(
		(notification) => !notification.isRead,
	).length;

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
