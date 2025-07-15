import { useBibleStore } from '@/features/bible/store/bible';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export function useRedirectBible() {
	const { bookIndex, setCurrentBook, setCurrentChapter, setCurrentVerse } =
		useBibleStore();

	const redirectToBible = ({
		book,
		chapter,
		verse,
	}: {
		book: string;
		chapter: number;
		verse: number;
	}) => {
		const bookName = bookIndex.find((b) => b.id === book)?.name_kr;
		Alert.alert(`${bookName} ${chapter}장 ${verse}절로 이동할까요?`, '', [
			{
				text: '아니요',
				style: 'cancel',
			},
			{
				text: '네, 이동할게요',
				onPress: () => {
					setCurrentBook(book);
					setCurrentChapter(chapter);
					setCurrentVerse(verse);

					router.dismissAll();
					router.replace('/(app)/(tabs)/bible');
				},
			},
		]);
	};

	return {
		redirectToBible,
	};
}
