import { View } from 'react-native';
import { Text } from '@/shared/components/text';
import { Avatar } from '@/components/common/avatar';
import type { FeedbackMessage } from '@/api/feedback/types';
import { APP_ICON_IMAGE_URL } from '@/shared/constants/app';

interface MessageBubbleProps {
	message: FeedbackMessage;
	isFromDeveloper: boolean;
}

export function MessageBubble({
	message,
	isFromDeveloper,
}: MessageBubbleProps) {
	const { userPhotoUrl, userName, message: text, timestamp } = message;

	// 개발자 메시지는 오른쪽, 사용자 메시지는 왼쪽에 배치
	const isCurrentUserDeveloper = isFromDeveloper;
	const isMessageFromDeveloper = message.isFromDeveloper;
	const isSentByCurrentUser = isCurrentUserDeveloper === isMessageFromDeveloper;

	return (
		<View
			className={`flex flex-row p-2 ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}
		>
			{!isSentByCurrentUser && (
				<Avatar
					size="sm"
					photoUrl={!isSentByCurrentUser ? APP_ICON_IMAGE_URL : userPhotoUrl}
				/>
			)}

			<View className="max-w-[75%] ml-2">
				{!isSentByCurrentUser && (
					<Text className="text-xs text-gray-600 mb-1">
						{!isSentByCurrentUser ? '개발자' : userName}
					</Text>
				)}
				<View
					className={`rounded-2xl p-3 ${
						isSentByCurrentUser
							? 'bg-primary-500 rounded-tr-none'
							: 'bg-gray-200 rounded-tl-none'
					}`}
				>
					<Text
						className={`text-sm ${isSentByCurrentUser ? 'text-white' : 'text-gray-800'}`}
					>
						{text}
					</Text>
				</View>
				<Text
					className={`text-xs text-gray-500 mt-1 ${isSentByCurrentUser ? 'text-right' : 'text-left'}`}
				>
					{new Date(timestamp).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					})}
				</Text>
			</View>
		</View>
	);
}
