import type { Timestamp } from 'firebase/firestore';
export interface Note {
	id: string;
	title: string;
	date: Timestamp;
	content: string;
	sermon: string;
	preacher: string;
	worshipType: string;
}

export interface NotesByMonth {
	[monthKey: string]: Note[];
}
