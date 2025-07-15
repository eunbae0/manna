import { useRef } from 'react';
import type { FlashList } from '@shopify/flash-list';
import { useEffect } from 'react';
import type { FlatList, ScrollView } from 'react-native';

export function useTabPressScrollToTop<
	T extends ScrollView | FlatList<any> | FlashList<any>,
>() {
	const ref = useRef<T>(null);

	const scrollToTop = () => {
		if (!ref.current) return;
		if ('scrollToOffset' in ref.current) {
			(ref.current as FlatList<any> | FlashList<any>).scrollToOffset({
				animated: true,
				offset: 0,
			});
		} else {
			(ref.current as ScrollView).scrollTo({ animated: true, y: 0 });
		}
	};

	useEffect(() => {
		scrollToTop();
	});

	return ref;
}
