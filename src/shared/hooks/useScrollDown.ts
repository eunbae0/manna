import type { FlashListProps } from '@shopify/flash-list';
import { useRef, useState } from 'react';

export type UseScrollDownReturnType = {
	isScrollDown: boolean;
	onScrollDown: FlashListProps<any>['onScroll'];
};

export function useScrollDown(): UseScrollDownReturnType {
	const lastScrollY = useRef(0);
	const [isScrollDown, setIsScrollDown] = useState(false);

	const onScrollDown: FlashListProps<any>['onScroll'] = (e) => {
		const currentScrollY = e.nativeEvent.contentOffset.y;
		if (currentScrollY < 0) return;
		if (currentScrollY > lastScrollY.current) {
			// 아래로 스크롤
			setIsScrollDown(true);
		} else {
			// 위로 스크롤
			setIsScrollDown(false);
		}

		lastScrollY.current = currentScrollY;
	};

	// const scrollGest = useMemo(() => {
	// 	return Gesture.Pan().onUpdate((event) => {
	// 		console.log(event);
	// 		if (event.translationY < 0) {
	// 			runOnJS(setIsScrollDown)(true);
	// 		} else {
	// 			runOnJS(setIsScrollDown)(false);
	// 		}
	// 	});
	// }, []);

	return { isScrollDown, onScrollDown };
}
