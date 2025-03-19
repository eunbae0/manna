import type { Note, NotesByMonth } from './types';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';
import { FirestoreNotesService } from './service';
import type { WorshipType } from '../worship-types/types';

const notesService = new FirestoreNotesService();

/**
 * Fetches sermon notes for the currently logged-in user
 * @returns An object containing the notes array and notes grouped by month
 */
export const fetchUserNotes = withApiLogging(
	async (): Promise<{
		notes: Note[];
		notesByMonth: NotesByMonth;
	}> => {
		try {
			const result = await notesService.getUserNotes();

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				count: result.notes.length,
				monthGroups: Object.keys(result.notesByMonth).length,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(result, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'fetchUserNotes', 'notes');
		}
	},
	'fetchUserNotes',
	'notes',
);

/**
 * Creates a new sermon note for the currently logged-in user
 * @param noteData Note data to be saved (title, date, content)
 * @returns ID of the created note
 */
export const createUserNote = withApiLogging(
	async (noteData: Omit<Note, 'id'>): Promise<string> => {
		try {
			const noteId = await notesService.createNote(noteData);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				noteId,
				title: noteData.title,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(noteId, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'createUserNote', 'notes');
		}
	},
	'createUserNote',
	'notes',
);

/**
 * Updates an existing sermon note for the currently logged-in user
 * @param noteId ID of the note to update
 * @param noteData Updated note data
 */
/**
 * Gets a single sermon note by ID for the currently logged-in user
 * @param noteId ID of the note to retrieve
 * @returns Note object or null if not found
 */
export const getUserNote = withApiLogging(
	async (noteId: string): Promise<Note> => {
		try {
			const note = await notesService.getNote(noteId);

			if (!note)
				throw handleApiError(
					new Error('Note not found'),
					'getUserNote',
					'notes',
				);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				noteId,
				found: !!note,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(note, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'getUserNote', 'notes');
		}
	},
	'getUserNote',
	'notes',
);

export const updateUserNote = withApiLogging(
	async (
		noteId: string,
		noteData: Partial<Omit<Note, 'id'>>,
	): Promise<void> => {
		try {
			await notesService.updateNote(noteId, noteData);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				noteId,
				updatedFields: Object.keys(noteData),
			};

			// The withApiLogging wrapper will include this context in the success log
			// We need to return void, but we can still pass the context
			Object.assign({}, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'updateUserNote', 'notes');
		}
	},
	'updateUserNote',
	'notes',
);

/**
 * Fetches all worship types for the currently logged-in user
 * @returns Array of worship types
 */
/**
 * Fetches sermon notes filtered by worship type for the currently logged-in user
 * @param worshipType Optional worship type to filter by
 * @returns An object containing the filtered notes array and notes grouped by month
 */
export const fetchUserNotesByWorshipType = withApiLogging(
	async (
		worshipTypeName: WorshipType['name'],
	): Promise<{
		notes: Note[];
		notesByMonth: NotesByMonth;
	}> => {
		try {
			const result =
				await notesService.getUserNotesByWorshipType(worshipTypeName);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				count: result.notes.length,
				monthGroups: Object.keys(result.notesByMonth).length,
				worshipTypeName,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(result, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'fetchUserNotesByWorshipType', 'notes');
		}
	},
	'fetchUserNotesByWorshipType',
	'notes',
);
