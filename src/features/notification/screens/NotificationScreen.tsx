import React from 'react';
import { VStack } from '#/components/ui/vstack';
import { Heading } from '#/components/ui/heading';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationList } from '../components/NotificationList';
import { NotificationController } from '../components/NotificationController';

/**
 * 알림 화면 레이아웃 컴포넌트
 */
export function NotificationScreen() {
	return (
		<SafeAreaView className="flex-1">
			<VStack className="flex-1">
				<Heading size="2xl" className="px-5 pt-4 pb-7">
					알림센터
				</Heading>
				{/* <NotificationController /> */}
				<NotificationList />
			</VStack>
		</SafeAreaView>
	);
}
