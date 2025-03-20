import type { FirestoreUser } from '@/api/auth/types';
import { serverTimestamp } from '@/firebase/firestore';

export function createUserWithServerTimestamp(
	user: FirestoreUser,
): FirestoreUser {
	return {
		...user,
		createdAt: serverTimestamp(),
		lastLogin: serverTimestamp(),
	};
}
