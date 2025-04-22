import { ScrollView } from 'react-native';
import { Button, ButtonText } from '@/components/common/button';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Box } from '#/components/ui/box';
import { Icon } from '#/components/ui/icon';
import { Copy } from 'lucide-react-native';
import { Avatar } from '@/components/common/avatar';
import { useCopyInviteCode } from '@/shared/hooks/useCopyInviteCode';
import { useGroupMembers } from '@/features/home/group/hooks/useGroupMembers';
import { useAuthStore } from '@/store/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';

export default function MemberListScreen() {
	const { currentGroup } = useAuthStore();
	const groupId = currentGroup?.groupId;
	const { group, members } = useGroupMembers(groupId || '');
	const { copyInviteCode } = useCopyInviteCode(group?.inviteCode || '');

	return (
		<SafeAreaView className="h-full">
			<VStack space="lg" className="flex-1">
				<Header label="그룹원 목록" />
				{members && members.length > 0 ? (
					<ScrollView className="px-5 py-2">
						<VStack space="md">
							{members.map((member) => (
								<HStack
									key={member.id}
									className="items-center justify-between py-4"
								>
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
							))}
						</VStack>
					</ScrollView>
				) : (
					<Text className="text-center py-4">그룹원이 없어요.</Text>
				)}
			</VStack>
			<VStack space="md" className="mb-8 mx-5">
				<VStack space="md" className="py-2">
					<Text size="sm">
						아래 코드를 공유하여 새로운 그룹원을 초대해보세요
					</Text>
					<HStack className="items-center justify-between bg-gray-100 rounded-lg p-4">
						<Text size="lg" className="font-pretendard-semi-bold">
							{group?.inviteCode}
						</Text>
						<Box className="flex-row items-center">
							<Button size="sm" variant="outline" onPress={copyInviteCode}>
								<Icon as={Copy} size="md" className="stroke-primary-500" />
							</Button>
						</Box>
					</HStack>
				</VStack>
				<HStack space="md" className="w-full py-2">
					<Button
						size="lg"
						variant="solid"
						className="flex-1"
						rounded
						onPress={copyInviteCode}
					>
						<ButtonText>초대링크 복사하기</ButtonText>
					</Button>
				</HStack>
			</VStack>
		</SafeAreaView>
	);
}
