import type { TextSize } from '@/shared/components/text';
import type { BookData, BookIndex } from '../types';

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
