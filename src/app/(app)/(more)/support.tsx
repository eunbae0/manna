import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';
import { SUPPORT_URL } from '@/shared/constants/app';

export default function SupportScreen() {
	return (
		<SafeAreaView className="flex-1 bg-background-50">
			<VStack className="flex-1 gap-5">
				<Header label="지원 페이지" />

				<WebView
					style={{ flex: 1 }}
					source={{
						uri: SUPPORT_URL,
					}}
				/>
			</VStack>
		</SafeAreaView>
	);
}
