import {
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	where,
	addDoc,
	updateDoc,
	deleteDoc,
	type FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { database } from '@/firebase/config';
import type { Note, NotesByMonth } from './types';
import { serverTimestamp } from '@/firebase/firestore';
import { FirestoreWorshipTypesService } from '../worship-types/service';
import type { WorshipType } from '../worship-types/types';

/**
 * Notes service class for handling Firestore operations related to sermon notes
 */
export class FirestoreNotesService extends FirestoreWorshipTypesService {
	// 싱글톤 인스턴스를 저장할 정적 변수 - 부모 클래스와 충돌하지 않는 이름 사용
	private static notesInstance: FirestoreNotesService | null = null;

	// 싱글톤 인스턴스를 반환하는 정적 메서드
	public static getInstance(): FirestoreNotesService {
		if (!FirestoreNotesService.notesInstance) {
			FirestoreNotesService.notesInstance = new FirestoreNotesService();
		}
		return FirestoreNotesService.notesInstance;
	}

	// 생성자를 protected로 설정하여 상속 클래스에서만 생성할 수 있도록 함
	protected constructor() {
		super();
	}
	getNotesCollectionRef(): FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData> {
		this.updateUserId();
		return collection(database, 'users', this.userId, 'notes');
	}

	async getUserNotes(): Promise<{
		notes: Note[];
		notesByMonth: NotesByMonth;
	}> {
		const q = query(this.getNotesCollectionRef(), orderBy('date', 'desc'));
		const querySnapshot = await getDocs(q);

		const notes: Note[] = [];
		for (const doc of querySnapshot.docs) {
			const data = doc.data() as FirebaseFirestoreTypes.DocumentData;
			notes.push({
				id: doc.id,
				title: data.title || '',
				date: data.date || '',
				content: data.content || '',
				sermon: data.sermon || '',
				preacher: data.preacher || '',
				worshipType: data.worshipType || '',
			});
		}

		// Group notes by month
		const notesByMonth: NotesByMonth = {};
		for (const note of notes) {
			const date = note.date.toDate();
			const monthKey = `${date.getFullYear()}.${String(
				date.getMonth() + 1,
			).padStart(2, '0')}`;

			if (!notesByMonth[monthKey]) {
				notesByMonth[monthKey] = [];
			}
			notesByMonth[monthKey].push(note);
		}

		return {
			notes,
			notesByMonth,
		};
	}

	async createNote(noteData: Omit<Note, 'id'>): Promise<Note> {
		const noteToSave = {
			...noteData,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};

		const newNoteRef = await addDoc(this.getNotesCollectionRef(), noteToSave);

		return { ...noteData, id: newNoteRef.id };
	}

	async getNote(noteId: string): Promise<Note | null> {
		try {
			const noteRef = doc(this.getNotesCollectionRef(), noteId);
			const noteSnapshot = await getDoc(noteRef);

			if (!noteSnapshot.exists) {
				return null;
			}

			const data = noteSnapshot.data() || {};
			return {
				id: noteSnapshot.id,
				title: data.title || '',
				date: data.date || '',
				content: data.content || '',
				sermon: data.sermon || '',
				preacher: data.preacher || '',
				worshipType: data.worshipType || '',
			};
		} catch (error) {
			console.error('Error getting note:', error);
			return null;
		}
	}

	async getUserNotesByWorshipType(
		worshipTypeName: WorshipType['name'],
	): Promise<{
		notes: Note[];
		notesByMonth: NotesByMonth;
	}> {
		const ref = this.getNotesCollectionRef();
		const q = query(
			ref,
			where('worshipType.name', '==', worshipTypeName),
			orderBy('date', 'desc'),
		);

		const querySnapshot = await getDocs(q);

		const notes: Note[] = [];
		for (const doc of querySnapshot.docs) {
			const data = doc.data() as FirebaseFirestoreTypes.DocumentData;
			notes.push({
				id: doc.id,
				title: data.title || '',
				date: data.date || '',
				content: data.content || '',
				sermon: data.sermon || '',
				preacher: data.preacher || '',
				worshipType: data.worshipType || '',
			});
		}

		// Group notes by month
		const notesByMonth: NotesByMonth = {};
		for (const note of notes) {
			const date = note.date.toDate();
			const monthKey = `${date.getFullYear()}.${String(
				date.getMonth() + 1,
			).padStart(2, '0')}`;

			if (!notesByMonth[monthKey]) {
				notesByMonth[monthKey] = [];
			}
			notesByMonth[monthKey].push(note);
		}

		return {
			notes,
			notesByMonth,
		};
	}

	async updateNote(
		noteId: Note['id'],
		noteData: Partial<Omit<Note, 'id'>>,
	): Promise<void> {
		const noteRef = doc(this.getNotesCollectionRef(), noteId);

		const noteToUpdate = {
			...noteData,
			updatedAt: serverTimestamp(),
		};

		await updateDoc(noteRef, noteToUpdate);
	}

	/**
	 * Deletes a note by ID
	 * @param noteId ID of the note to delete
	 * @returns Promise that resolves when the note is deleted
	 */
	async deleteNote(noteId: Note['id']): Promise<void> {
		const noteRef = doc(this.getNotesCollectionRef(), noteId);
		await deleteDoc(noteRef);
	}
}
