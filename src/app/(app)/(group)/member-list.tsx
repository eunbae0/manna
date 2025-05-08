import { ScrollView } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Box } from '#/components/ui/box';
import { Avatar } from '@/components/common/avatar';
import { useGroupMembers } from '@/features/home/group/hooks/useGroupMembers';
import { useAuthStore } from '@/store/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { openProfile } from '@/shared/utils/router';
import AnimatedPressable from '@/components/common/animated-pressable';
import { ShareInviteCode } from '@/shared/components/invite-code';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import { router } from 'expo-router';

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
			<VStack space="lg" className="flex-1">
				<Header label="그룹원 목록" />
				{members && members.length > 0 ? (
					<ScrollView className="px-5 py-2">
						<VStack space="md">
							{members.map((member) => (
								<AnimatedPressable
									key={member.id}
									onPress={() => openProfile(member.id)}
								>
									<HStack className="items-center justify-between py-4">
										<HStack space="lg" className="items-center">
											<HStack space="md" className="items-center">
												<Avatar
													size="sm"
													photoUrl={member.photoUrl ?? undefined}
												/>
												<VStack>
													<Text size="lg" className="font-pretendard-semi-bold">
														{member.displayName ?? '이름없음'}
													</Text>
												</VStack>
											</HStack>
											<Box
												className={
													member.role === 'leader'
														? 'px-2 rounded-full py-1 bg-primary-400'
														: 'px-2 rounded-full py-1 bg-gray-500'
												}
											>
												<Text size="xs" className="text-typography-50">
													{member.role === 'leader' ? '리더' : '그룹원'}
												</Text>
											</Box>
										</HStack>
									</HStack>
								</AnimatedPressable>
							))}
						</VStack>
					</ScrollView>
				) : (
					<Text className="text-center py-4">그룹원이 없어요.</Text>
				)}
			</VStack>
			<VStack space="md" className="mb-8 mx-5">
				<ShareInviteCode
					inviteCode={group?.inviteCode || ''}
					handlePressQrCode={handlePressQrCode}
				/>
			</VStack>
		</SafeAreaView>
	);
}
