import { ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { Box } from '#/components/ui/box';
import { Divider } from '#/components/ui/divider';
import { Avatar } from '@/components/common/avatar';
import { Icon } from '#/components/ui/icon';
import Header from '@/components/common/Header';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/features/board/types';
import {
	MessageCircle,
	Camera,
	ChevronRight,
	Edit3,
	Presentation,
	HandHeart,
} from 'lucide-react-native';
import AnimatedPressable from '@/components/common/animated-pressable';
import { router, useLocalSearchParams } from 'expo-router';
import { useToastStore } from '@/store/toast';
import { userKeys, useUserProfile } from '@/features/profile/hooks/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { useGroupMembers } from '@/features/group/hooks/useGroupMembers';
import { useUserPrayerRequests } from '@/features/prayer-request/hooks/useUserPrayerRequests';
import { useInfiniteBoardPosts } from '@/features/board/hooks';
import { useUserFellowships } from '@/features/fellowship/hooks/useUserFellowships';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import {
	BottomSheetListLayout,
	BottomSheetListHeader,
} from '@/components/common/bottom-sheet';
import { useState, useMemo } from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';
import { RefreshCw } from 'lucide-react-native';
import { GROUPS_QUERY_KEY } from '@/features/group/hooks/useGroups';
import { FELLOWSHIP_QUERY_KEY } from '@/features/fellowship/hooks/useFellowship';
import { ALL_PRAYER_REQUESTS_QUERY_KEY } from '@/features/prayer-request/hooks/usePrayerRequests';
import { PRAYER_REQUESTS_QUERY_KEY } from '@/features/group/hooks/usePrayerRequestsByDate';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import { Image } from 'expo-image';

interface ActivityItemProps {
	icon: React.ComponentType;
	title: string;
	count: number;
	onPress?: () => void;
}

function ActivityItem({ icon, title, count, onPress }: ActivityItemProps) {
	return (
		<AnimatedPressable onPress={onPress}>
			<HStack className="items-center justify-between py-3">
				<HStack space="md" className="items-center">
					<Box className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
						<Icon as={icon} size="md" className="text-primary-500" />
					</Box>
					<Text className="text-typography-700 font-pretendard-Medium">
						{title}
					</Text>
				</HStack>
				<HStack space="xs" className="items-center">
					<Text className="text-typography-600">{count}</Text>
					<Icon as={ChevronRight} size="sm" className="text-gray-400" />
				</HStack>
			</HStack>
		</AnimatedPressable>
	);
}

export default function ProfileScreen() {
	const { userId } = useLocalSearchParams<{ userId: string }>();
	const { user: currentUser, currentGroup, updateUserProfile } = useAuthStore();
	const { showError } = useToastStore();
	const queryClient = useQueryClient();

	const { members } = useGroupMembers(currentGroup?.groupId || '');

	// React Query를 사용하여 사용자 프로필 조회
	const {
		data: user,
		isLoading,
		isError,
		error,
		refetch,
	} = useUserProfile(userId, currentUser);

	// 에러 처리
	if (isError) {
		console.error('프로필 정보 로드 실패:', error);
		showError('프로필 정보를 불러오지 못했어요');
	}

	const { data: fellowships } = useUserFellowships(userId || '');
	const { data: boards } = useInfiniteBoardPosts({
		groupId: currentGroup?.groupId || '',
		authorId: userId,
		limit: 10,
	});
	const { prayerRequests } = useUserPrayerRequests(userId);

	// 새로고침 처리
	const onRefresh = async () => {
		try {
			await refetch();
		} catch (error) {
			showError('프로필 정보를 새로고침하지 못했어요');
		}
	};

	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();
	const { showToast } = useToastStore();

	const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
	const [photoUrl, setPhotoUrl] = useState(currentUser?.photoUrl || '');

	const [statusMessage, setStatusMessage] = useState(currentUser?.statusMessage || '');

	// 프로필 정보가 변경되었는지 확인
	const isDisplayNameChanged = useMemo(() => {
		return displayName !== (user?.displayName || '');
	}, [displayName, user?.displayName]);

	const isStatusMessageChanged = useMemo(() => {
		return statusMessage !== (user?.statusMessage || '');
	}, [statusMessage, user?.statusMessage]);

	const [isPhotoUrlChanged, setIsPhotoUrlChanged] = useState(false);
	const isProfileChanged = useMemo(() => {
		return isDisplayNameChanged || isPhotoUrlChanged || isStatusMessageChanged;
	}, [isDisplayNameChanged, isPhotoUrlChanged, isStatusMessageChanged]);

	const pickImage = async () => {
		// Request permission
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (status !== 'granted') {
			showToast({
				message: '사진 선택을 위해 갤러리 접근 권한이 필요해요',
				type: 'info',
			});
			return;
		}

		// Open image picker
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.5,
			selectionLimit: 1,
		});

		if (!result.canceled && result.assets && result.assets.length > 0) {
			const selectedImageUri = result.assets[0].uri;

			setPhotoUrl(selectedImageUri);
			setIsPhotoUrlChanged(true);
		}
	};

	// React Query를 사용한 프로필 업데이트 mutation 설정
	const updateProfileMutation = useMutation({
		mutationFn: async () => {
			if (!user?.id) throw new Error('사용자 정보가 없습니다');

			// 변경된 필드만 포함하여 업데이트
			const updateData: Partial<{
				displayName: string;
				photoUrl: string;
				statusMessage: string;
			}> = {};

			if (isDisplayNameChanged) {
				updateData.displayName = displayName;
			}
			if (isPhotoUrlChanged) {
				updateData.photoUrl = photoUrl;
			}
			if (isStatusMessageChanged) {
				updateData.statusMessage = statusMessage;
			}

			return await updateUserProfile(user.id, updateData);
		},
		onSuccess: async () => {
			if (!user?.id) return;
			// 캐시 무효화 및 사용자 정보 업데이트
			queryClient.invalidateQueries({ queryKey: userKeys.profile(userId) });
			queryClient.invalidateQueries({ queryKey: ['user', user.id] });
			queryClient.invalidateQueries({
				queryKey: [GROUPS_QUERY_KEY],
				refetchType: 'all',
			});
			queryClient.invalidateQueries({
				queryKey: [FELLOWSHIP_QUERY_KEY],
				refetchType: 'all',
			});
			queryClient.invalidateQueries({
				queryKey: [PRAYER_REQUESTS_QUERY_KEY],
				refetchType: 'all',
			});
			queryClient.invalidateQueries({
				queryKey: [ALL_PRAYER_REQUESTS_QUERY_KEY],
				refetchType: 'all',
			});

			// 이미지 캐시 초기화 (유저의 photo url의 cache key가 동일함)
			await Promise.all([
				Image.clearDiskCache(),
				Image.clearMemoryCache(),
			]);

			setIsPhotoUrlChanged(false);
			handleClose();
			showToast({
				message: '프로필이 업데이트되었습니다',
				type: 'success',
			});
		},
		onError: (error) => {
			console.error('프로필 업데이트 오류:', error);
			showToast({
				message: '프로필 업데이트에 실패했습니다. 다시 시도해주세요',
				type: 'error',
			});
		},
	});

	const handleupdateUserProfile = () => {
		if (!user?.id || !isProfileChanged) return;
		updateProfileMutation.mutate();
	};

	// 로딩 중 표시
	if (isLoading) {
		return (
			<SafeAreaView className="flex-1 bg-white">
				<Header label="프로필" />
				<VStack className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#6366f1" />
				</VStack>
			</SafeAreaView>
		);
	}

	// 사용자 정보가 없는 경우
	if (!user) {
		return (
			<SafeAreaView className="flex-1 bg-white">
				<Header label="프로필" />
				<VStack className="flex-1 items-center justify-center">
					<Text>사용자 정보를 찾을 수 없어요.</Text>
				</VStack>
			</SafeAreaView>
		);
	}

	// 현재 사용자의 프로필인지 확인
	const isCurrentUser = !userId || userId === currentUser?.id;

	// 리더 여부 확인
	const isLeader =
		members?.find((g) => g.role === UserRole.LEADER)?.id === user.id;

	return (
		<SafeAreaView className="flex-1 bg-white">
			<Header className="justify-between">
				{isCurrentUser && (
					<Button
						variant="icon"
						size="lg"
						className="mr-4"
						onPress={handleOpen}
					>
						<ButtonIcon as={Edit3} />
					</Button>
				)}
			</Header>

			<ScrollView
				className="flex-1"
				refreshControl={
					<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
				}
			>
				<VStack className="p-4 gap-6">
					{/* 프로필 정보 */}
					<VStack className="items-center gap-3">
						<Avatar size="3xl" photoUrl={user.photoUrl || undefined}>
							{!user.photoUrl && (
								<Text className="text-white font-pretendard-bold text-2xl">
									{user.displayName?.charAt(0) || '?'}
								</Text>
							)}
						</Avatar>
						<VStack className="items-center gap-1">
							<Text
								size="xl"
								className="font-pretendard-bold text-typography-900"
							>
								{user.displayName || '이름 없음'}
							</Text>
							{!isCurrentUser && (isLeader ? (
								<Box className="px-3 py-1 bg-primary-100 rounded-full">
									<Text
										size="xs"
										className="text-primary-700 font-pretendard-Medium"
									>
										리더
									</Text>
								</Box>
							) : (
								<Box className="px-3 py-1 bg-gray-100 rounded-full">
									<Text
										size="xs"
										className="text-gray-700 font-pretendard-Medium"
									>
										그룹원
									</Text>
								</Box>
							))}
							<Text size="md" className="text-typography-600 text-center mt-2">
								{user?.statusMessage || '상태메세지가 없어요.'}
							</Text>
						</VStack>
					</VStack>

					<Divider />

					{/* 활동 내역 */}
					<VStack>
						<Text size="lg" className="font-pretendard-bold mb-2">
							활동 내역
						</Text>
						<ActivityItem
							icon={MessageCircle}
							title="참여한 나눔"
							count={
								fellowships?.pages.flatMap((page) => page.items).length || 0
							}
							onPress={() =>
								router.push({
									pathname: '/(app)/(fellowship)/user-fellowships',
									params: { userId: user.id },
								})
							}
						/>
						<ActivityItem
							icon={Presentation}
							title="작성한 게시글"
							count={boards?.pages.flatMap((page) => page.items).length || 0}
							onPress={() =>
								router.push({
									pathname: '/(app)/(board)/user-boards',
									params: { userId: user.id },
								})
							}
						/>
						<ActivityItem
							icon={HandHeart}
							title="작성한 기도제목"
							count={prayerRequests?.length || 0}
							onPress={() =>
								router.push({
									pathname: '/(app)/(prayerRequest)/user-prayer-requests',
									params: { userId: user.id },
								})
							}
						/>
					</VStack>
				</VStack>
			</ScrollView>
			<BottomSheetContainer>
				<VStack className="px-5 pt-2 pb-4">
					<BottomSheetListHeader label="프로필 수정" onPress={handleClose} />
					<VStack className="gap-12">
						<VStack space="lg">
							<VStack space="lg" className="items-center">
								<AnimatedPressable
									onPress={() => {
										// trackAmplitudeEvent('Open Profile Image Picker', {
										// 	screen: 'Tab_More',
										// 	location: 'More_Profile_Settings_Bottom_Sheet',
										// });
										pickImage();
									}}
									className="relative"
									withHaptic
								>
									<Avatar
										size="3xl"
										photoUrl={photoUrl || user?.photoUrl || undefined}
									/>
									<Box className="absolute -bottom-2 -right-2 bg-background-800 p-1 rounded-full border-2 border-white">
										<Icon as={Camera} size="sm" color="white" />
									</Box>
								</AnimatedPressable>
								<VStack space="xs" className="items-center">
									<Text size="lg" className="font-pretendard-semi-bold">
										{user?.displayName ?? '이름없음'}
									</Text>
									<Text size="sm" className="text-typography-600">
										{user?.email}
									</Text>
								</VStack>
							</VStack>
							<VStack space="sm">
								<Text size="md" className="text-typography-600">
									이름
								</Text>
								<BottomSheetTextInput
									defaultValue={displayName}
									onChangeText={setDisplayName}
									placeholder="이름을 입력하세요"
									className={TEXT_INPUT_STYLE}
								/>
							</VStack>
							<VStack space="sm">
								<Text size="md" className="text-typography-600">
									상태 메세지
								</Text>
								<BottomSheetTextInput
									defaultValue={statusMessage}
									onChangeText={setStatusMessage}
									placeholder="상태 메세지를 입력하세요"
									className={TEXT_INPUT_STYLE}
								/>
							</VStack>
						</VStack>

						<VStack space="sm">
							{updateProfileMutation.isPending && (
								<Text size="xs" className="text-center text-typography-600">
									이미지 업데이트는 시간이 소요될 수 있어요. 잠시 기다려주세요
								</Text>
							)}
							<Button
								size="lg"
								action="primary"
								onPress={() => {
									trackAmplitudeEvent('프로필 업데이트', {
										screen: 'Tab_More',
										location: 'More_Profile_Settings_Bottom_Sheet',
									});
									handleupdateUserProfile();
								}}
								disabled={updateProfileMutation.isPending || !isProfileChanged}
								animation={true}
							>
								{updateProfileMutation.isPending && (
									<ButtonIcon as={RefreshCw} className="animate-spin mr-1" />
								)}
								<ButtonText>
									{updateProfileMutation.isPending ? '업데이트 중...' : '완료'}
								</ButtonText>
							</Button>
						</VStack>
					</VStack>
				</VStack>
			</BottomSheetContainer>
		</SafeAreaView>
	);
}
