import type { TextSize } from '@/shared/components/text';
import type { BookData, Verse } from '../types';
import { isEmptyArray } from '@/shared/utils/object';

export const getJsonDynamically = async <T>(
	filename: string,
): Promise<T | null> => {
	try {
		const biblesMap = new Map<string, T>();
		// In development, use require
		const req = require.context(
			'../../../../assets/bible/krv',
			true,
			/\.json$/,
		);

		for (const filename of req.keys()) {
			// fileExports contains all exports, including default and named
			const fileExports = req(filename);
			// now we set an entry in the map like 'title' => module
			biblesMap.set(filename, fileExports);
		}

		return biblesMap.get(filename) || null;
	} catch (error) {
		console.error(`Failed to load ${filename}:`, error);
		throw error;
	}
};

// Type guards for dynamic imports
export const isBookData = (data: unknown): data is BookData => {
	return (
		typeof data === 'object' &&
		data !== null &&
		'id' in data &&
		'chapters' in data
	);
};

export function getTextSizeByFontSize(fontSize: number): TextSize {
	switch (fontSize) {
		case 80:
			return 'md';
		case 90:
			return 'lg';
		case 100:
			return 'xl';
		case 110:
			return '2xl';
		case 120:
			return '3xl';
		case 130:
			return '4xl';
		default:
			return 'xl';
	}
}

export function formatSelectedVerses(selectedVerses: number[]): string {
	if (isEmptyArray(selectedVerses)) {
		return '';
	}
	if (selectedVerses.length === 1) {
		return `${selectedVerses[0]}절`;
	}
	const orderedVerses = [...selectedVerses].sort((a, b) => a - b);
	const textChunks = orderedVerses.reduce((acc, verse, index) => {
		if (index === 0) {
			acc.push(`${verse}`);
			return acc;
		}

		if (verse === orderedVerses[index - 1] + 1) {
			const lastChunk = acc[acc.length - 1];
			const isContinued = /~/.test(lastChunk);
			if (isContinued) {
				acc[acc.length - 1] = `${lastChunk.split('~')[0]}~${verse}`;
			} else {
				acc[acc.length - 1] = `${lastChunk}~${verse}`;
			}
			return acc;
		}

		acc.push(`${verse}`);
		return acc;
	}, [] as string[]);
	return `${textChunks.join(', ')}절`;
}

export function formatCopyedText({
	verses,
	bookName,
	chapter,
	selectedVerses,
}: {
	verses: Verse[];
	bookName: string | null;
	chapter: number | null;
	selectedVerses: number[];
}): string {
	if (!bookName || !chapter) {
		throw new Error('권 또는 장 정보가 없어요.');
	}
	return verses
		.filter((verse) => selectedVerses.includes(verse.verse))
		.map((verse) => `${bookName} ${chapter}장 ${verse.verse}절: ${verse.text}`)
		.join('\n');
}
