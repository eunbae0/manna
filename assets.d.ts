declare module 'assets/bible/krv/books_index.json' {
	import type { Book } from '@/features/bible/types';
	const value: Book[];
	export default value;
}

declare module 'assets/bible/krv/*.json' {
	import type { BookData } from '@/features/bible/types';
	const value: BookData;
	export default value;
}
