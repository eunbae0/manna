import { Button, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { Text } from '#/components/ui/text';
import { VStack } from '#/components/ui/vstack';
import { Link, router, Stack } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
	return (
		<SafeAreaView>
			<Stack.Screen options={{ title: 'Oops!' }} />
			<VStack space="4xl" className="px-4 mt-8 justify-between">
				<Heading size="xl">해당 페이지는 존재하지 않습니다</Heading>
				<Button size="lg" rounded onPress={() => router.replace('/')}>
					<ButtonText>홈으로 돌아가기</ButtonText>
				</Button>
			</VStack>
		</SafeAreaView>
	);
}
