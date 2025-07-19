import { messaging, firestore } from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { log, warn } from 'firebase-functions/logger';

import { cleanupToken } from '../utils/cleanupToken';
import { https } from 'firebase-functions';

export function sendPushNotificationToAllUsers() {
	return onCall(async (request) => {
		const { title, body, screen } = request.data;

		if (!title || !body) {
			throw new https.HttpsError(
				'invalid-argument',
				'The function must be called with ' +
					'two arguments, "title" and "body".',
			);
		}

		const usersSnapshot = await firestore().collection('users').get();

		for (const userDoc of usersSnapshot.docs) {
			const user = userDoc.data() as {
				fcmTokens?: string[];
			};

			const tokens = user.fcmTokens;
			if (!tokens || tokens.length === 0) {
				continue;
			}

			const payload = {
				notification: {
					title,
					body,
				},
				data: {
					screen: screen || '/(app)/(tabs)',
				},
			};

			for (const token of tokens) {
				try {
					await messaging().send({
						token,
						...payload,
					});
					log(`Notification sent to token: ${token}`);
				} catch (error) {
					warn(`Notification failed to send to token: ${token}`, error);
					await cleanupToken(error, userDoc.id, token);
				}
			}
		}

		return { success: true };
	});
}
