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
