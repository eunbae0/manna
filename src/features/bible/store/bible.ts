import { create } from 'zustand';
import { getJsonDynamically } from '../utils';
import type { BookData, BookIndex, Verse } from '../types';
import { DEFAULT_BOOK_DATA } from '../constants';
import { BibleStorageService } from '../storage';
import { useAuthStore } from '@/store/auth';
import type { VerseHighlight } from '../types/highlight';

interface SearchResult {
	bookId: string;
	bookName: string;
	chapter: number;
	verse: number;
	text: string;
	preview: string;
}

interface BibleState {
	// Current state
	bookIndex: BookIndex;
	currentBookId: string | null;
	currentChapter: number | null;
	currentVerse: number | null;
	selectedVerses: number[];
	verses: Verse[];
	isLoading: boolean;
	error: string | null;
	searchQuery: string;
	searchResults: SearchResult[];
	isSearching: boolean;
	fontSize: number;
	currentHighlights: VerseHighlight[];

	// Actions
	loadBooksIndex: () => Promise<void>;
	loadVerses: (bookId: string, chapter: number) => Promise<void>;
	setCurrentBook: (bookId: string) => void;
	setCurrentChapter: (chapter: number) => Promise<void>;
	setCurrentVerse: (verse: number | null) => void;
	goToNextChapter: (showInfoToast: (message: string) => void) => Promise<void>;
	goToPrevChapter: (showInfoToast: (message: string) => void) => Promise<void>;

	loadHighlights: (bookId: string, chapter: number) => void;
	addHighlights: (highlights: VerseHighlight[]) => void;

	addSelectedVerses: (verse: number) => void;
	removeSelectedVerses: (verse: number) => void;
	clearSelectedVerses: () => void;

	// Search actions
	setSearchQuery: (query: string) => void;
	searchVerses: (query: string) => Promise<void>;
	clearSearch: () => void;
	setFontSize: (fontSize: number) => void;
}

export const useBibleStore = create<BibleState>((set, get) => ({
	// Initial state
	bookIndex: [],
	currentBookId: DEFAULT_BOOK_DATA.id,
	currentChapter: 1,
	currentVerse: null,
	selectedVerses: [],
	verses: [],
	chapters: [],
	isLoading: true,
	error: null,
	searchQuery: '',
	searchResults: [],
	isSearching: false,
	fontSize: 100,
	currentHighlights: [],

	// Load all books from the index
	loadBooksIndex: async () => {
		try {
			set({ isLoading: true, error: null });
			// Import the books index dynamically to avoid loading all JSON files at once
			const booksData =
				await getJsonDynamically<BookIndex>('./books_index.json');
			if (!booksData) {
				throw new Error('Book index not found');
			}
			set({
				bookIndex: booksData,
			});
		} catch (error) {
			console.error('Failed to load books:', error);
			set({ error: '성경 인덱스를 불러오는 데 실패했습니다.' });
		} finally {
			set({ isLoading: false });
		}
	},

	// Load verses for a specific book and chapter
	loadVerses: async (bookId: string, chapter: number) => {
		try {
			set({ isLoading: true, error: null });

			// Import the book data dynamically
			const { bookIndex } = get();
			if (!bookIndex) {
				throw new Error('Book index not found');
			}

			const fileName = bookIndex.find((b) => b.id === bookId)?.filename;
			if (!fileName) {
				throw new Error('Book not found');
			}

			const bookData = await getJsonDynamically<BookData>(`./${fileName}`);
			const chapterData = bookData?.chapters.find((c) => c.chapter === chapter);

			if (!chapterData) {
				throw new Error('Chapter not found');
			}

			set({
				verses: chapterData.verses,
				currentChapter: chapter,
			});
		} catch (error) {
			console.error(`Failed to load verses for ${bookId} ${chapter}:`, error);
			set({ error: '성경 구절을 불러오는 데 실패했습니다.' });
		} finally {
			set({ isLoading: false });
		}
	},

	// Navigation actions
	setCurrentBook: (bookId) => {
		set({ currentBookId: bookId });
	},

	setCurrentChapter: async (chapter) => {
		const { currentBookId } = get();
		if (!currentBookId) return;

		set({ currentChapter: chapter });
		return await get().loadVerses(currentBookId, chapter);
	},

	setCurrentVerse: (verse) => {
		set({ currentVerse: verse });
	},

	goToNextChapter: async (showInfoToast: (message: string) => void) => {
		const { currentBookId, currentChapter, bookIndex } = get();
		if (!currentBookId || currentChapter === null) return;

		const bookIndexData = bookIndex.find((b) => b.id === currentBookId);
		if (!bookIndexData) return;

		const nextChapter = currentChapter + 1;
		if (nextChapter <= bookIndexData.chapters_count) {
			await get().loadVerses(currentBookId, nextChapter);
		} else {
			const nextBook = bookIndex.find((b) => b.id === currentBookId)?.next_book;
			if (!nextBook) {
				showInfoToast('마지막 권이에요.');
				return;
			}
			set({ currentBookId: nextBook, currentChapter: 1 });
			await get().loadVerses(nextBook, 1);
			const nextBookData = bookIndex.find((b) => b.id === nextBook);
			showInfoToast(`${nextBookData?.name_kr}로 넘어갔어요.`);
		}
	},

	goToPrevChapter: async (showInfoToast: (message: string) => void) => {
		const { currentBookId, currentChapter, bookIndex } = get();
		if (!currentBookId || !currentChapter) return;

		const prevChapter = currentChapter - 1;
		if (prevChapter >= 1) {
			await get().loadVerses(currentBookId, prevChapter);
		} else {
			const prevBookId = bookIndex.find(
				(b) => b.id === currentBookId,
			)?.prev_book;
			if (!prevBookId) {
				showInfoToast('첫 권이에요.');
				return;
			}
			const prevBookData = bookIndex.find((b) => b.id === prevBookId);
			const prevBookChaptersCount = prevBookData?.chapters_count ?? 1;
			set({
				currentBookId: prevBookId,
				currentChapter: prevBookChaptersCount,
			});
			await get().loadVerses(prevBookId, prevBookChaptersCount);
			showInfoToast(`${prevBookData?.name_kr}로 넘어갔어요.`);
		}
	},

	// Highlight actions
	loadHighlights: (bookId: string, chapter: number) => {
		const { user } = useAuthStore.getState();
		const highlightStorage = BibleStorageService.getInstance(user?.id || '');
		const currentHighlights = highlightStorage.getHighlights(bookId, chapter);
		set({ currentHighlights });
	},

	addHighlights: (highlights: VerseHighlight[]) => {
		if (!get().currentBookId || !get().currentChapter) return;
		const { user } = useAuthStore.getState();
		const highlightStorage = BibleStorageService.getInstance(user?.id || '');
		for (const highlight of highlights) {
			highlightStorage.saveHighlight(highlight);
		}
		get().loadHighlights(get().currentBookId!, get().currentChapter!);
	},

	// Search actions
	setSearchQuery: (query: string) => set({ searchQuery: query }),

	clearSearch: () =>
		set({ searchQuery: '', searchResults: [], isSearching: false }),

	searchVerses: async (query: string) => {
		const { bookIndex } = get();
		if (!query.trim()) {
			set({ searchResults: [], isSearching: false });
			return;
		}

		set({ isSearching: true, error: null });

		try {
			const results: SearchResult[] = [];
			const searchTerm = query.toLowerCase();

			// Limit search to first 100 results for performance
			const MAX_RESULTS = 100;

			// Search through each book
			for (const book of bookIndex) {
				if (results.length >= MAX_RESULTS) break;

				try {
					const bookData = await getJsonDynamically<BookData>(book.filename);

					if (!bookData) {
						throw new Error('Book data not found');
					}

					// Search through each chapter
					for (const chapterData of bookData.chapters) {
						if (results.length >= MAX_RESULTS) break;

						// Search through each verse
						for (const verse of chapterData.verses) {
							if (verse.text.toLowerCase().includes(searchTerm)) {
								// Create a preview of the text with the search term highlighted
								const preview = verse.text;
								results.push({
									bookId: book.id,
									bookName: book.name_kr,
									chapter: chapterData.chapter,
									verse: verse.verse,
									text: verse.text,
									preview: preview,
								});

								if (results.length >= MAX_RESULTS) break;
							}
						}
					}
				} catch (error) {
					console.error(`Error searching in book ${book.name_kr}:`, error);
					// Continue with next book if there's an error
				}
			}

			set({ searchResults: results, isSearching: false });
		} catch (error) {
			console.error('Search error:', error);
			set({
				error: '검색 중 오류가 발생했습니다.',
				isSearching: false,
				searchResults: [],
			});
		}
	},

	setFontSize: (fontSize: number) => set({ fontSize }),

	addSelectedVerses: (verse: number) =>
		set((state) => ({ selectedVerses: [...state.selectedVerses, verse] })),
	removeSelectedVerses: (verse: number) =>
		set((state) => ({
			selectedVerses: state.selectedVerses.filter((v) => v !== verse),
		})),
	clearSelectedVerses: () => set({ selectedVerses: [] }),
}));
