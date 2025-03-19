import { serverTimestamp } from '@/firebase/firestore';
import type { User } from '@/shared/types/user';

export function createUserWithServerTimestamp(user: User): User {
	return {
		...user,
		createdAt: serverTimestamp(),
		lastLogin: serverTimestamp(),
	};
}
