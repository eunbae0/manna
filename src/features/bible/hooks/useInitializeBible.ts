import { useEffect } from 'react';
import { useBibleStore } from '../store/bible';

/**
 * 성경 index를 초기에 로딩하고, chapter가 변경되면 verses를 load합니다.
 */
export const useInitializeBible = () => {
	const { loadBooksIndex, loadVerses, currentBookId, currentChapter } =
		useBibleStore();

	useEffect(() => {
		(async () => {
			await loadBooksIndex();
			if (currentBookId && currentChapter) {
				await loadVerses(currentBookId, currentChapter);
			}
		})();
	}, [loadBooksIndex, loadVerses, currentBookId, currentChapter]);
};
