import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Divider } from '#/components/ui/divider';
import { Heading } from '@/shared/components/heading';
import { Text } from '@/shared/components/text';
import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';

import Markdown from 'react-native-markdown-display';
import { canOpenURL, openURL } from 'expo-linking';
import {
	PRIVACY_POLICY,
	TERMS_OF_SERVICE,
	COMMUNITY_GUIDELINES,
	CONTACT_INFO,
} from '@/shared/constants/policy';
import { WebView } from 'react-native-webview';
import { PRIVACY_POLICY_URL } from '@/shared/constants/app';

const onLinkPress = async (url: string) => {
	if (url) {
		const canOpen = await canOpenURL(url);
		if (canOpen) {
			await openURL(url);
		}
		return false;
	}
	return true;
};

export default function PolicyScreen() {
	return (
		<SafeAreaView className="flex-1 bg-background-50">
			<VStack className="flex-1 gap-5">
				<Header label="정책 및 약관" />

				{/* <ScrollView
					className="flex-1 px-5"
					showsVerticalScrollIndicator={false}
				>
					<VStack space="xl" className="pb-8">
						<PolicySection title="이용약관" content={TERMS_OF_SERVICE} />

						<PolicySection title="개인정보 처리방침" content={PRIVACY_POLICY} />

						<PolicySection
							title="커뮤니티 가이드라인"
							content={COMMUNITY_GUIDELINES}
						/>

						<PolicySection title="문의 및 피드백" content={CONTACT_INFO} />
					</VStack>
				</ScrollView> */}
				<WebView
					style={{ flex: 1 }}
					source={{
						uri: PRIVACY_POLICY_URL,
					}}
				/>
			</VStack>
		</SafeAreaView>
	);
}

function PolicySection({ title, content }: { title: string; content: string }) {
	return (
		<VStack space="md">
			<Heading size="xl" className="text-typography-900">
				{title}
			</Heading>
			<Markdown
				// @ts-ignore
				onLinkPress={onLinkPress}
			>
				{content}
			</Markdown>
			<Divider className="my-2" />
		</VStack>
	);
}
