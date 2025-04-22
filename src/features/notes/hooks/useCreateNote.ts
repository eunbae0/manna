import { createUserNote } from '@/api/notes';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Timestamp } from '@react-native-firebase/firestore';
import type { ClientWorshipType } from '@/api/worship-types/types';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';

interface NoteData {
	title: string;
	date: Date;
	content?: string;
	sermon?: string;
	preacher?: string;
	worshipType: ClientWorshipType;
}

interface CreateNoteParams {
	onSuccess?: (noteId: string) => void;
	onError?: (error: Error) => void;
}

/**
 * Custom hook for creating a new note using React Query
 * @param params Optional callbacks for success and error handling
 * @returns Object containing mutation function and state
 */
export function useCreateNote({ onSuccess, onError }: CreateNoteParams = {}) {
	const queryClient = useQueryClient();
	const { mutate, isPending, error, isSuccess } = useMutation({
		mutationFn: async (noteData: NoteData) => {
			const formattedData = {
				...noteData,
				date: Timestamp.fromDate(noteData.date),
				content: noteData.content || '',
				sermon: noteData.sermon || '',
				preacher: noteData.preacher || '',
			};

			return await createUserNote(formattedData);
		},
		onSuccess: (note) => {
			onSuccess?.(note.id);

			// tracking amplitude
			trackAmplitudeEvent('노트 생성', {
				screen: 'Note_Create',
				note_has_sermon: !!note.sermon,
				note_has_preacher: !!note.preacher,
				note_content_length: note.content?.length || 0,
			});
			queryClient.invalidateQueries({ queryKey: ['notes'] });
		},
		onError: (error: Error) => {
			console.error('Failed to create note:', error);
			onError?.(error);
		},
	});

	return {
		createNote: mutate,
		isLoading: isPending,
		error,
		isSuccess,
	};
}
