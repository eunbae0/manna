import {
	ref,
	type FirebaseDatabaseTypes,
} from '@react-native-firebase/database';
import type { ChatRoom, DeveloperConfig, FeedbackMessage } from './types';
import { v4 as uuidv4 } from 'uuid';
import { collection, doc, getDoc } from '@react-native-firebase/firestore';
import { database, database2 } from '@/firebase/config';

const FEEDBACK_PATH = 'feedback';
const CHAT_ROOMS_PATH = 'chatRooms';
const DEVELOPER_DOC_PATH = 'developer_config';
const APP_CONFIG_COLLECTION = 'AppConfig';

/**
 * 개발자 ID 목록을 가져옵니다.
 */
export async function getDeveloperIds(): Promise<string[]> {
	try {
		const configRef = doc(database, APP_CONFIG_COLLECTION, DEVELOPER_DOC_PATH);
		const configDoc = await getDoc(configRef);

		if (!configDoc.exists()) {
			return [];
		}

		const config = configDoc.data() as DeveloperConfig;
		return config.developerIds || [];
	} catch (error) {
		console.error('개발자 ID 목록을 가져오는 중 오류 발생:', error);
		return [];
	}
}

/**
 * 사용자가 개발자인지 확인합니다.
 */
export async function isDeveloper(userId: string): Promise<boolean> {
	const developerIds = await getDeveloperIds();
	return developerIds.includes(userId);
}

/**
 * 피드백 메시지를 전송합니다.
 */
export async function sendFeedbackMessage(
	userId: string,
	userName: string,
	userPhotoUrl: string | undefined,
	message: string,
	isFromDeveloper: boolean,
): Promise<void> {
	// 개발자가 보낸 메시지인 경우 chatRoomId를 수신자 ID로 설정
	// 일반 사용자가 보낸 메시지인 경우 chatRoomId를 자신의 ID로 설정
	const chatRoomId = userId;
	try {
		const feedbackRef = ref(database2, FEEDBACK_PATH);
		const newMessageRef = feedbackRef.push();

		const timestamp = Date.now();
		const messageId = uuidv4();

		const newMessage: FeedbackMessage = {
			id: messageId,
			userId,
			userName,
			userPhotoUrl,
			message,
			timestamp,
			isRead: false,
			isFromDeveloper,
			chatRoomId,
		};

		// 채팅방 정보 업데이트 (또는 생성)
		await updateChatRoom({
			id: chatRoomId,
			userName,
			userPhotoUrl,
			lastMessage: message,
			lastMessageTimestamp: timestamp,
			unreadCount: 0, // 자신의 채팅방에는 읽지 않은 메시지 없음
			isActive: true,
		});

		await newMessageRef.set(newMessage);
	} catch (error) {
		console.error('피드백 메시지 전송 중 오류 발생:', error);
		throw error;
	}
}

/**
 * 채팅방 정보를 업데이트하거나 생성합니다.
 */
export async function updateChatRoom(chatRoom: ChatRoom): Promise<void> {
	try {
		const chatRoomRef = ref(database2, `${CHAT_ROOMS_PATH}/${chatRoom.id}`);
		await chatRoomRef.update(chatRoom);
	} catch (error) {
		console.error('채팅방 정보 업데이트 중 오류 발생:', error);
		throw error;
	}
}

/**
 * 전체 채팅방 목록을 가져옵니다. (개발자용)
 */
export function subscribeChatRooms(
	onChatRoomsUpdate: (chatRooms: ChatRoom[]) => void,
): () => void {
	const chatRoomsRef = ref(database2, CHAT_ROOMS_PATH).orderByChild(
		'lastMessageTimestamp',
	);

	const handleValueChange = (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
		const chatRooms: ChatRoom[] = [];

		if (snapshot.exists()) {
			const data = snapshot.val();

			if (data) {
				// 객체를 배열로 변환
				for (const key of Object.keys(data)) {
					const chatRoomData = data[key] as ChatRoom;
					if (chatRoomData) {
						chatRooms.push(chatRoomData);
					}
				}

				// 최신 메시지 순으로 정렬
				chatRooms.sort(
					(a, b) =>
						(b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0),
				);
			}
		}

		onChatRoomsUpdate(chatRooms);
	};

	chatRoomsRef.on('value', handleValueChange);

	// 구독 해제 함수 반환
	return () => {
		chatRoomsRef.off('value', handleValueChange);
	};
}

/**
 * 특정 채팅방의 메시지를 실시간으로 구독합니다.
 */
export function subscribeChatRoomMessages(
	chatRoomId: string,
	onMessagesUpdate: (messages: FeedbackMessage[]) => void,
): () => void {
	const messagesRef = ref(database2, FEEDBACK_PATH)
		.orderByChild('chatRoomId')
		.equalTo(chatRoomId);

	const handleValueChange = (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
		const messages: FeedbackMessage[] = [];

		if (snapshot.exists()) {
			const data = snapshot.val();

			if (data) {
				for (const key of Object.keys(data)) {
					const messageData = data[key] as FeedbackMessage;
					if (messageData) {
						messages.push(messageData);
					}
				}

				// 시간순으로 정렬
				messages.sort((a, b) => a.timestamp - b.timestamp);
			}
		}

		onMessagesUpdate(messages);
	};

	messagesRef.on('value', handleValueChange);

	// 구독 해제 함수 반환
	return () => {
		messagesRef.off('value', handleValueChange);
	};
}

/**
 * 모든 피드백 메시지를 실시간으로 구독합니다.
 */
export function subscribeFeedbackMessages(
	onMessagesUpdate: (messages: FeedbackMessage[]) => void,
): () => void {
	const feedbackRef = ref(database2, FEEDBACK_PATH).orderByChild('timestamp');

	const handleValueChange = (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
		const messages: FeedbackMessage[] = [];

		// snapshot을 배열로 변환하여 안전하게 처리
		if (snapshot.exists()) {
			const data = snapshot.val();

			if (data) {
				// 객체를 배열로 변환
				for (const key of Object.keys(data)) {
					const messageData = data[key] as FeedbackMessage;
					if (messageData) {
						messages.push(messageData);
					}
				}

				// 시간순으로 정렬
				messages.sort((a, b) => a.timestamp - b.timestamp);
			}
		}

		onMessagesUpdate(messages);
	};

	feedbackRef.on('value', handleValueChange);

	// 구독 해제 함수 반환
	return () => {
		feedbackRef.off('value', handleValueChange);
	};
}
