import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';
import { HOW_TO_USE_URL } from '@/shared/constants/app';

export default function SupportScreen() {
	return (
		<SafeAreaView className="flex-1 bg-background-50">
			<VStack className="flex-1 gap-5">
				<Header label="만나 사용 설명서" />
				<WebView
					style={{ flex: 1 }}
					source={{
						uri: HOW_TO_USE_URL,
					}}
				/>
			</VStack>
		</SafeAreaView>
	);
}
