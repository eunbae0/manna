import { useState, useEffect, useCallback } from 'react';
import { View, TextInput, FlatList, Keyboard } from 'react-native';
import { useBibleStore } from '../store/bible';
import { Text } from '@/shared/components/text';
import { Button } from '@/components/common/button';
import { Search, X } from 'lucide-react-native';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import AnimatedPressable from '@/components/common/animated-pressable';

interface BibleSearchProps {
	onResultPress: (result: {
		bookId: string;
		chapter: number;
		verse: number;
	}) => void;
}

export function BibleSearch({ onResultPress }: BibleSearchProps) {
	const {
		searchQuery,
		searchResults,
		isSearching,
		setSearchQuery,
		searchVerses,
		clearSearch,
		setCurrentBook,
		setCurrentChapter,
		setCurrentVerse,
		loadVerses,
	} = useBibleStore();

	const [localQuery, setLocalQuery] = useState('');
	const [isFocused, setIsFocused] = useState(false);

	// Memoize the search handler to avoid recreating it on every render
	const handleSearch = useCallback(() => {
		if (localQuery.trim()) {
			searchVerses(localQuery);
		} else {
			clearSearch();
		}
	}, [localQuery, searchVerses, clearSearch]);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(handleSearch, 500);
		return () => clearTimeout(timer);
	}, [handleSearch]);

	const handleClear = () => {
		setLocalQuery('');
		clearSearch();
		Keyboard.dismiss();
	};

	const handleResultPress = (result: {
		bookId: string;
		chapter: number;
		verse: number;
	}) => {
		onResultPress(result);
		Keyboard.dismiss();
	};

	return (
		<View className="flex-1 bg-white dark:bg-gray-900">
			<HStack className="items-center p-2 border-b border-gray-100 dark:border-gray-800">
				<View className="flex-1 flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 mx-2">
					<Search size={20} color="#6b7280" className="mr-2" />
					<TextInput
						className="flex-1 py-2 text-base text-gray-900 dark:text-white"
						placeholder="성경 구절 검색..."
						placeholderTextColor="#9ca3af"
						value={localQuery}
						onChangeText={setLocalQuery}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						autoCapitalize="none"
						autoCorrect={false}
						returnKeyType="search"
						onSubmitEditing={() => searchVerses(localQuery)}
					/>
					{localQuery ? (
						<AnimatedPressable onPress={handleClear} className="p-1">
							<X size={20} color="#9ca3af" />
						</AnimatedPressable>
					) : null}
				</View>
				{isFocused && (
					<Button variant="text" onPress={() => Keyboard.dismiss()}>
						취소
					</Button>
				)}
			</HStack>

			{isSearching ? (
				<VStack className="flex-1 items-center justify-center p-4">
					<Text>검색 중...</Text>
				</VStack>
			) : searchResults.length > 0 ? (
				<FlatList
					data={searchResults}
					keyExtractor={(item, index) =>
						`${item.bookId}-${item.chapter}-${item.verse}-${index}`
					}
					renderItem={({ item }) => (
						<AnimatedPressable
							onPress={() => handleResultPress(item)}
							className="p-4 border-b border-gray-100 dark:border-gray-800"
						>
							<HStack className="items-start space-x-2">
								<Text className="text-blue-500" weight="semi-bold">
									{item.bookName} {item.chapter}:{item.verse}
								</Text>
								<Text className="flex-1" numberOfLines={2}>
									{item.preview}
								</Text>
							</HStack>
						</AnimatedPressable>
					)}
					contentContainerStyle={{ paddingBottom: 20 }}
				/>
			) : searchQuery ? (
				<VStack className="flex-1 items-center justify-center p-4">
					<Text>검색 결과가 없습니다.</Text>
				</VStack>
			) : (
				<VStack className="flex-1 items-center justify-center p-4">
					<Search size={48} color="#d1d5db" className="mb-4" />
					<Text className="text-gray-400 text-center mb-2">
						성경 구절을 검색해보세요
					</Text>
					<Text className="text-gray-400 text-sm text-center">
						예) 사랑, 요한복음 3장 16절, 믿음의 선진들
					</Text>
				</VStack>
			)}
		</View>
	);
}
