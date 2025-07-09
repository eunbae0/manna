import { messaging, firestore } from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { log, warn } from 'firebase-functions/logger';

import { cleanupToken } from '../utils/cleanupToken';

import { v4 as uuidv4 } from 'uuid';

export function boardActivityNotification() {
	return onDocumentCreated(
		'/groups/{documentId}/posts/{documentId}/comments/{documentId}',
		async (event) => {
			const {
				content: boardContent,
				groupId,
				author: { id: senderId },
			} = event.data?.data() as {
				content: string;
				groupId: string;
				author: { id: string };
			};

			const post = await event.data?.ref.parent.parent?.get();

			const postDoc = await post?.ref.get();
			if (!postDoc?.exists) return;

			const postData = postDoc.data() as { author: { id: string }; id: string };

			const boardId = postData.id;
			const receiverId = postData.author.id;

			const receiverDoc = await firestore()
				.collection('users')
				.doc(receiverId)
				.get();
			if (!receiverDoc.exists) return;

			const receiver = receiverDoc.data() as {
				fcmTokens?: string[];
			};

			const receiverGroupDocs = await receiverDoc.ref
				.collection('groups')
				.get();
			const receiverGroups: {
				groupId: string;
				notificationPreferences: {
					fellowship: boolean;
					prayerRequest: boolean;
					board?: {
						activity: boolean;
						newPost: boolean;
					};
				};
			}[] = [];
			for (const groupDoc of receiverGroupDocs.docs) {
				const data = groupDoc.data() as {
					groupId: string;
					notificationPreferences: {
						fellowship: boolean;
						prayerRequest: boolean;
						board?: {
							activity: boolean;
							newPost: boolean;
						};
					};
				};
				receiverGroups.push(data);
			}

			const receiverGroup = receiverGroups.find(
				(group) => group.groupId === groupId,
			);

			const groupDoc = await firestore()
				.collection('groups')
				.doc(groupId)
				.get();
			if (!groupDoc.exists) return;

			const { groupName } = groupDoc.data() as {
				groupName: string;
			};

			if (receiverGroup?.notificationPreferences?.board?.activity !== false) {
				const tokens = receiver.fcmTokens;
				if (!tokens) return;

				const payload = {
					notification: {
						title: '게시글에 댓글이 달렸어요',
						body: boardContent,
					},
					data: {
						screen: `/(app)/(board)/${boardId}`,
						groupId,
						groupName,
					},
				};

				let isNotificationSentwithSaveFirestore = false;
				const messageId = uuidv4();

				for (const token of tokens) {
					try {
						// send notification
						await messaging().send({
							token,
							...payload,
						});
						if (isNotificationSentwithSaveFirestore) continue;

						// save notification
						await firestore()
							.collection('users')
							.doc(receiverId)
							.collection('notifications')
							.doc(messageId)
							.set({
								...payload.notification,
								...payload.data,
								metadata: {
									groupId,
									boardId,
									senderId,
								},
								isRead: false,
								timestamp: firestore.FieldValue.serverTimestamp(),
							});
						isNotificationSentwithSaveFirestore = true;
						log(`Notification sent and saved successfully: ${messageId}`);
					} catch (error) {
						warn(`Notification failed to send: ${error}`);
						await cleanupToken(error, receiverId, token);
					}
				}
			}
		},
	);
}
