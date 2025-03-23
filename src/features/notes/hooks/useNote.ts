import { getUserNote, updateUserNote } from '@/api/notes';
import { Note } from '@/api/notes/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';

interface UpdateNoteData {
  title: string;
  date: Date;
  content?: string;
  sermon?: string;
  preacher?: string;
  worshipType: string;
}

interface UpdateNoteParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook to fetch a single note by ID
 * @param id The ID of the note to fetch
 * @returns Object containing note data, loading state, and error
 */
export function useNote(id: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      if (!id) return null;
      return await getUserNote(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    note: data,
    isLoading,
    error,
  };
}

/**
 * Custom hook for updating a note using React Query
 * @param id The ID of the note to update
 * @param params Optional callbacks for success and error handling
 * @returns Object containing mutation function and state
 */
export function useUpdateNote(id: string | undefined, { onSuccess, onError }: UpdateNoteParams = {}) {
  const queryClient = useQueryClient();
  
  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: async (noteData: UpdateNoteData) => {
      if (!id) throw new Error('Note ID is required');
      
      const formattedData = {
        ...noteData,
        date: Timestamp.fromDate(noteData.date),
        content: noteData.content || '',
        sermon: noteData.sermon || '',
        preacher: noteData.preacher || '',
      };
      
      await updateUserNote(id, formattedData);
      return { id, ...formattedData };
    },
    onSuccess: () => {
      // Invalidate and refetch the note query
      queryClient.invalidateQueries({ queryKey: ['note', id] });
      // Also invalidate the notes list
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Failed to update note:', error);
      onError?.(error);
    },
  });

  return {
    updateNote: mutate,
    isLoading: isPending,
    error,
    isSuccess,
  };
}
