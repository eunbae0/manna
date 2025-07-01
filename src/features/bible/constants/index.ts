import type { BookIndexData } from '../types';

export const DEFAULT_BOOK_DATA: BookIndexData = {
	id: 'GEN',
	name_kr: '창세기',
	name_en: 'Genesis',
	filename: 'gen.json',
	chapters_count: 50,
	type: 'OT',
	group_kr: '모세오경',
	next_book: 'EXO',
	prev_book: null,
};

export const MAX_BIBLE_FONT_SIZE = 130;
export const MIN_BIBLE_FONT_SIZE = 80;

export const CURRENT_VERSE_ANIMATION_DURATION = 2 * 1000;
