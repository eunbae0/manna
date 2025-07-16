import { useWebViewMessage } from "@/shared/hooks/useWebViewMessage";
import WebView from "react-native-webview";

export function OfficialHomepageWebView({ uri }: { uri: string }) {
	const webViewRef = useWebViewMessage({
		hideHeader: true,
		platform: 'native'
	});

	return (
		<WebView
			ref={webViewRef}
			style={{ flex: 1 }}
			source={{
				uri,
			}}
		/>
	)
}