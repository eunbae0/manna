export type VerseHighlight = {
	id: string;
	identifier: { bookId: string; chapter: number; verse: number };
	color: VerseHighlightColor;
	type: VerseHighlightType;
	// metadata: {
	// 	createdAt: string;
	// 	updatedAt: string;
	// 	syncedAt: string | undefined;
	// 	isDeleted: boolean;
	// };
};

export type VerseHighlightColor = 'yellow' | 'green' | 'red';
export type VerseHighlightType = 'marker' | 'underscore';
