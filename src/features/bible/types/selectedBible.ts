export type SelectedBible = {
	title: string;
	version: 'KRV';
	content: {
		bookId: string;
		chapter: number;
		verse: number;
		text: string;
	}[];
};
