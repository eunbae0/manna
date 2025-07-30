import { useEffect } from 'react';
import appsFlyer from 'react-native-appsflyer';
import { APPSFLYER_TEMPLATE_ID } from '../constants/appsFlyer';
import { useShareText } from './useShareText';
import { useAuthStore } from '@/store/auth';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';

export function useGenerateAFInviteLink() {
	const { shareText } = useShareText();

	const { user } = useAuthStore();

	useEffect(() => {
		appsFlyer.setAppInviteOneLinkID(APPSFLYER_TEMPLATE_ID, undefined);
	}, []);

	const shareGeneratedLink = async (link: string) => {
		const userName = user?.displayName || null;

		const message = `${userName}님의 그룹 초대가 도착했어요.\n지금 바로 클릭해서 그룹에 참여해보세요!\n${link}`;

		await shareText(message);
	};

	const generateInviteLink = (inviteCode: string) => {
		appsFlyer.generateInviteLink(
			{
				channel: 'User_invite',
				campaign: 'invite_group',
				userParams: {
					deep_link_value: 'invite_group',
					af_screen: '(app)/(group)/group-invited',
					af_screen_data: inviteCode,
					af_dp: 'manna://',
				},
				brandDomain: 'manna-app.onelink.me',
			},
			(link) => {
				shareGeneratedLink(link as string);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	return { generateInviteLink };
}
