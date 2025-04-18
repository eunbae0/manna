import {
	Alert,
	Linking,
	Platform,
	Pressable,
	ScrollView,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '#/components/ui/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';

import { VStack } from '#/components/ui/vstack';
import { useAuthStore } from '@/store/auth';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import {
	BottomSheetListLayout,
	BottomSheetListHeader,
	BottomSheetListItem,
} from '@/components/common/bottom-sheet';
import {
	Bell,
	Camera,
	ChevronRight,
	Edit3Icon,
	type LucideIcon,
	MonitorCog,
	ScrollText,
	Star,
	UserPen,
	User,
	Image,
} from 'lucide-react-native';
import { Avatar } from '@/components/common/avatar';
import { useState, useMemo } from 'react';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/shared/constants/app';
import { useToastStore } from '@/store/toast';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { ListItem } from '@/shared/components/ListItem';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react-native';
import { GROUPS_QUERY_KEY } from '@/features/home/group/hooks/useGroups';
import * as ImageManipulator from 'expo-image-manipulator';
import { getCurrentAppVersion } from '@/shared/utils/app_version';
import { FELLOWSHIP_QUERY_KEY } from '@/features/fellowship/hooks/useFellowship';
import { ALL_PRAYER_REQUESTS_QUERY_KEY } from '@/features/prayer-request/hooks/usePrayerRequests';
import { PRAYER_REQUESTS_QUERY_KEY } from '@/features/home/hooks/usePrayerRequestsByDate';

export default function TabFourScreen() {
	const { user, updateUserProfile } = useAuthStore();
	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();
	const { showToast } = useToastStore();

	const [displayName, setDisplayName] = useState(user?.displayName || '');
	const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');

	// 프로필 정보가 변경되었는지 확인
	const isDisplayNameChanged = useMemo(() => {
		return displayName !== (user?.displayName || '');
	}, [displayName, user?.displayName]);

	const [isPhotoUrlChanged, setIsPhotoUrlChanged] = useState(false);
	const isProfileChanged = useMemo(() => {
		return isDisplayNameChanged || isPhotoUrlChanged;
	}, [isDisplayNameChanged, isPhotoUrlChanged]);

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
			const context = ImageManipulator.ImageManipulator.manipulate(
				selectedImageUri,
			).resize({ width: 128, height: 128 });
			const image = await context.renderAsync();
			const _result = await image.saveAsync({
				format: ImageManipulator.SaveFormat.WEBP,
			});

			setPhotoUrl(_result.uri);
			setIsPhotoUrlChanged(true);
		}
	};

	// React Query를 사용한 프로필 업데이트 mutation 설정
	const queryClient = useQueryClient();
	const updateProfileMutation = useMutation({
		mutationFn: async () => {
			if (!user?.id) throw new Error('사용자 정보가 없습니다');

			// 변경된 필드만 포함하여 업데이트
			const updateData: Partial<{
				displayName: string;
				photoUrl: string;
			}> = {};

			if (isDisplayNameChanged) {
				updateData.displayName = displayName;
			}
			if (isPhotoUrlChanged) {
				updateData.photoUrl = photoUrl;
			}

			return await updateUserProfile(user.id, updateData);
		},
		onSuccess: () => {
			if (!user?.id) return;
			// 캐시 무효화 및 사용자 정보 업데이트
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

	return (
		<SafeAreaView>
			<ScrollView showsVerticalScrollIndicator={false}>
				<VStack className="gap-14 px-5 py-8">
					<VStack space="3xl">
						<Heading size="xl">내 정보</Heading>
						<HStack className="w-full justify-between items-center">
							<HStack space="lg" className="items-center">
								<Avatar size="lg" photoUrl={user?.photoUrl ?? undefined} />
								<VStack space="xs">
									<Text size="lg" className="font-pretendard-semi-bold">
										{user?.displayName ?? '이름없음'}
									</Text>
									<Text>{user?.email}</Text>
								</VStack>
							</HStack>
							<Button size="md" variant="icon" onPress={handleOpen}>
								<ButtonIcon as={Edit3Icon} />
							</Button>
						</HStack>
					</VStack>
					<VStack space="2xl">
						<Heading size="xl">앱 설정</Heading>
						<VStack space="xs">
							{/* <ListItem
								label="화면"
								icon={Smartphone}
								link={'/(app)/(more)/screen'}
							/> */}
							<ListItem
								label="알림"
								icon={Bell}
								onPress={() => router.push('/(app)/(more)/notification')}
							/>
							<ListItem
								label="계정"
								icon={UserPen}
								onPress={() => router.push('/(app)/(more)/account')}
							/>
							{/* <ListItem
								label="공지사항"
								icon={Megaphone}
								link={'/(app)/(more)'}
							/> */}
							<ListItem
								label="정책"
								icon={ScrollText}
								onPress={() => router.push('/policy')}
							/>
							{/* <ListItem
								label="의견 남기기"
								icon={MessageCircleMore}
								link={'/(app)/(more)'}
							/> */}
							<ListItem
								label="리뷰 남기기"
								icon={Star}
								onPress={openAppStoreReview}
							/>
							<VersionListItem />
						</VStack>
					</VStack>
				</VStack>
			</ScrollView>

			<BottomSheetContainer>
				<BottomSheetListLayout>
					<BottomSheetListHeader label="프로필 수정" onPress={handleClose} />

					<VStack className="gap-12">
						<VStack space="3xl">
							<VStack space="lg" className="items-center">
								<Pressable onPress={pickImage} className="relative">
									<Avatar
										size="3xl"
										photoUrl={photoUrl || user?.photoUrl || undefined}
									/>
									<View className="absolute -bottom-2 -right-2 bg-background-800 p-1 rounded-full border-2 border-white">
										<Icon as={Camera} size="sm" color="white" />
									</View>
								</Pressable>
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
						</VStack>

						<Button
							size="lg"
							rounded
							action="primary"
							onPress={handleupdateUserProfile}
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
				</BottomSheetListLayout>
			</BottomSheetContainer>
		</SafeAreaView>
	);
}

function openAppStoreReview() {
	const url = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;

	Linking.canOpenURL(url).then((supported) => {
		if (supported) {
			Linking.openURL(url);
		} else {
			Alert.alert(
				'알림',
				'스토어를 열 수 없어요. 앱이 아직 스토어에 등록되지 않았을 수 있습니다.',
			);
		}
	});
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
