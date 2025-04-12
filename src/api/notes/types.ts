import type { Timestamp } from '@react-native-firebase/firestore';
import type { ClientWorshipType } from '../worship-types/types';
export interface Note {
	id: string;
	title: string;
	date: Timestamp;
	content: string;
	sermon: string;
	preacher: string;
	worshipType: ClientWorshipType;
}

export interface NotesByMonth {
	[monthKey: string]: Note[];
}
