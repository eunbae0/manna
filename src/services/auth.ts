import { ERROR_CODES } from '@/constants/error';
import { createUserWithEmailAndPassword, signOut } from '@/firebase/auth';
import { auth, database } from '@/firebase/config';
import { doc, getDoc, setDoc, updateDoc } from '@/firebase/firestore';
import type { AuthType, User } from '@/types/user';
import { createUserWithServerTimestamp } from '@/utils/auth';

/**
 * 회원가입 및 프로필 생성
 */
// export async function signUp(
// 	type: AuthType,
// 	data: { email: string; password: string },
// ): Promise<any>;
// export async function signUp(
// 	type: AuthType,
// 	data: { providerToken: string },
// ): Promise<any>;

export async function signUp(
	type: AuthType,
	data: { email: string; password: string },
): Promise<void> {
	if (data)
		switch (type) {
			case 'EMAIL':
				return signUpWithEmail(data.email, data.password);
			default:
				return;
		}
}

async function signUpWithEmail(email: string, password: string) {
	try {
		// 1. Firebase 인증
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password,
		);

		// 2. Firestore 임시 프로필 생성
		await createFirestoreUser(userCredential.user.uid, {
			email: userCredential.user.email,
			authType: 'EMAIL' satisfies AuthType,
		});
	} catch (error) {
		throw handleAuthError(error);
	}
}

export async function logout(): Promise<void> {
	try {
		await signOut(auth);
	} catch (error) {
		throw handleAuthError(error);
	}
}

/**
 * 사용자 프로필 생성
 */
export async function createFirestoreUser(userId: string, user: User) {
	const userWithTimestamp = createUserWithServerTimestamp(user);
	try {
		await setDoc(doc(database, 'users', userId), userWithTimestamp);
	} catch (error) {
		throw new Error(`프로필 생성 실패: ${error.message}`);
	}
}

/**
 * 사용자 프로필 조회
 */
export async function getFirestoreUser(userId: string): Promise<User> {
	try {
		const docSnap = await getDoc(doc(database, 'users', userId));
		if (!docSnap.exists()) {
			throw new Error('프로필 조회 실패: 프로필이 조회되지 않습니다.');
		}
		return docSnap.data() as User;
	} catch (error) {
		throw new Error(`프로필 조회 실패: ${error.message}`);
	}
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateFirestoreUser(userId: string, data: Partial<User>) {
	try {
		await updateDoc(doc(database, 'users', userId), { ...data });
	} catch (error) {
		throw new Error(`프로필 생성 실패: ${error.message}`);
	}
}

/**
 * 인증 오류 처리
 */
export function handleAuthError(error: Error & { code: number }) {
	const errorMap = {
		[ERROR_CODES.EMAIL_EXISTS]: '이미 등록된 이메일 주소입니다',
		[ERROR_CODES.INVALID_EMAIL]: '올바른 이메일 형식을 입력해주세요',
		[ERROR_CODES.WEAK_PASSWORD]: '6자 이상의 비밀번호를 사용하세요',
	};

	return new AuthError(
		error.code,
		errorMap[error.code] || '알 수 없는 오류가 발생했습니다',
	);
}

export class AuthError extends Error {
	constructor(code: number, message: string) {
		super(message);
		name = 'AuthError';
		code = code;
	}
}
