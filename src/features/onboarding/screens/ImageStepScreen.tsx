import { useState } from 'react';
import { Alert, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { useOnboardingStore } from '@/store/onboarding';
import { Heading } from '@/shared/components/heading';
import { VStack } from '#/components/ui/vstack';
import * as ImageManipulator from 'expo-image-manipulator';
import Header from '@/components/common/Header';
import { PlusCircle, UserRoundPen, X } from 'lucide-react-native';
import { Text } from '#/components/ui/text';
import { Box } from '#/components/ui/box';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Icon } from '#/components/ui/icon';
import { HStack } from '#/components/ui/hstack';

export default function ImageStepScreen() {
	const { setStep, updateUserData, userData } = useOnboardingStore();
	const [imageUri, setImageUri] = useState<string | null>(
		userData.photoUrl || null,
	);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function handlePickImage() {
		setIsLoading(true);
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.5,
				selectionLimit: 1,
			});
			if (!result.canceled && result.assets && result.assets.length > 0) {
				const selectedImageUri = result.assets[0].uri;
				setImageUri(selectedImageUri);
			}
		} catch (error) {
			Alert.alert(
				'이미지 선택 오류',
				'이미지를 선택하는 중 오류가 발생했어요. 다시 시도해보세요.',
			);
		} finally {
			setIsLoading(false);
		}
	}

	function handlePressNext() {
		if (imageUri) {
			updateUserData({ photoUrl: imageUri });
		}
		setStep('GROUP_LANDING');
	}

	return (
		<VStack className="flex-1 h-full">
			<Header onPressBackButton={() => setStep('NAME')} />
			<VStack className="flex-1 px-4 mt-8 gap-12">
				<VStack className="gap-12">
					<VStack space="sm">
						<Heading size="2xl">프로필 이미지를 설정해보세요</Heading>
						<Text className="text-typography-600">
							그룹원들에게 보여지는 이미지에요.
						</Text>
					</VStack>
					<VStack space="4xl">
						<HStack className="items-start justify-center">
							<AnimatedPressable onPress={handlePickImage}>
								{imageUri ? (
									<Image
										source={{ uri: imageUri }}
										style={{
											width: 200,
											height: 200,
											borderRadius: 999,
											alignSelf: 'center',
											backgroundColor: '#E5E5E5',
										}}
										accessibilityLabel="선택된 프로필 이미지"
									/>
								) : (
									<Box
										style={{
											width: 200,
											height: 200,
											borderRadius: 999,
											alignSelf: 'center',
											backgroundColor: '#E5E5E5',
										}}
										accessibilityLabel="프로필 이미지 선택 전 이미지"
									/>
								)}
							</AnimatedPressable>
							{imageUri && (
								<AnimatedPressable onPress={() => setImageUri(null)}>
									<Box
										className="absolute top-0 left-0 border border-red-300 rounded-full p-2"
										accessible
										accessibilityRole="button"
										accessibilityLabel="이미지 삭제"
									>
										<Icon as={X} size="lg" className="text-red-600" />
									</Box>
								</AnimatedPressable>
							)}
						</HStack>

						<Box className="flex items-center">
							<Button
								size="lg"
								variant="outline"
								onPress={handlePickImage}
								disabled={isLoading}
								rounded
							>
								<ButtonText>
									{imageUri ? '이미지 변경하기' : '이미지 선택하기'}
								</ButtonText>
								<ButtonIcon as={imageUri ? UserRoundPen : PlusCircle} />
							</Button>
						</Box>
					</VStack>
				</VStack>
			</VStack>
			<VStack space="sm" className="mx-5 mb-6">
				<Button size="lg" onPress={handlePressNext} rounded>
					<ButtonText>다음</ButtonText>
				</Button>
			</VStack>
		</VStack>
	);
}
