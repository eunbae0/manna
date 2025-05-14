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

		const senderDoc = await firestore().collection('users').doc(senderId).get();
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

exports.fellowshipNotification = onDocumentCreated(
	'/groups/{documentId}/fellowship/{documentId}',
	async (event) => {
		const {
			id: fellowshipId,
			info: { members: fellowshipMembers },
		} = event.data?.data() as {
			id: string;
			info: {
				members: { id: string; displayName: string; isLeader: boolean }[];
			};
		};

		const { id: senderId, displayName: senderDisplayName } =
			fellowshipMembers.find((member) => member.isLeader) || {
				id: '',
				displayName: '',
			};

		const group = await event.data?.ref.parent.parent?.get();

		const members: { id: string }[] = [];
		const { id: groupId } = group?.data() as {
			id: string;
		};

		const membersRef = await group?.ref.collection('members').get();
		for (const memberDoc of membersRef?.docs || []) {
			const member = memberDoc.data() as { id: string };
			members.push(member);
		}

		const otherMembers = members.filter((member) => member.id !== senderId);

		for (const member of otherMembers) {
			const currentMemberId = member.id;
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
						await cleanupToken(error, member.id, token);
					}
				}
			}
		}
	},
);
