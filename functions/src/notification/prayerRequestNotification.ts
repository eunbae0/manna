import { messaging, firestore } from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { log, warn } from 'firebase-functions/logger';

import { cleanupToken } from '../utils/cleanupToken';

import { v4 as uuidv4 } from 'uuid';

export function prayerRequestNotification() {
	return onDocumentCreated(
		'/groups/{documentId}/prayer-requests/{documentId}',
		async (event) => {
			const {
				id: prayerRequestId,
				value,
				member: { id: senderId },
			} = event.data?.data() as {
				id: string;
				value: string;
				member: { id: string };
			};
			const group = await event.data?.ref.parent.parent?.get();
			const { id: groupId } = group?.data() as {
				id: string;
			};

			const membersRef = await group?.ref.collection('members').get();
			const members: { id: string }[] = [];
			for (const memberDoc of membersRef?.docs || []) {
				const member = memberDoc.data() as { id: string };
				members.push(member);
			}

			const otherMembers = members.filter((member) => member.id !== senderId);

			const senderDoc = await firestore()
				.collection('users')
				.doc(senderId)
				.get();
			if (!senderDoc.exists) return;
			const senderData = senderDoc.data() as {
				displayName: string;
			};

			for (const member of otherMembers) {
				const currentMemberId = member.id;
				const userDoc = await firestore()
					.collection('users')
					.doc(currentMemberId)
					.get();
				if (!userDoc.exists) continue;

				const data = userDoc.data() as {
					fcmTokens?: string[];
				};

				const userGroupsDoc = await userDoc.ref.collection('groups').get();
				const userGroups: {
					groupId: string;
					notificationPreferences: { prayerRequest: boolean };
				}[] = [];
				for (const groupDoc of userGroupsDoc.docs) {
					const groupData = groupDoc.data() as {
						groupId: string;
						notificationPreferences: { prayerRequest: boolean };
					};
					userGroups.push(groupData);
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

				if (userGroup?.notificationPreferences?.prayerRequest === true) {
					const tokens = data.fcmTokens;
					if (!tokens) continue;

					const payload = {
						notification: {
							title: `${senderData.displayName} 님의 새로운 기도제목 🙏`,
							body: value,
						},
						data: {
							screen: '/(app)/(tabs)',
							groupId,
							groupName,
						},
					};

					const messageId = uuidv4();

					let isNotificationSentwithSaveFirestore = false;
					for (const token of tokens) {
						try {
							// send notification
							await messaging().send({
								token,
								...payload,
							});

							if (isNotificationSentwithSaveFirestore) continue;

							// save notification to firestore
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
										prayerRequestId,
										senderId,
									},
									isRead: false,
									timestamp: firestore.FieldValue.serverTimestamp(),
								});
							isNotificationSentwithSaveFirestore = true;
							log(`Notification sent and saved successfully: ${messageId}`);
						} catch (error) {
							warn(`Notification failed to send: ${error}`);
							await cleanupToken(error, member.id, token);
						}
					}
				}
			}
		},
	);
}
