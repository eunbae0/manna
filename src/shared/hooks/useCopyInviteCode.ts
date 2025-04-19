import * as Clipboard from 'expo-clipboard';
import { useToastStore } from '@/store/toast';

export const useCopyInviteCode = (inviteCode: string) => {
	const { showToast } = useToastStore();

	const copyInviteCode = async () => {
		try {
			await Clipboard.setStringAsync(inviteCode);
			showToast({
				message: '초대 코드가 클립보드에 복사되었어요.',
				type: 'success',
			});
		} catch (error) {
			showToast({
				message: '초대 코드 복사에 실패했어요. 직접 코드를 입력해주세요.',
				type: 'error',
			});
			console.error('Clipboard error:', error);
		}
	};

	return {
		copyInviteCode,
	};
};
