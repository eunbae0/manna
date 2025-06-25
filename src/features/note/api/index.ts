import { handleApiError } from '../../../api/errors';
import { withApiLogging } from '../../../api/utils/logger';
import { getNoteService } from './service';
import type { WorshipType } from '../../../api/worship-types/types';
import type { Note, NoteInput, NotesByMonth, UTCString } from '../types';

/**
 * 특정 시간 이후에 업데이트된 노트들을 가져옵니다.
 * @param timestamp 이 시간 이후에 업데이트된 노트만 가져옵니다.
 * @returns 업데이트된 노트 배열
 */
export const getNotesUpdatedSince = withApiLogging(
	async (timestamp: UTCString, userId: string): Promise<Note[]> => {
		try {
			const notes = await getNoteService().getNotesUpdatedSince(
				timestamp,
				userId,
			);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				count: notes.length,
				since: new Date(timestamp).toISOString(),
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(notes, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'getNotesUpdatedSince', 'notes');
		}
	},
	'getNotesUpdatedSince',
	'notes',
);

/**
 * 노트를 생성합니다.
 * @param noteData 생성할 노트 데이터
 * @returns 생성된 노트
 */
export const createNote = withApiLogging(
	async (noteData: Omit<Note, 'id'>, userId: string): Promise<Note> => {
		try {
			const note = await getNoteService().createNote(noteData, userId);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				noteId: note.id,
				title: note.title,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(note, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'createNote', 'notes');
		}
	},
	'createNote',
	'notes',
);

/**
 * 노트를 업데이트합니다.
 * @param note 업데이트할 노트 전체 데이터
 */
export const updateNote = withApiLogging(
	async (note: Note, userId: string): Promise<void> => {
		try {
			await getNoteService().updateNote(note, userId);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				noteId: note.id,
				title: note.title,
			};

			// We need to return void, but we can still pass the context
			Object.assign({}, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'updateNote', 'notes');
		}
	},
	'updateNote',
	'notes',
);

/**
 * 노트를 삭제합니다.
 * @param noteId 삭제할 노트 ID
 */
export const deleteNote = withApiLogging(
	async (noteId: string, userId: string): Promise<void> => {
		try {
			await getNoteService().deleteNote(noteId, userId);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				noteId,
			};

			// We need to return void, but we can still pass the context
			Object.assign({}, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'deleteNote', 'notes');
		}
	},
	'deleteNote',
	'notes',
);

/**
 * 특정 노트를 가져옵니다.
 * @param noteId 가져올 노트 ID
 * @returns 노트 객체 또는 null
 */
export const getNote = withApiLogging(
	async (noteId: string, userId: string): Promise<Note | null> => {
		try {
			const note = await getNoteService().getNote(noteId, userId);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				noteId,
				found: !!note,
			};

			// The withApiLogging wrapper will include this context in the success log
			return note ? Object.assign(note, { __logContext: context }) : null;
		} catch (error) {
			throw handleApiError(error, 'getNote', 'notes');
		}
	},
	'getNote',
	'notes',
);
