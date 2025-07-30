import { useCallback } from 'react';
import { Dimensions } from 'react-native';
import Header from '@/components/common/Header';
import { VStack } from '#/components/ui/vstack';
import { useLocalSearchParams } from 'expo-router';
import { useGroupByInfiteCode } from '../hooks/useGroupByInviteCode';
import { Image } from 'expo-image';
import { Text } from '@/shared/components/text';
import { Button, ButtonText } from '@/components/common/button';
import { CircleAlert, Users } from 'lucide-react-native';
import { Icon } from '#/components/ui/icon';
import { useJoinGroup } from '../hooks/useJoinGroup';
import { HStack } from '#/components/ui/hstack';
import { getImageSourceForSignedImageUrl } from '@/shared/utils/image';
import { useAuthStore } from '@/store/auth';
import Heading from '@/shared/components/heading';
import { goBackOrReplaceHome } from '@/shared/utils/router';
import GroupLandingScreen from './GroupLandingScreen';
import { useOnboardingStore } from '@/store/onboarding';
import { STORATE_INVITE_GROUP_CODE } from '@/hooks/useDeeplink';
import { storage } from '@/storage';

const { width } = Dimensions.get('window');
const IMG_SIZE = width * 0.5;

export default function GroupInvitedScreen() {
	const { data: inviteCodeFromSearchParam } = useLocalSearchParams<{
		data?: string;
	}>();

	const inviteCodeFromStorage = storage.getString(STORATE_INVITE_GROUP_CODE);

	const inviteCode = inviteCodeFromSearchParam || inviteCodeFromStorage || '';

	const { user, isAuthenticated } = useAuthStore();
	const { currentStep, setStep, userData } = useOnboardingStore();
	const { group, isLoading } = useGroupByInfiteCode(inviteCode);

	const isOnboarding = currentStep === 'GROUP_LANDING';

	const { joinGroupMutation } = useJoinGroup(isOnboarding);

	const imageUrl = group?.coverImages?.[0].uri ?? '';

	const isExistedGroup = user?.groups
		? user.groups.findIndex((g) => g.groupId === group?.id) !== -1
		: false;

	const handlePressAccept = useCallback(() => {
		joinGroupMutation.mutate({
			inviteCode,
			member: { id: user?.id || '', role: 'member' },
		});
		if (isOnboarding) storage.delete(STORATE_INVITE_GROUP_CODE);
	}, [isOnboarding, inviteCode, user, joinGroupMutation]);

	const userName = isOnboarding ? userData?.displayName : user?.displayName;

	if (isLoading) {
		return (
			<VStack className="flex-1">
				<Header />
				<VStack className="flex-1 justify-between px-5" />
			</VStack>
		);
	}

	if (!isAuthenticated && !group) {
		return <GroupLandingScreen />;
	}

	if (!group) {
		return (
			<VStack className="flex-1">
				<Header />
				<VStack className="flex-1 justify-between px-5">
					<VStack space="md" className="mt-8">
						<Icon as={CircleAlert} size="xl" className="text-yellow-500" />
						<Heading size="2xl">존재하지 않는 그룹이에요</Heading>
					</VStack>
					<Button size="lg" className="mb-2" onPress={goBackOrReplaceHome}>
						<ButtonText>메인으로 돌아가기</ButtonText>
					</Button>
				</VStack>
			</VStack>
		);
	}

	if (!isAuthenticated && isExistedGroup) {
		return <GroupLandingScreen />;
	}

	if (isExistedGroup)
		return (
			<VStack className="flex-1">
				<Header />
				<VStack className="flex-1 justify-between px-5">
					<VStack space="md" className="mt-8">
						<Icon as={CircleAlert} size="xl" className="text-yellow-500" />
						<Heading size="2xl">이미 해당 그룹에 참여하고 있어요</Heading>
					</VStack>
					<Button size="lg" className="mb-2" onPress={goBackOrReplaceHome}>
						<ButtonText>메인으로 돌아가기</ButtonText>
					</Button>
				</VStack>
			</VStack>
		);

	return (
		<VStack className="flex-1">
			<Header
				onPressBackButton={() =>
					isOnboarding ? setStep('IMAGE') : goBackOrReplaceHome()
				}
			/>
			<VStack className="flex-1 items-center justify-center px-6">
				<VStack className="w-full mt-8 justify-between flex-1 gap-10">
					<VStack className="gap-14">
						<Heading size="3xl" className="whitespace-pre-line">
							{`${userName}님에게\n그룹 초대가 도착했어요!`}
						</Heading>
						<VStack space="4xl" className="items-center">
							<Image
								source={getImageSourceForSignedImageUrl(imageUrl)}
								style={{
									width: IMG_SIZE,
									aspectRatio: 1,
									borderRadius: 999,
									borderWidth: 1,
									borderColor: '#ECECEC',
								}}
								contentFit="cover"
							/>
							<VStack space="md" className="items-center">
								<Text size="3xl" weight="bold" className="text-typography-900">
									{group.groupName}
								</Text>
								<HStack space="sm" className="items-center">
									<Icon as={Users} size="md" className="text-typography-500" />
									<Text
										size="lg"
										weight="medium"
										className="text-typography-500"
									>
										{group.members.length}명의 멤버가 참여하고 있어요!
									</Text>
								</HStack>
							</VStack>
						</VStack>
					</VStack>
					<Button size="lg" className="mb-2" onPress={handlePressAccept}>
						<ButtonText>초대 수락하기</ButtonText>
					</Button>
				</VStack>
			</VStack>
		</VStack>
	);
}
