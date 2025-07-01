import { Share } from 'react-native';

export const useShareText = () => {
	const shareText = async (text: string) => {
		await Share.share({
			message: text,
		});
	};

	return {
		shareText,
	};
};
