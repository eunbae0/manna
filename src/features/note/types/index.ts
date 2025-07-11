import type { ClientWorshipType } from '@/api/worship-types/types';
import type { SelectedBible } from '@/features/bible/types/selectedBible';
import type { Timestamp } from '@react-native-firebase/firestore';
export interface NotesByMonth {
	[monthKey: string]: Note[];
}

/** type of new Date().toUTCString() */
export type UTCString = string;

export interface Note {
	id: string;
	title: string;
	content: string;
	date: UTCString;
	sermon: SelectedBible[] | string;
	preacher: string;
	worshipType: ClientWorshipType;
	metadata: {
		createdAt: UTCString;
		updatedAt: UTCString;
		syncedAt?: UTCString;
		isDeleted?: boolean;
	};
}
export interface ServerNote extends Omit<Note, 'date' | 'metadata'> {
	date: Timestamp;
	metadata: {
		createdAt: Timestamp;
		updatedAt: Timestamp;
		syncedAt?: Timestamp;
		isDeleted?: boolean;
	};
}

export interface WorshipType {
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
	syncedAt?: number;
	isDeleted?: boolean;
}

export type ID = string;

// 동기화 관련 메타데이터
export interface SyncMetadata {
	lastSyncTime: UTCString;
	pendingChanges: Array<ID>;
}

export type NoteInput = Partial<Note> & { worshipType: ClientWorshipType };
