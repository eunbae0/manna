import {
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	deleteDoc,
	query,
	where,
	Timestamp,
	addDoc,
	FieldValue,
} from '@react-native-firebase/firestore';

import type { Note, ServerNote, UTCString } from '@/features/note/types';
import { database } from '@/firebase/config';
import { v4 as uuidv4 } from 'uuid';

class FirestoreNoteService {
	// 싱글톤 인스턴스를 저장할 정적 변수
	private static instance: FirestoreNoteService | null = null;

	// 싱글톤 인스턴스를 반환하는 정적 메서드
	public static getInstance(): FirestoreNoteService {
		if (!FirestoreNoteService.instance) {
			FirestoreNoteService.instance = new FirestoreNoteService();
		}
		return FirestoreNoteService.instance;
	}

	private getNotesCollection(userId: string) {
		return collection(database, 'users', userId, 'notes');
	}

	// 노트 생성
	async createNote(noteData: Omit<Note, 'id'>, userId: string): Promise<Note> {
		const notesCollection = this.getNotesCollection(userId);

		const now = new Date();
		const id = uuidv4();
		// Firestore에 저장할 데이터 준비
		const firestoreData = {
			...noteData,
			id,
			date: Timestamp.fromDate(new Date(noteData.date)),
			metadata: {
				...noteData.metadata,
				createdAt: Timestamp.fromDate(new Date(noteData.metadata.createdAt)),
				updatedAt: Timestamp.fromDate(new Date(noteData.metadata.updatedAt)),
				syncedAt: Timestamp.now(),
			},
		};

		// console.log(firestoreData);
		// 문서 추가
		await setDoc(doc(notesCollection, id), firestoreData);

		// 생성된 노트 반환
		return {
			...noteData,
			id,
			metadata: {
				...noteData.metadata,
				syncedAt: now.toUTCString(),
			},
		};
	}

	// 노트 업데이트
	async updateNote(note: Note, userId: string): Promise<void> {
		const notesCollection = this.getNotesCollection(userId);
		const noteRef = doc(notesCollection, note.id);

		// Firestore에 저장할 데이터 준비
		const firestoreData = {
			...note,
			date: Timestamp.fromDate(new Date(note.date)),
			metadata: {
				...note.metadata,
				createdAt: Timestamp.fromDate(new Date(note.metadata.createdAt)),
				updatedAt: Timestamp.fromDate(new Date(note.metadata.updatedAt)),
				syncedAt: Timestamp.now(),
			},
		};

		// 문서 업데이트
		await setDoc(noteRef, firestoreData, { merge: true });
	}

	// 노트 삭제
	async deleteNote(noteId: string, userId: string): Promise<void> {
		const notesCollection = this.getNotesCollection(userId);
		const noteRef = doc(notesCollection, noteId);

		// 문서 삭제
		await deleteDoc(noteRef);
	}

	// 특정 시간 이후에 업데이트된 노트 가져오기
	async getNotesUpdatedSince(
		timestamp: UTCString,
		userId: string,
	): Promise<Note[]> {
		const notesCollection = this.getNotesCollection(userId);

		// timestamp 이후에 업데이트된 노트 쿼리
		const q = query(
			notesCollection,
			where('metadata.updatedAt', '>', Timestamp.fromDate(new Date(timestamp))),
		);

		const querySnapshot = await getDocs(q);
		const notes: Note[] = [];

		for (const doc of querySnapshot.docs) {
			const note = doc.data() as ServerNote;
			const formattedNote = {
				...note,
				date: note.date.toDate().toUTCString(),
				metadata: {
					...note.metadata,
					createdAt: note.metadata.createdAt.toDate().toUTCString(),
					updatedAt: note.metadata.updatedAt.toDate().toUTCString(),
					syncedAt: note.metadata.syncedAt?.toDate().toUTCString(),
				},
			} satisfies Note;
			notes.push(formattedNote);
		}

		return notes;
	}

	// 단일 노트 가져오기
	async getNote(noteId: string, userId: string): Promise<Note | null> {
		const notesCollection = this.getNotesCollection(userId);
		const noteRef = doc(notesCollection, noteId);

		const docSnap = await getDoc(noteRef);

		if (docSnap.exists) {
			return docSnap.data() as Note;
		}

		return null;
	}
}

export const getNoteService = (): FirestoreNoteService => {
	return FirestoreNoteService.getInstance();
};
