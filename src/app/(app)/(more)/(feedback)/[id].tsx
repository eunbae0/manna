import { useCallback, useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Platform,
	TextInput,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import Header from '@/components/common/Header';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { ChevronLeft, ArrowUp, Send } from 'lucide-react-native';
import type { FeedbackMessage } from '@/api/feedback/types';
import {
	subscribeChatRoomMessages,
	sendFeedbackMessage,
} from '@/api/feedback/service';
import { MessageBubble } from '@/features/feedback/components';
import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';

export default function FeedbackChatScreen() {
	const { id: chatRoomId } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { user } = useAuthStore();
	const { showToast } = useToastStore();

	const [messages, setMessages] = useState<FeedbackMessage[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [inputMessage, setInputMessage] = useState('');
	const flatListRef = useRef<FlatList>(null);

	// 채팅방 메시지 구독
	useEffect(() => {
		if (!chatRoomId) return;

		setIsLoading(true);

		const unsubscribe = subscribeChatRoomMessages(
			chatRoomId,
			(updatedMessages) => {
				setMessages(updatedMessages);
				setIsLoading(false);
			},
		);

		return () => {
			unsubscribe();
		};
	}, [chatRoomId]);

	// 메시지 전송 핸들러
	const handleSendMessage = useCallback(async () => {
		if (!inputMessage.trim() || !user || !chatRoomId) return;

		try {
			await sendFeedbackMessage(
				chatRoomId, // 개발자가 보낼 때는 chatRoomId를 수신자 ID로 설정
				user.displayName || '개발자',
				user.photoUrl || undefined,
				inputMessage,
				true, // 개발자가 보내는 메시지
			);
			setInputMessage('');

			// 메시지 리스트의 맨 아래로 스크롤
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			}, 100);
		} catch (error) {
			showToast({
				title: '메시지 전송 실패',
				message:
					'메시지를 전송하는 도중 오류가 발생했습니다. 다시 시도해주세요.',
				type: 'error',
			});
		}
	}, [inputMessage, user, chatRoomId, showToast]);

	// 채팅방 정보 찾기
	const selectedChatRoom = messages[0]?.userName || '사용자';

	return (
		<SafeAreaView className="flex-1">
			<KeyboardAvoidingView
				className="flex-1"
			>
				<VStack className="flex-1">
					<Header label={selectedChatRoom} />

					<VStack className="p-4 flex-1">
						{isLoading ? (
							<VStack className="flex-1 justify-center items-center">
								<ActivityIndicator size="large" color="#6366f1" />
								<Text className="mt-2">로딩 중...</Text>
							</VStack>
						) : messages.length === 0 ? (
							<VStack className="flex-1 justify-center items-center">
								<Text className="text-typography-500 text-center">
									아직 메시지가 없어요. 첫 메시지를 보내보세요!
								</Text>
							</VStack>
						) : (
							<FlatList
								ref={flatListRef}
								data={messages}
								keyExtractor={(item: FeedbackMessage) => item.id}
								className="flex-1"
								renderItem={({ item }: { item: FeedbackMessage }) => (
									<MessageBubble message={item} isFromDeveloper={true} />
								)}
								onContentSizeChange={() =>
									flatListRef.current?.scrollToEnd({ animated: false })
								}
								onLayout={() =>
									flatListRef.current?.scrollToEnd({ animated: false })
								}
							/>
						)}
					</VStack>
					<HStack className="p-2 bg-background-100 border-t border-background-200">
						<TextInput
							value={inputMessage}
							onChangeText={setInputMessage}
							placeholder="메시지를 입력하세요..."
							className="font-pretendard-Regular"
							style={{
								flex: 1,
								marginRight: 8,
								backgroundColor: 'white',
								borderRadius: 8,
								padding: 10,
							}}
							returnKeyType="send"
							multiline
							onSubmitEditing={handleSendMessage}
						/>
						<Button
							size="md"
							variant="solid"
							onPress={handleSendMessage}
							disabled={!inputMessage.trim()}
						>
							<ButtonIcon as={ArrowUp} />
						</Button>
					</HStack>
				</VStack>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
