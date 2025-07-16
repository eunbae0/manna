import { useRef, useEffect } from 'react';
import type { WebView } from 'react-native-webview';

export function useWebViewMessage(message: object) {
	const webViewRef = useRef<WebView>(null);

	useEffect(() => {
		webViewRef.current?.postMessage(JSON.stringify(message));
	}, [message]);

	return webViewRef;
}
