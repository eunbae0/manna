import { storage } from '../../../storage/index';
import type { VerseHighlight } from '../types/highlight';

const getUserKeyPrefix = (userId: string) => `user_${userId}_`;

export class BibleStorageService {
	private static instance: BibleStorageService;
	private userId: string | null = null;

	private constructor() {}

	public static getInstance(userId: string): BibleStorageService {
		// 기존 인스턴스가 있고 userId가 일치하면 그대로 반환
		if (
			BibleStorageService.instance &&
			BibleStorageService.instance.userId === userId
		) {
			return BibleStorageService.instance;
		}

		// userId가 다르거나 인스턴스가 없으면 새 인스턴스 생성
		BibleStorageService.instance = new BibleStorageService();
		BibleStorageService.instance.setUserId(userId);
		return BibleStorageService.instance;
	}

	private getNotesKey(): string {
		if (!this.userId) {
			throw new Error(
				'사용자 ID가 설정되지 않았습니다. setUserId를 먼저 호출하세요.',
			);
		}
		return `${getUserKeyPrefix(this.userId)}bible_highlight`;
	}

	public setUserId(userId: string): void {
		this.userId = userId;
	}

	public getHighlights(bookId: string, chapter: number): VerseHighlight[] {
		const highlightsJson = storage.getString(this.getNotesKey());
		const highlights: Record<
			string,
			Record<string, VerseHighlight[]>
		> = highlightsJson ? JSON.parse(highlightsJson) : {};
		return highlights[bookId]?.[chapter] || [];
	}

	public saveHighlight(highlight: VerseHighlight): VerseHighlight {
		const highlightJson = storage.getString(this.getNotesKey());
		const highlights: Record<
			string,
			Record<string, VerseHighlight[]>
		> = highlightJson ? JSON.parse(highlightJson) : {};

		const { bookId, chapter } = highlight.identifier;

		if (!highlights[bookId]) {
			highlights[bookId] = {};
		}

		if (!highlights[bookId][chapter]) {
			highlights[bookId][chapter] = [];
		}

		const isExist = highlights[bookId][chapter].some(
			(h) => h.id === highlight.id,
		);

		// highlight가 존재하지 않으면 추가
		if (!isExist) {
			highlights[bookId][chapter].push(highlight);
			storage.set(this.getNotesKey(), JSON.stringify(highlights));

			return highlight;
		}

		const existingHighlight = highlights[bookId][chapter].find(
			(h) => h.id === highlight.id,
		);
		const isSame =
			existingHighlight?.color === highlight.color &&
			existingHighlight?.type === highlight.type;

		// highlight가 변경되면 수정
		if (!isSame) {
			highlights[bookId][chapter] = highlights[bookId][chapter].map((h) =>
				h.id === highlight.id ? highlight : h,
			);
			storage.set(this.getNotesKey(), JSON.stringify(highlights));
			return highlight;
		}

		// highlight가 동일하면 제거
		highlights[bookId][chapter] = highlights[bookId][chapter].filter(
			(h) => h.id !== highlight.id,
		);
		storage.set(this.getNotesKey(), JSON.stringify(highlights));
		return highlight;
	}
}
