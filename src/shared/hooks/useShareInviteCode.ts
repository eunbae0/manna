import { useToastStore } from '@/store/toast';
import { shareAsync, isAvailableAsync } from 'expo-sharing';

export const useShareInviteCode = (inviteCode: string) => {
	const { showError } = useToastStore();

	const shareInviteCode = async () => {
		const isAvailable = await isAvailableAsync();
		if (!isAvailable) {
			showError('초대 코드 공유에 실패했어요. 직접 코드를 입력해주세요.');
			return;
		}
		await shareAsync(inviteCode, {
			dialogTitle: '초대코드 공유',
			mimeType: 'text/plain',
		  UTI: 'public.plain-text',
		});
	};

	return {
		shareInviteCode,
	};
};
