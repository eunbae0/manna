import * as Clipboard from 'expo-clipboard';
import { useToastStore } from '@/store/toast';

export const useCopyInviteCode = (inviteCode: string) => {
	const { showToast } = useToastStore();

	const copyInviteCode = async () => {
		try {
			await Clipboard.setStringAsync(inviteCode);
			showToast({
				title: '성공',
				message: '초대 코드가 클립보드에 복사되었습니다.',
				type: 'success',
			});
		} catch (error) {
			showToast({
				title: '오류',
				message: '초대 코드 복사에 실패했습니다. 직접 코드를 입력해주세요.',
				type: 'error',
			});
			console.error('Clipboard error:', error);
		}
	};

	return {
		copyInviteCode,
	};
};
