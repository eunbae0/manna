import { useRef, useState } from 'react';

import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import Header from '@/components/common/Header';
import { Text } from '#/components/ui/text';

import { useOnboardingStore } from '@/store/onboarding';
import { Heading } from '@/shared/components/heading';
import { Input, InputField } from '#/components/ui/input';
import { VStack } from '#/components/ui/vstack';
import { cn } from '@/shared/utils/cn';
import { router } from 'expo-router';
import { joinGroup } from '@/api/group';
import { useAuthStore } from '@/store/auth';
import { useQueryClient } from '@tanstack/react-query';
import { GROUPS_QUERY_KEY } from '../../hooks/useGroups';
import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';
import { useToastStore } from '@/store/toast';
import { HStack } from '#/components/ui/hstack';
import { ArrowLeft, QrCode, RotateCw } from 'lucide-react-native';

import {
	useCameraPermission,
	Camera,
	useCodeScanner,
	useCameraDevice,
} from 'react-native-vision-camera';

import { View, Linking, Platform } from 'react-native';
import { openAppSettings } from '@/shared/utils/app/open_app_settings';

export default function JoinGroupScreen() {
	const { user, addUserGroupProfile } = useAuthStore();
	const { setStep, currentStep, userData, submitOnboardingData } =
		useOnboardingStore();
	const [code, setCode] = useState('');
	const queryClient = useQueryClient();
	const { showInfo, showError } = useToastStore();

	const { hasPermission, requestPermission } = useCameraPermission();

	const device = useCameraDevice('back');

	// useRef를 사용하여 코드가 스캔되었는지 추적
	const hasScannedRef = useRef(false);

	const codeScanner = useCodeScanner({
		codeTypes: ['qr'],
		onCodeScanned: async (codes) => {
			// 이미 스캔되었으면 추가 스캔 방지
			if (hasScannedRef.current) return;
			if (codes.length === 0) return;
			if (!codes[0].value) return;

			// 스캔 상태를 true로 설정하여 추가 스캔 방지
			hasScannedRef.current = true;
			await handlePressJoin(codes[0].value);
		},
	});

	const isOnboarding = currentStep === 'GROUP_JOIN';
	const [isQrCode, setIsQrCode] = useState(false);
	const [joinError, setJoinError] = useState(false);
	const [permissionDenied, setPermissionDenied] = useState(false);

	const handlePressQrCode = async () => {
		// 권한 상태 초기화
		setPermissionDenied(false);

		if (!hasPermission) {
			try {
				const permission = await requestPermission();
				// 권한이 여전히 없으면 거부된 것으로 처리
				if (!permission) {
					setPermissionDenied(true);
					setIsQrCode(true); // 권한 안내 UI를 보여주기 위해 QR 모드로 전환
					return;
				}
			} catch (error) {
				console.log(error);
				setPermissionDenied(true);
				setIsQrCode(true); // 권한 안내 UI를 보여주기 위해 QR 모드로 전환
				return;
			}
		}

		setIsQrCode(true);
		// QR 코드 모드로 전환 시 스캔 상태 초기화
		hasScannedRef.current = false;
		setJoinError(false);
	};


	const handleRetry = () => {
		// 스캔 재시도를 위해 상태 초기화
		hasScannedRef.current = false;
		setJoinError(false);
	};

	const handlePressJoin = async (_code: string) => {
		if (!user) return;
		if (_code.length !== 6) {
			showInfo('6자리 초대코드를 입력해주세요');
			return;
		}

		// update firestore group member
		// TODO: error handling 개선
		try {
			// 오류 상태 초기화
			setJoinError(false);
			const group = await joinGroup({
				member: {
					id: user.id,
					displayName: isOnboarding ? userData.displayName : user.displayName,
					photoUrl: user.photoUrl,
					role: 'member',
				},
				inviteCode: _code,
			});
			const isMain = user.groups?.findIndex((g) => g.isMain === true) === -1;
			// update firestore user groups
			await addUserGroupProfile(user.id, {
				groupId: group.id,
				notificationPreferences: {
					fellowship: true,
					prayerRequest: true,
					board: {
						activity: true,
						newPost: true,
					},
				},
				isMain,
			});

			// if onboarding, complete onboarding
			if (isOnboarding) await submitOnboardingData(user.id);
			else {
				showInfo(`${group.groupName}에 참여했어요`);
				queryClient.invalidateQueries({
					queryKey: [GROUPS_QUERY_KEY],
					refetchType: 'all',
				});
			}

			router.push('/(app)/(tabs)');
		} catch (error) {
			//@ts-ignore
			showError(error.message);
			setJoinError(true);
		}
	};

	const handlePressLater = async () => {
		if (!user) return;
		await submitOnboardingData(user.id);
	};

	const onPressBackButton = () => {
		if (!isOnboarding) {
			if (router.canGoBack()) router.back();
			return;
		}
		setStep('GROUP_LANDING');
	};

	return (
		<KeyboardAvoidingView>
			<VStack className="h-full">
				<Header onPressBackButton={onPressBackButton} />
				{isQrCode ? (
					<VStack className="px-5 my-6 gap-10 flex-1">
						{permissionDenied ? (
							<VStack space="xl" className="items-center justify-center flex-1">
								<Text size="xl" className="text-center font-pretendard-Medium">
									카메라 사용 권한이 필요해요
								</Text>
								<Text size="md" className="text-center text-gray-500 mb-4">
									설정에서 카메라 권한을 허용해주세요
								</Text>
								<Button size="lg" onPress={openAppSettings}>
									<ButtonText>설정으로 이동하기</ButtonText>
								</Button>
							</VStack>
						) : joinError ? (
							<VStack space="xl" className="items-center justify-center flex-1">
								<Text size="xl" className="text-center font-pretendard-Medium">
									그룹 참여에 실패했어요
								</Text>
								<Button size="lg" onPress={handleRetry}>
									<ButtonText>다시 시도하기</ButtonText>
									<ButtonIcon as={RotateCw} />
								</Button>
							</VStack>
						) : (
							<Camera
								device={device!}
								isActive={isQrCode}
								style={{ flex: 1, width: '100%', height: 200 }}
								codeScanner={codeScanner}
							/>
						)}
						<Button
							variant="outline"
							onPress={() => {
								setIsQrCode(false);
								// 입력 모드로 돌아갈 때 스캔 상태 초기화
								hasScannedRef.current = false;
							}}
						>
							<ButtonIcon as={ArrowLeft} />
							<ButtonText>초대 코드 입력하기</ButtonText>
						</Button>
					</VStack>
				) : (
					<>
						<VStack space="4xl" className="px-4 mt-8 flex-1">
							<VStack space="3xl">
								<VStack space="sm">
									<Heading size="2xl">소그룹 초대코드를 입력해주세요</Heading>
									{isOnboarding && (
										<Text>초대된 그룹이 없다면 넘어갈 수 있어요.</Text>
									)}
								</VStack>
								<Input
									variant="outline"
									size="lg"
									isDisabled={false}
									isInvalid={false}
									isReadOnly={false}
									className="rounded-2xl"
								>
									<InputField
										value={code}
										onChangeText={(text) => {
											const newText = text.trim().toUpperCase();
											setCode(newText);
										}}
										placeholder="6자리 초대코드"
										maxLength={6}
										autoCapitalize="characters"
										className="text-md font-pretendard-Regular"
									/>
								</Input>
							</VStack>
						</VStack>
						<VStack
							space="lg"
							className={cn('mx-4', isOnboarding ? 'mb-4' : 'mb-8')}
						>
							<HStack space="md">
								<Button
									size="lg"
									variant="outline"
									onPress={handlePressQrCode}
									className="flex-1"
								>
									<ButtonText>QR코드로 참여하기</ButtonText>
									<ButtonIcon as={QrCode} />
								</Button>
								<Button
									size="lg"
									disabled={code.length !== 6}
									onPress={() => handlePressJoin(code)}
									className="flex-1"
								>
									<ButtonText>그룹 참여하기</ButtonText>
								</Button>
							</HStack>
							{isOnboarding && (
								<Button size="lg" variant="link" onPress={handlePressLater}>
									<ButtonText>다음에 할래요</ButtonText>
								</Button>
							)}
						</VStack>
					</>
				)}
			</VStack>
		</KeyboardAvoidingView>
	);
}
