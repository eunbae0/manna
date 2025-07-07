import { View } from 'react-native';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { useGroupMembers } from '@/features/group/hooks/useGroupMembers';
import { useAuthStore } from '@/store/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { openProfile } from '@/shared/utils/router';
import { ShareInviteCode } from '@/shared/components/invite-code';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { MemberListItem } from '@/features/profile/components/MemberListItem';

export default function MemberListScreen() {
	const { currentGroup } = useAuthStore();
	const groupId = currentGroup?.groupId;
	const { group, members } = useGroupMembers(groupId || '');

	const handlePressQrCode = () => {
		trackAmplitudeEvent('QR코드 보기 클릭', {
			screen: 'Tab_Home',
			symbol: 'Home_Header',
			location: 'Group_List_Menu',
		});
		router.push({
			pathname: '/(app)/inviteQrCodeModal',
			params: {
				inviteCode: group?.inviteCode,
			},
		});
	};

	return (
		<SafeAreaView className="h-full">
			<VStack space="sm" className="flex-1">
				<Header label="그룹원 목록" />
				{members && members.length > 0 ? (
					<View className="flex-1 px-5">
						<FlashList
							data={members}
							renderItem={({ item: member }) => (
								<MemberListItem member={member} onPress={() => openProfile(member.id)} />
							)}
							keyExtractor={(member) => member.id}
							estimatedItemSize={70}
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{ paddingVertical: 8 }}
							ItemSeparatorComponent={() => <View className="h-2" />}
						/>
					</View>
				) : (
					<Text className="text-center py-4">그룹원이 없어요.</Text>
				)
				}
			</VStack >
			<VStack space="md" className="mb-8 mx-5">
				<ShareInviteCode
					inviteCode={group?.inviteCode || ''}
					handlePressQrCode={handlePressQrCode}
				/>
			</VStack>
		</SafeAreaView >
	);
}
