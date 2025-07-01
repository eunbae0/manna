import { useEffect } from 'react';
import { useBibleStore } from '../store/bible';
import { CURRENT_VERSE_ANIMATION_DURATION } from '../constants';

/**
 * currentVerse가 변경되면, 애니메이션 후 null로 초기화합니다.
 */
export function useInitializeCurrentVerse() {
	const { currentVerse, setCurrentVerse } = useBibleStore();

	useEffect(() => {
		if (currentVerse) {
			setTimeout(() => {
				setCurrentVerse(null);
			}, CURRENT_VERSE_ANIMATION_DURATION);
		}
	}, [currentVerse, setCurrentVerse]);
}
