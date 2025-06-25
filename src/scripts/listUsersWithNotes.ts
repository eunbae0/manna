// src/scripts/listUsersWithNotes.ts

import { database } from '@/firebase/config';
import {
	collection,
	getDocs,
	query,
	orderBy,
	updateDoc,
	doc,
} from '@react-native-firebase/firestore';

/**
 * 노트 컬렉션을 가진 사용자 목록과 각 사용자별 노트 개수를 출력하는 함수
 */
export async function listUsersWithNotes(): Promise<void> {
	try {
		console.log('노트 컬렉션을 가진 사용자 목록 및 노트 수를 확인합니다...');

		// 모든 사용자 컬렉션 가져오기
		const usersCollection = collection(database, 'users');
		const usersSnapshot = await getDocs(usersCollection);

		// 사용자 정보를 미리 로드
		const userInfoSet = new Set<string>();
		for (const userDoc of usersSnapshot.docs) {
			const userData = userDoc.data();
			userInfoSet.add(userData.id);
		}

		for (const userId of userInfoSet.values()) {
			// 각 사용자의 notes 컬렉션에서 노트 가져오기
			const notesSnapshot = await getDocs(
				collection(database, 'users', userId, 'notes'),
			);
			if (notesSnapshot.size > 0) {
				const notes = notesSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				console.log(notes);
				for (const note of notes) {
					await updateDoc(doc(database, 'users', userId, 'notes', note.id), {
						id: note.id,
						metadata: {
							updatedAt: note.updatedAt,
							createdAt: note.createdAt,
							isDeleted: false,
						},
					});
					console.log(`사용자 ${userId}의 노트 ${note.id}를 업데이트했습니다.`);
				}
			}
		}
	} catch (error) {
		console.error('노트 사용자 목록 조회 중 오류 발생:', error);
	}
}
