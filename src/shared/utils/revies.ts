import { Platform, Linking, Alert } from 'react-native';
import { APP_STORE_REVIEW_URL, PLAY_STORE_URL } from '../constants/app';

export function openAppStoreReview() {
	const url = Platform.OS === 'ios' ? APP_STORE_REVIEW_URL : PLAY_STORE_URL;

	Linking.canOpenURL(url).then((supported) => {
		if (supported) {
			Linking.openURL(url);
		} else {
			Alert.alert('알림', '알 수 없는 오류로 스토어를 열 수 없어요.');
		}
	});
}
