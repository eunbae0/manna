import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '@/shared/components/text';
import { VStack } from '#/components/ui/vstack';
import { useAuthStore } from '@/store/auth';
import {
	Bell,
	ChevronRight,
	MonitorCog,
	ScrollText,
	Star,
	UserPen,
	Info,
	MessageCircleReply,
	NotepadText,
	Megaphone,
} from 'lucide-react-native';
import { Avatar } from '@/components/common/avatar';
import { ListItem } from '@/shared/components/ListItem';
import { getCurrentAppVersion } from '@/shared/utils/app/app_version';
import AnimatedPressable from '@/components/common/animated-pressable';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import { openAppStoreReview } from '@/shared/utils/revies';

export default function TabFourScreen() {
	const { user } = useAuthStore();

	return (
		<ScrollView showsVerticalScrollIndicator={false}>
			<VStack className="gap-14 px-5 py-8">
				<VStack space="3xl">
					<Heading size="xl">내 정보</Heading>
					<AnimatedPressable
						onPress={() => {
							trackAmplitudeEvent('프로필 더보기 클릭', {
								screen: 'Tab_More',
							});
							router.push({
								pathname: '/(app)/(profile)/profile-index',
								params: { userId: user?.id },
							});
						}}
					>
						<HStack className="w-full justify-between items-center">
							<HStack space="lg" className="items-center flex-1">
								<Avatar size="lg" photoUrl={user?.photoUrl ?? undefined} />
								<VStack space="xs" className="flex-1">
									<Text size="lg" className="font-pretendard-semi-bold">
										{user?.displayName ?? '이름없음'}
									</Text>
									<Text
										className="flex-1"
										ellipsizeMode="tail"
										numberOfLines={1}
									>
										{user?.email}
									</Text>
								</VStack>
							</HStack>
							<Icon as={ChevronRight} />
						</HStack>
					</AnimatedPressable>
				</VStack>
				<VStack space="2xl">
					<Heading size="xl">앱 설정</Heading>
					<VStack space="lg">
						{/* <ListItem
								label="화면"
								icon={Smartphone}
								link={'/(app)/(more)/screen'}
							/> */}
						<VStack space="xs">
							<ListItem
								label="알림"
								icon={Bell}
								onPress={() => {
									trackAmplitudeEvent('알림설정 클릭', {
										screen: 'Tab_More',
									});
									router.push(
										'/(app)/(more)/(notification-setting)/setting-index',
									);
								}}
							/>
							<ListItem
								label="계정"
								icon={UserPen}
								onPress={() => {
									trackAmplitudeEvent('계정설정 클릭', {
										screen: 'Tab_More',
									});
									router.push('/(app)/(more)/account');
								}}
							/>
						</VStack>
						{/* <ListItem
								label="공지사항"
								icon={Megaphone}
								link={'/(app)/(more)'}
							/> */}
						<VStack space="xs">
							<ListItem
								label="공지사항"
								icon={Megaphone}
								onPress={() => {
									trackAmplitudeEvent('공지사항 클릭', {
										screen: 'Tab_More',
									});
									router.push('/(app)/(more)/notice');
								}}
							/>
							<ListItem
								label="업데이트 노트"
								icon={NotepadText}
								onPress={() => {
									trackAmplitudeEvent('업데이트 노트 클릭', {
										screen: 'Tab_More',
									});
									router.push('/(app)/(more)/update-note');
								}}
								isNew
							/>
							<ListItem
								label="개발자에게 피드백 보내기"
								icon={MessageCircleReply}
								onPress={() => {
									trackAmplitudeEvent('개발자에게 피드백 보내기 클릭', {
										screen: 'Tab_More',
									});
									router.push('/(app)/(more)/(feedback)/feedback-index');
								}}
								isNew
							/>
						</VStack>
						<VStack space="xs">
							<ListItem
								label="정책"
								icon={ScrollText}
								onPress={() => {
									trackAmplitudeEvent('정책 클릭', {
										screen: 'Tab_More',
									});
									router.push('/policy');
								}}
							/>
							<ListItem
								label="만나 사용설명서"
								icon={Info}
								onPress={() => {
									trackAmplitudeEvent('지원 클릭', {
										screen: 'Tab_More',
									});
									router.push('/(app)/(more)/support');
								}}
								isNew
							/>
							{/* <ListItem
								label="의견 남기기"
								icon={MessageCircleMore}
								link={'/(app)/(more)'}
							/> */}
							<ListItem
								label="리뷰 남기기"
								icon={Star}
								onPress={() => {
									trackAmplitudeEvent('리뷰 남기기 클릭', {
										screen: 'Tab_More',
									});
									openAppStoreReview();
								}}
							/>
							<VersionListItem />
						</VStack>
					</VStack>
				</VStack>
			</VStack>
		</ScrollView>
	);
}

function VersionListItem() {
	const version = getCurrentAppVersion();
	return (
		<HStack className="items-center justify-between py-4">
			<HStack space="md" className="items-center">
				<Icon as={MonitorCog} size="md" />
				<Text size="lg">앱 버전</Text>
			</HStack>
			<Text size="md" className="text-typography-600">
				{version}
			</Text>
		</HStack>
	);
}
