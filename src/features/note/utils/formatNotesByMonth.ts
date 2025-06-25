import { formatLocalDate } from '@/shared/utils/date';
import type { Note, NotesByMonth } from '../types';

export function formatNotesByMonth(notes: Note[]) {
	const sortedNotes = [...notes].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);

	const notesByMonth: NotesByMonth = {};
	for (const note of sortedNotes) {
		const monthKey = formatLocalDate(new Date(note.date), {
			style: 'text',
			showDay: false,
		});
		if (!notesByMonth[monthKey]) {
			notesByMonth[monthKey] = [];
		}
		notesByMonth[monthKey].push(note);
	}

	return notesByMonth;
}
