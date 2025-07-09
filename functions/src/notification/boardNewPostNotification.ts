import { messaging, firestore } from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { log, warn } from 'firebase-functions/logger';

import { cleanupToken } from '../utils/cleanupToken';

import { v4 as uuidv4 } from 'uuid';

export function boardNewPostNotification() {
	return onDocumentCreated(
		'/groups/{documentId}/posts/{documentId}',
		async (event) => {
			const {
				id: boardId,
				title: boardTitle,
				groupId,
				author: { id: senderId },
			} = event.data?.data() as {
				id: string;
				title: string;
				groupId: string;
				author: { id: string };
			};

			const group = await event.data?.ref.parent.parent?.get();

			let senderDisplayName = '';
			const members = new Set<string>();

			const membersRef = await group?.ref.collection('members').get();

			for (const memberDoc of membersRef?.docs || []) {
				const member = memberDoc.data() as { id: string; displayName: string };
				if (member.id === senderId) {
					senderDisplayName = member.displayName;
					continue;
				}
				members.add(member.id);
			}

			for (const currentMemberId of members) {
				const userDoc = await firestore()
					.collection('users')
					.doc(currentMemberId)
					.get();
				if (!userDoc.exists) continue;

				const user = userDoc.data() as {
					fcmTokens?: string[];
				};

				const userGroupDocs = await userDoc.ref.collection('groups').get();
				const userGroups: {
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
				for (const groupDoc of userGroupDocs.docs) {
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
					userGroups.push(data);
				}

				const userGroup = userGroups.find((group) => group.groupId === groupId);

				const groupDoc = await firestore()
					.collection('groups')
					.doc(groupId)
					.get();
				if (!groupDoc.exists) continue;

				const { groupName } = groupDoc.data() as {
					groupName: string;
				};

				if (userGroup?.notificationPreferences?.board?.newPost !== false) {
					const tokens = user.fcmTokens;
					if (!tokens) continue;

					const payload = {
						notification: {
							title: `${senderDisplayName} 님이 새 게시글을 등록했어요`,
							body: boardTitle,
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
								.doc(currentMemberId)
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
							await cleanupToken(error, currentMemberId, token);
						}
					}
				}
			}
		},
	);
}
