import { SafeAreaView } from 'react-native-safe-area-context';

import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';

import { PRIVACY_POLICY_URL } from '@/shared/constants/app';
import { OfficialHomepageWebView } from '@/shared/components/webview';

export default function PolicyScreen() {

	return (
		<SafeAreaView className="flex-1 bg-background-50">
			<VStack className="flex-1 gap-5">
				<Header label="정책 및 개인정보 처리방침" />
				<OfficialHomepageWebView uri={PRIVACY_POLICY_URL} />
			</VStack>
		</SafeAreaView>
	);
}
