import * as Clipboard from 'expo-clipboard';
import { useToastStore } from '@/store/toast';
import { isAndroid } from '../utils/platform';

export const useCopyText = (message: { success: string; error: string }) => {
	const { showToast } = useToastStore();

	const copyText = async (text: string) => {
		try {
			await Clipboard.setStringAsync(text);
			if (isAndroid) return;

			showToast({
				message: message.success,
				type: 'success',
			});
		} catch (error) {
			showToast({
				message: message.error,
				type: 'error',
			});
			console.error('Clipboard error:', error);
		}
	};

	return {
		copyText,
	};
};
