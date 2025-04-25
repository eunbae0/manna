export type FeedbackMessage = {
  id: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  isFromDeveloper: boolean;
  chatRoomId: string; // 메시지가 속한 채팅방 ID (userId)
};

// 채팅방 정보
export type ChatRoom = {
  id: string; // 사용자 ID와 동일함
  userName: string;
  userPhotoUrl?: string;
  lastMessage?: string;
  lastMessageTimestamp?: number;
  unreadCount: number;
  isActive: boolean;
};

export type DeveloperConfig = {
  developerIds: string[];
};
