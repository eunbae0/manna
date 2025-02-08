import { serverTimestamp } from '@/firebase/firestore';
import type { User } from '@/types/user';

export function createUserWithServerTimestamp(user: User) {
	return {
		...user,
		createdAt: serverTimestamp(),
		lastLogin: serverTimestamp(),
	};
}
