import { TouchableOpacity, View } from 'react-native';
import { Text } from '#/components/ui/text';
import { Avatar } from '@/components/common/avatar';
import type { ChatRoom } from '@/api/feedback/types';

interface ChatRoomItemProps {
	chatRoom: ChatRoom;
	isSelected: boolean;
	onSelect: (chatRoomId: string) => void;
}

export function ChatRoomItem({
	chatRoom,
	isSelected,
	onSelect,
}: ChatRoomItemProps) {
	const {
		id,
		userName,
		userPhotoUrl,
		lastMessage,
		lastMessageTimestamp,
		unreadCount,
	} = chatRoom;

	return (
		<TouchableOpacity
			onPress={() => onSelect(id)}
			className={`p-4 flex-row items-center ${isSelected ? 'bg-gray-100' : ''}`}
		>
			<Avatar size="md" photoUrl={userPhotoUrl} />

			<View className="flex-1 ml-3">
				<View className="flex-row items-center justify-between">
					<Text className="font-bold">{userName}</Text>
					{lastMessageTimestamp && (
						<Text className="text-xs text-gray-500">
							{new Date(lastMessageTimestamp).toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
							})}
						</Text>
					)}
				</View>

				<View className="flex-row items-center justify-between mt-1">
					<Text className="text-sm text-gray-600 flex-1" numberOfLines={1}>
						{lastMessage || '새로운 채팅방이에요'}
					</Text>

					{unreadCount > 0 && (
						<View className="bg-green-500 rounded-full px-1.5 py-0.5 ml-2">
							<Text className="text-xs text-white font-bold">
								{unreadCount}
							</Text>
						</View>
					)}
				</View>
			</View>
		</TouchableOpacity>
	);
}
