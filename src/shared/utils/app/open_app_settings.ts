import { Linking } from 'react-native';
import { isIOS } from '../platform';

export const openAppSettings = async () => {
	if (isIOS) {
		await Linking.openURL('app-settings:');
	} else {
		await Linking.openSettings();
	}
};
