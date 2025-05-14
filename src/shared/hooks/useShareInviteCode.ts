import { Share } from 'react-native';

export const useShareInviteCode = (inviteCode: string) => {
	const shareInviteCode = async () => {
		await Share.share({
			message: inviteCode,
		});
	};

	return {
		shareInviteCode,
	};
};
