import * as admin from 'firebase-admin';
import { messaging, firestore } from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { log, warn } from 'firebase-functions/logger';
import { cleanupToken } from './utils/cleanupToken';

import { v4 as uuidv4 } from 'uuid';

admin.initializeApp();

exports.prayerRequestNotification = onDocumentCreated(
	'/groups/{documentId}/prayer-requests/{documentId}',
	async (event) => {
		const {
			id: prayerRequestId,
			value,
			member: { id: senderId, displayName },
		} = event.data?.data() as {
			id: string;
			value: string;
			member: { id: string; displayName: string };
		};
		const group = await event.data?.ref.parent.parent?.get();
		const { id: groupId, members } = group?.data() as {
			id: string;
			members: { user: { id: string } }[];
		};

		const otherMembers = members.filter(
			(member) => member.user.id !== senderId,
		);

		for (const member of otherMembers) {
			const currentMemberId = member.user.id;
			const userDoc = await firestore()
				.collection('users')
				.doc(currentMemberId)
				.get();
			if (!userDoc.exists) continue;

			const data = userDoc.data() as {
				fcmToken?: string;
				groups: {
					groupId: string;
					notificationPreferences: { prayerRequest: boolean };
				}[];
			};
			const userGroup = data?.groups?.find(
				(group) => group.groupId === groupId,
			);

			if (userGroup?.notificationPreferences?.prayerRequest === true) {
				const token = data.fcmToken;
				if (!token) continue;

				const payload = {
					notification: {
						title: `${displayName} 님의 새로운 기도제목 🙏`,
						body: value,
					},
					data: {
						screen: '/(app)/(tabs)/index',
					},
				};

				try {
					// send notification
					await messaging().send({
						token,
						...payload,
					});

					const messageId = uuidv4();

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
								prayerRequestId,
								senderId,
							},
							isRead: false,
							timestamp: firestore.FieldValue.serverTimestamp(),
						});
					log(`Notification sent and saved successfully: ${messageId}`);
				} catch (error) {
					warn(`Notification failed to send: ${error}`);
					await cleanupToken(error, member.user.id);
				}
			}
		}
	},
);

exports.fellowshipNotification = onDocumentCreated(
	'/groups/{documentId}/fellowships/{documentId}',
	async (event) => {
		const {
			id: fellowshipId,
			member: { id: senderId, displayName },
		} = event.data?.data() as {
			id: string;
			member: { id: string; displayName: string };
		};
		const group = await event.data?.ref.parent.parent?.get();
		const { id: groupId, members } = group?.data() as {
			id: string;
			members: { user: { id: string } }[];
		};

		const otherMembers = members.filter(
			(member) => member.user.id !== senderId,
		);

		for (const member of otherMembers) {
			const currentMemberId = member.user.id;
			const userDoc = await firestore()
				.collection('users')
				.doc(currentMemberId)
				.get();
			if (!userDoc.exists) continue;

			const data = userDoc.data() as {
				fcmToken?: string;
				groups: {
					groupId: string;
					notificationPreferences: { fellowship: boolean };
				}[];
			};
			const userGroup = data?.groups?.find(
				(group) => group.groupId === groupId,
			);

			if (userGroup?.notificationPreferences?.fellowship === true) {
				const token = data.fcmToken;
				if (!token) continue;

				const payload = {
					notification: {
						title: `${displayName} 님이 새 나눔을 등록했어요`,
						body: '클릭해서 나눔에 참여해보세요',
					},
					data: {
						screen: `/(app)/(fellowship)/${fellowshipId}`,
					},
				};

				try {
					// send notification
					await messaging().send({
						token,
						...payload,
					});

					const messageId = uuidv4();

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
					log(`Notification sent and saved successfully: ${messageId}`);
				} catch (error) {
					warn(`Notification failed to send: ${error}`);
					await cleanupToken(error, member.user.id);
				}
			}
		}
	},
);
