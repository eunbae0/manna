import { Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, router } from 'expo-router';

import { Avatar } from '#/components/ui/avatar';
import { Button, ButtonIcon, ButtonText } from '#/components/ui/button';
import { Divider } from '#/components/ui/divider';
import { Heading } from '#/components/ui/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import { VStack } from '#/components/ui/vstack';
import { useAuthStore } from '@/store/auth';
import {
	Bell,
	ChevronRight,
	Edit3Icon,
	type LucideIcon,
	Megaphone,
	MessageCircleMore,
	MonitorCog,
	ScrollText,
	Smartphone,
	Star,
	UserPen,
	UserRound,
} from 'lucide-react-native';

export default function TabFourScreen() {
	const { user, logout } = useAuthStore();
	return (
		<SafeAreaView>
			<ScrollView showsVerticalScrollIndicator={false}>
				<VStack className="gap-14 px-5 py-8">
					<VStack space="2xl">
						<Heading size="xl">내 정보</Heading>
						<HStack className="w-full justify-between items-center">
							<HStack space="xl" className="items-center">
								<Avatar size="lg" className="bg-yellow-600">
									<Icon as={UserRound} size="xl" className="stroke-white" />
								</Avatar>
								<VStack space="sm">
									<Text size="lg" bold={true}>
										{user?.displayName ?? '이름없음'}
									</Text>
									<Text>{user?.email}</Text>
								</VStack>
							</HStack>
							<Button size="xl" variant="link">
								<ButtonIcon as={Edit3Icon} />
							</Button>
						</HStack>
					</VStack>
					<VStack space="2xl">
						<Heading size="xl">앱 설정</Heading>
						<VStack space="xs">
							<ListItem
								label="화면"
								icon={Smartphone}
								link={'/(app)/(tabs)/(more)/screen'}
							/>
							<ListItem
								label="알림"
								icon={Bell}
								link={'/(app)/(tabs)/(more)/notification'}
							/>
							<ListItem
								label="계정"
								icon={UserPen}
								link={'/(app)/(tabs)/(more)/account'}
							/>
						</VStack>
						<VStack space="xs">
							<ListItem
								label="공지사항"
								icon={Megaphone}
								link={'/(app)/(tabs)/(more)'}
							/>
							<ListItem
								label="정책"
								icon={ScrollText}
								link={'/(app)/(tabs)/(more)'}
							/>
							<ListItem
								label="의견 남기기"
								icon={MessageCircleMore}
								link={'/(app)/(tabs)/(more)'}
							/>
							<ListItem
								label="리뷰 남기기"
								icon={Star}
								link={'/(app)/(tabs)/(more)'}
							/>
							<ListItem
								label="버전"
								icon={MonitorCog}
								link={'/(app)/(tabs)/(more)'}
							/>
						</VStack>
					</VStack>
				</VStack>
			</ScrollView>
		</SafeAreaView>
	);
}

function ListItem({
	icon,
	label,
	link,
}: { icon: LucideIcon; label: string; link: Href }) {
	return (
		<Pressable
			onPress={() => {
				router.push(link);
			}}
		>
			<HStack className="items-center justify-between py-4">
				<HStack space="md" className="items-center">
					<Icon as={icon} size="sm" />
					<Text size="lg">{label}</Text>
				</HStack>
				<Icon as={ChevronRight} size="sm" />
			</HStack>
			<Divider />
		</Pressable>
	);
}
