import { formatSelectedVerses } from './index';
import type { SelectedBible } from '../types/selectedBible';
import type { Verse } from '../types';
type FormatToSelectedBibleProps = {
	bookName: string;
	bookId: string;
	chapter: number;
	verses: Verse[];
	selectedVerses: number[];
};

export function formatToSelectedBible({
	bookName,
	bookId,
	chapter,
	verses,
	selectedVerses,
}: FormatToSelectedBibleProps): SelectedBible {
	return {
		title: `${bookName} ${chapter}장 ${formatSelectedVerses(selectedVerses)}`,
		version: 'KRV',
		content: selectedVerses.map((selectedVerse) => ({
			bookId,
			chapter,
			verse: selectedVerse,
			text: verses.find((v) => v.verse === selectedVerse)?.text || '',
		})),
	};
}
