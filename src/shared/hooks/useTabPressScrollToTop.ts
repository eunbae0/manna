import { useCallback, useRef } from 'react';
import type { FlashList } from '@shopify/flash-list';
import { useEffect } from 'react';
import type { FlatList, ScrollView } from 'react-native';
import { useNavigation } from 'expo-router';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export function useTabPressScrollToTop<
	T extends ScrollView | FlatList<any> | FlashList<any>,
>() {
	const ref = useRef<T>(null);
	const navigation = useNavigation<BottomTabNavigationProp<any>>();
	const scrollToTop = useCallback(() => {
		if (!ref.current) return;
		if ('scrollToOffset' in ref.current) {
			(ref.current as FlatList<any> | FlashList<any>).scrollToOffset({
				animated: true,
				offset: 0,
			});
		} else {
			(ref.current as ScrollView).scrollTo({ animated: true, y: 0 });
		}
	}, []);

	useEffect(() => {
		const unsubscribe = navigation.addListener('tabPress', (e) => {
			const state = navigation.getState();
			const isCurrentTab = state.history
				.map((i) => i.key)
				.includes(e.target as string);

			if (!isCurrentTab) return;
			scrollToTop();
		});

		return () => unsubscribe();
	}, [navigation, scrollToTop]);
	return ref;
}
