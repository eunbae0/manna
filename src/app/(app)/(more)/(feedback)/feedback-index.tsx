import { useRef, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeedback } from '@/features/feedback/hooks/useFeedback';
import { useToastStore } from '@/store/toast';
import type { FeedbackMessage, ChatRoom } from '@/api/feedback/types';
import { MessageBubble, ChatRoomItem } from '@/features/feedback/components';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import Header from '@/components/common/Header';
import { Heading } from '@/shared/components/heading';
import { Button, ButtonIcon } from '@/components/common/button';
import { ArrowUp } from 'lucide-react-native';
import { router } from 'expo-router';

export default function FeedbackScreen() {
	const { showToast } = useToastStore();
	const {
		messages,
		isLoading,
		isDeveloperAccount,
		sendMessage,
		error,
		chatRooms,
	} = useFeedback();
	const [inputMessage, setInputMessage] = useState('');
	const flatListRef = useRef<FlatList>(null);

	const handleSendMessage = async () => {
		if (!inputMessage.trim()) return;

		try {
			await sendMessage(inputMessage);
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
	};

	if (error) {
		return (
			<SafeAreaView>
				<Header />
				<VStack space="md" className="p-5 items-center justify-center">
					<Text>오류가 발생했습니다. 다시 시도해주세요.</Text>
					<Text className="text-typography-500">{error.message}</Text>
				</VStack>
			</SafeAreaView>
		);
	}

	if (isDeveloperAccount) {
		const handleChatRoomSelect = (chatRoomId: string) => {
			router.push(`/(app)/(more)/(feedback)/${chatRoomId}`);
		};

		return (
			<SafeAreaView className="flex-1">
				<VStack className="flex-1">
					<Header>
						<Text size="lg" className="font-pretendard-semi-bold">
							피드백 목록
						</Text>
					</Header>

					<VStack className="p-4 flex-1">
						{isLoading ? (
							<VStack className="flex-1 justify-center items-center">
								<ActivityIndicator size="large" color="#6366f1" />
								<Text className="mt-2">로딩 중...</Text>
							</VStack>
						) : chatRooms.length === 0 ? (
							<VStack className="flex-1 justify-center items-center">
								<Heading size="md">피드백 없음</Heading>
								<Text className="text-typography-500 text-center mt-2">
									아직 사용자로부터 피드백이 없어요
								</Text>
							</VStack>
						) : (
							<FlatList
								data={chatRooms}
								keyExtractor={(item: ChatRoom) => item.id}
								className="flex-1"
								renderItem={({ item }: { item: ChatRoom }) => (
									<ChatRoomItem
										chatRoom={item}
										isSelected={false}
										onSelect={handleChatRoomSelect}
									/>
								)}
							/>
						)}
					</VStack>
				</VStack>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1">
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1"
			>
				<VStack className="flex-1">
					<Header label="개발자에게 피드백 보내기" labelSize="xl" />
					<HStack className="mt-1 px-4 py-2 bg-primary-100">
						<Text size="sm">
							문의사항, 오류, 서비스 개선 방향 등이 있다면 편하게 메시지를
							보내주세요.
						</Text>
					</HStack>
					<VStack className="p-4 flex-1">
						{isLoading ? (
							<VStack className="flex-1 justify-center items-center">
								<ActivityIndicator size="large" color="#6366f1" />
								<Text className="mt-2">로딩 중...</Text>
							</VStack>
						) : messages.length === 0 ? (
							<VStack className="flex-1 justify-center items-center">
								<Heading size="md">채팅 없음</Heading>
								<Text className="text-typography-500 text-center mt-2">
									채팅 시작하기
								</Text>
							</VStack>
						) : (
							<FlatList
								ref={flatListRef}
								data={messages}
								keyExtractor={(item: FeedbackMessage) => item.id}
								className="flex-1"
								renderItem={({ item }: { item: FeedbackMessage }) => (
									<MessageBubble
										message={item}
										isFromDeveloper={isDeveloperAccount}
									/>
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
							style={{
								flex: 1,
								marginRight: 8,
								backgroundColor: 'white',
								borderRadius: 8,
								padding: 10,
							}}
							returnKeyType="send"
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
