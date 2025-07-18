import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import {
	sendFeedbackMessage,
	subscribeChatRoomMessages,
	subscribeChatRooms,
} from '@/api/feedback/service';
import type { ChatRoom, FeedbackMessage } from '@/api/feedback/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsDeveloperAccount } from '@/shared/hooks/api/useIsDeveloperAccount';

// 쿼리 키 상수
const FEEDBACK_MESSAGES_KEY = ['feedback', 'messages'];
const CHAT_ROOM_MESSAGES_KEY = ['feedback', 'chatRoom', 'messages'];
const CHAT_ROOMS_KEY = ['feedback', 'chatRooms'];

const SELECTED_CHAT_ROOM_KEY = ['feedback', 'selectedChatRoom'];

export function useFeedback() {
	const { user } = useAuthStore();
	const queryClient = useQueryClient();

	// 개발자 계정 확인 쿼리
	const { data: isDeveloperAccount = false, error: developerStatusError } =
		useIsDeveloperAccount();

	// 선택된 채팅방 ID (사용자 자신의 ID가 기본값)
	const [selectedChatRoomId, setSelectedChatRoomId] = useState<string>('');

	// 초기 채팅방 ID 설정
	useEffect(() => {
		if (user?.id && !selectedChatRoomId) {
			setSelectedChatRoomId(user.id);
		}
	}, [user, selectedChatRoomId]);

	// 개발자용 채팅방 목록 구독 (개발자일 경우에만 활성화)
	useEffect(() => {
		if (!user || !isDeveloperAccount) return;

		// 채팅방 목록 업데이트 시 쿼리 캐시 갱신
		const unsubscribe = subscribeChatRooms((updatedChatRooms) => {
			queryClient.setQueryData(CHAT_ROOMS_KEY, updatedChatRooms);
		});

		return () => {
			unsubscribe();
		};
	}, [user, isDeveloperAccount, queryClient]);

	// 채팅방 구독 (선택된 채팅방 또는 자신의 채팅방)
	useEffect(() => {
		if (!user || !selectedChatRoomId) return;

		// 현재 선택된 채팅방 메시지 구독
		const chatRoomId = isDeveloperAccount
			? selectedChatRoomId // 개발자는 선택한 채팅방
			: user.id; // 일반 사용자는 자신의 채팅방만

		const unsubscribe = subscribeChatRoomMessages(
			chatRoomId,
			(updatedMessages) => {
				queryClient.setQueryData(
					[...CHAT_ROOM_MESSAGES_KEY, chatRoomId],
					updatedMessages,
				);
			},
		);

		return () => {
			unsubscribe();
		};
	}, [user, selectedChatRoomId, isDeveloperAccount, queryClient]);

	// 채팅방 목록 쿼리 (개발자용)
	const {
		data: chatRooms = [] as ChatRoom[],
		isLoading: isLoadingChatRooms,
		error: chatRoomsError,
	} = useQuery<ChatRoom[]>({
		queryKey: CHAT_ROOMS_KEY,
		queryFn: () => [], // 실제 데이터는 useEffect의 setQueryData에서 처리됨
		initialData: [],
		enabled: !!user && isDeveloperAccount,
	});

	// 채팅방 메시지 쿼리
	const {
		data: messages = [] as FeedbackMessage[],
		isLoading: isLoadingMessages,
		error: messagesError,
	} = useQuery<FeedbackMessage[]>({
		queryKey: [...CHAT_ROOM_MESSAGES_KEY, selectedChatRoomId || user?.id || ''],
		queryFn: () => [], // 실제 데이터는 useEffect의 setQueryData에서 처리됨
		initialData: [],
		enabled: !!user && !!selectedChatRoomId,
	});

	// 메시지 전송 뮤테이션
	const { mutateAsync: sendMessage, error: sendError } = useMutation({
		mutationFn: async (message: string) => {
			if (!user || !message.trim()) return;

			return sendFeedbackMessage(
				user.id,
				user.displayName || '이름없음',
				user.photoUrl || undefined,
				message,
				isDeveloperAccount,
			);
		},
	});

	// 오류 집계
	const error =
		developerStatusError || messagesError || chatRoomsError || sendError;
	const isLoading = isLoadingMessages || isLoadingChatRooms;

	// 채팅방 선택 함수 (개발자용)
	const selectChatRoom = useCallback((chatRoomId: string) => {
		setSelectedChatRoomId(chatRoomId);
	}, []);

	return {
		messages,
		isLoading,
		isDeveloperAccount,
		error: error as Error | null,
		sendMessage,
		// 개발자용 추가 필드
		chatRooms,
		selectedChatRoomId: selectedChatRoomId || user?.id || '',
		selectChatRoom,
	};
}
