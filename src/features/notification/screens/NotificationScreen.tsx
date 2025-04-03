import React from 'react';
import { VStack } from '#/components/ui/vstack';
import { Heading } from '#/components/ui/heading';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationList } from '../components/NotificationList';
import { HStack } from '#/components/ui/hstack';
import { Settings } from 'lucide-react-native';
import { Button, ButtonIcon } from '@/components/common/button';
import { router } from 'expo-router';

/**
 * 알림 화면 레이아웃 컴포넌트
 */
export function NotificationScreen() {
	return (
		<SafeAreaView className="flex-1">
			<VStack className="flex-1">
				<HStack className="pl-5 pr-3 pt-4 pb-7 items-center justify-between">
					<Heading size="2xl">알림센터</Heading>
					<Button
						variant="icon"
						size="lg"
						onPress={() => {
							router.push('/(app)/(more)/notification');
						}}
					>
						<ButtonIcon as={Settings} />
					</Button>
				</HStack>
				{/* <NotificationController /> */}
				<NotificationList />
			</VStack>
		</SafeAreaView>
	);
}
