import {
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	where,
	type DocumentData,
	type CollectionReference,
	type DocumentReference,
	addDoc,
	updateDoc,
} from 'firebase/firestore';
import { auth, database } from '@/firebase/config';
import type { Note, NotesByMonth } from './types';
import { serverTimestamp } from '@/firebase/firestore';
import { FirestoreWorshipTypesService } from '../worship-types/service';
import type { WorshipType } from '../worship-types/types';

/**
 * Notes service class for handling Firestore operations related to sermon notes
 */
export class FirestoreNotesService extends FirestoreWorshipTypesService {
	getNotesCollectionRef(): CollectionReference<DocumentData> {
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
			const data = doc.data() as DocumentData;
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

	async createNote(noteData: Omit<Note, 'id'>): Promise<string> {
		const noteToSave = {
			...noteData,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};

		const newNoteRef = await addDoc(this.getNotesCollectionRef(), noteToSave);

		return newNoteRef.id;
	}

	async getNote(noteId: string): Promise<Note | null> {
		try {
			const noteRef = doc(this.getNotesCollectionRef(), noteId);
			const noteSnapshot = await getDoc(noteRef);

			if (!noteSnapshot.exists()) {
				return null;
			}

			const data = noteSnapshot.data();
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
			where('worshipType', '==', worshipTypeName),
			orderBy('date', 'desc'),
		);

		const querySnapshot = await getDocs(q);

		const notes: Note[] = [];
		for (const doc of querySnapshot.docs) {
			const data = doc.data() as DocumentData;
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
}
