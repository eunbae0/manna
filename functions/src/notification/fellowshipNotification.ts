import { messaging, firestore } from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { log, warn } from 'firebase-functions/logger';

import { cleanupToken } from '../utils/cleanupToken';

import { v4 as uuidv4 } from 'uuid';

export function fellowshipNotification() {
	return onDocumentCreated(
		'/groups/{documentId}/fellowship/{documentId}',
		async (event) => {
			const {
				identifiers: { id: fellowshipId },
				info: { participants: fellowshipMembers },
				roles: { leaderId },
			} = event.data?.data() as {
				identifiers: {
					id: string;
				};
				info: {
					participants: { id: string; displayName?: string }[];
				};
				roles: {
					leaderId: string;
				};
			};

			const { id: senderId } = fellowshipMembers.find(
				(member) => member.id === leaderId,
			) || { id: '' };

			const group = await event.data?.ref.parent.parent?.get();

			const members = new Set<string>();
			const { id: groupId } = group?.data() as {
				id: string;
			};

			const fellowshipMemberIds = new Set(
				fellowshipMembers.map((member) => member.id),
			);

			const membersRef = await group?.ref.collection('members').get();

			let senderDisplayName = '알 수 없음';

			for (const memberDoc of membersRef?.docs || []) {
				const member = memberDoc.data() as { id: string; displayName: string };
				if (!fellowshipMemberIds.has(member.id)) continue;
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
					};
				}[] = [];
				for (const groupDoc of userGroupDocs.docs) {
					const data = groupDoc.data() as {
						groupId: string;
						notificationPreferences: {
							fellowship: boolean;
							prayerRequest: boolean;
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

				if (userGroup?.notificationPreferences?.fellowship === true) {
					const tokens = user.fcmTokens;
					if (!tokens) continue;

					const payload = {
						notification: {
							title: `${senderDisplayName} 님이 새 나눔을 등록했어요`,
							body: '클릭해서 나눔에 참여해보세요',
						},
						data: {
							screen: `/(app)/(fellowship)/${fellowshipId}`,
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
										fellowshipId,
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
