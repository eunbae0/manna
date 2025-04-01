import { firestore } from 'firebase-admin';
import { warn } from 'firebase-functions/logger';

/**
 * Cleans up the tokens that are no longer valid.
 */
export async function cleanupToken(
	error: unknown,
	userId: string,
): Promise<void> {
	// If the error is not related to invalid tokens, just return
	if (
		(error as { code: string }).code !==
			'messaging/invalid-registration-token' &&
		(error as { code: string }).code !==
			'messaging/registration-token-not-registered'
	) {
		return;
	}

	// Remove the invalid token
	await firestore().collection('users').doc(userId).update({
		fcmToken: firestore.FieldValue.delete(),
	});
	warn(`Notification failed to send and tokens cleaned up: ${userId}`);
}
