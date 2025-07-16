import { useState, useEffect, useRef, useMemo } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Path, Svg } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/shared/components/text';
import { useOnboardingStore } from '@/store/onboarding';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { VStack } from '#/components/ui/vstack';
import { ChevronRight, Mail } from 'lucide-react-native';

import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthStore } from '@/store/auth';
import { Divider } from '#/components/ui/divider';
import { HStack } from '#/components/ui/hstack';
import { Icon, createIcon } from '#/components/ui/icon';
import Carousel, {
	type ICarouselInstance,
	Pagination,
} from 'react-native-reanimated-carousel';
import Animated, { SlideInRight, SlideOutLeft, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useSharedValueState } from '@/shared/hooks/animation/useSharedValueState';
import Heading from '@/shared/components/heading';
function AuthStepScreen() {
	const [isPressStart, setIsPressStart] = useState(false);

	const handlePressStart = () => {
		setIsPressStart(true);
	};

	return (
		<SafeAreaView className="bg-white flex-1">
			{isPressStart ? (
				<Animated.View
					entering={SlideInRight.duration(300)}
					style={{ flex: 1 }}
				>
					<LoginScreen />
				</Animated.View>
			) : (
				<Animated.View
					exiting={SlideOutLeft.duration(300)}
					style={{ flex: 1 }}
				>
					<OnboardingCarousel setIsPressStart={handlePressStart} />
				</Animated.View>
			)}
		</SafeAreaView>
	);
}
export default AuthStepScreen;

function GoogleIcon() {
	const GluestackIcon = createIcon({
		viewBox: '0 0 50 50',
		path: (
			<Svg viewBox="0 0 50 50" width="50px" height="50px">
				<Path d="M 26 2 C 13.308594 2 3 12.308594 3 25 C 3 37.691406 13.308594 48 26 48 C 35.917969 48 41.972656 43.4375 45.125 37.78125 C 48.277344 32.125 48.675781 25.480469 47.71875 20.9375 L 47.53125 20.15625 L 46.75 20.15625 L 26 20.125 L 25 20.125 L 25 30.53125 L 36.4375 30.53125 C 34.710938 34.53125 31.195313 37.28125 26 37.28125 C 19.210938 37.28125 13.71875 31.789063 13.71875 25 C 13.71875 18.210938 19.210938 12.71875 26 12.71875 C 29.050781 12.71875 31.820313 13.847656 33.96875 15.6875 L 34.6875 16.28125 L 41.53125 9.4375 L 42.25 8.6875 L 41.5 8 C 37.414063 4.277344 31.960938 2 26 2 Z M 26 4 C 31.074219 4 35.652344 5.855469 39.28125 8.84375 L 34.46875 13.65625 C 32.089844 11.878906 29.199219 10.71875 26 10.71875 C 18.128906 10.71875 11.71875 17.128906 11.71875 25 C 11.71875 32.871094 18.128906 39.28125 26 39.28125 C 32.550781 39.28125 37.261719 35.265625 38.9375 29.8125 L 39.34375 28.53125 L 27 28.53125 L 27 22.125 L 45.84375 22.15625 C 46.507813 26.191406 46.066406 31.984375 43.375 36.8125 C 40.515625 41.9375 35.320313 46 26 46 C 14.386719 46 5 36.609375 5 25 C 5 13.390625 14.386719 4 26 4 Z" />
			</Svg>
		),
	});
	return (
		<Icon as={GluestackIcon} size="xl" className="text-typography-black" />
	);
}

function LoginScreen() {
	const { signIn } = useAuthStore();
	const { setStep, setOnboarding, updateUserData } = useOnboardingStore();

	const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);
	useEffect(() => {
		// Apple 인증이 기기에서 가능한지 확인
		const checkAppleAuthAvailability = async () => {
			const available = await AppleAuthentication.isAvailableAsync();
			setIsAppleAuthAvailable(available);
		};

		checkAppleAuthAvailability();
	}, []);

	const onAppleButtonPress = async () => {
		await signIn('APPLE', { updateUserData });
		setOnboarding();
	};

	const onGoogleButtonPress = async () => {
		await signIn('GOOGLE', { updateUserData });
		setOnboarding();
	};
	return (
		<VStack className="mx-4 items-center justify-between h-full gap-28 pt-10 pb-6">
			<VStack space="sm" className="w-full">
				<Image
					source={require('../../../assets/images/icons/manna_icon_white.png')}
					style={{ width: 80, height: 80 }}
					contentFit="contain"
				/>
				<VStack space="md" className="items-start pl-2">
					<Heading size="3xl">만나</Heading>
					<Text size="xl">크리스천 공동체의 소통과 묵상 공간</Text>
				</VStack>
			</VStack>

			<VStack space="xl" className="w-full">
				<VStack space="4xl" className="w-full">
					<VStack space="lg" className="w-full">
						{isAppleAuthAvailable && (
							<AppleAuthentication.AppleAuthenticationButton
								buttonType={
									AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
								}
								buttonStyle={
									AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
								}
								cornerRadius={999}
								style={{ width: '100%', height: 42 }}
								onPress={onAppleButtonPress}
								className="rounded-full gap-4"
							/>
						)}
						<Button
							onPress={onGoogleButtonPress}
							size="lg"
							className="bg-white"
							rounded
							variant="outline"
						>
							<ButtonIcon
								as={GoogleIcon}
								className="fill-white text-typography-black"
							/>
							<ButtonText size="lg">Google로 계속하기</ButtonText>
						</Button>
						<Button
							onPress={() => {
								setStep('EMAIL_SIGN_IN');
								router.push('/(auth)/onboarding');
							}}
							size="lg"
							rounded
						>
							<ButtonIcon as={Mail} />
							<ButtonText size="lg">이메일로 로그인하기</ButtonText>
						</Button>
					</VStack>
					<HStack space="md" className="items-center w-full">
						<Divider className="flex-1" />
						<Text>또는</Text>
						<Divider className="flex-1" />
					</HStack>
					<Button
						onPress={() => {
							setStep('EMAIL_SIGN_UP');
							router.push('/(auth)/onboarding');
						}}
						size="lg"
						rounded
						variant="outline"
					>
						<ButtonIcon as={Mail} />
						<ButtonText size="lg">이메일로 회원가입하기</ButtonText>
					</Button>
				</VStack>
				<HStack space="xs" className="items-center justify-center w-full">
					<Text size="sm" className="text-center">
						로그인 시
					</Text>
					<HStack className="items-center">
						<Pressable onPress={() => router.push('/policy')}>
							<Text
								size="sm"
								className="text-center border-b border-typography-500"
							>
								개인정보취급방침과 이용약관
							</Text>
						</Pressable>
						<Text size="sm" className="text-center">
							에 동의하는 것으로 간주합니다.
						</Text>
					</HStack>
				</HStack>
			</VStack>
		</VStack>
	)
}

function OnboardingCarousel({ setIsPressStart }: { setIsPressStart: () => void }) {
	const { width } = useWindowDimensions();
	const imageHeight = width * 1.3;
	const ref = useRef<ICarouselInstance>(null);


	const progress = useSharedValue<number>(0);
	const currentProgress = useSharedValueState(progress);

	const data = [
		{
			id: 1,
			title: '소그룹 초대',
			description: '우리의 소그룹을 만들고 초대해보세요',
			image: require('../../../assets/images/onboarding/onboarding_01.png'),
		},
		{
			id: 2,
			title: '공지사항 & 자유 게시판',
			description: '사진과 함께 공지나 자유로운 글을 작성해보세요.',
			image: require('../../../assets/images/onboarding/onboarding_02.png'),
		},
		{
			id: 3,
			title: '설교 나눔',
			description: '설교 나눔지를 편하게 생성해보세요. 나눔에 참여할 그룹원을 선택할 수 있어요.',
			image: require('../../../assets/images/onboarding/onboarding_03.png'),
		},
		{
			id: 4,
			title: '설교 나눔 답변',
			description: '소그룹원들의 답변을 강력한 녹음과 AI 요약 기능으로 편하게 기록해보세요',
			image: require('../../../assets/images/onboarding/onboarding_04.png'),
		},
		{
			id: 5,
			title: '성경',
			description: '성경을 편리하게 하이라이트하고, 구절을 선택해 설교 노트를 작성해보세요',
			image: require('../../../assets/images/onboarding/onboarding_05.png'),
		},
	];

	const skipButtonStyle = useAnimatedStyle(() => {
		const isLastPage = progress.value >= data.length - 1;
		return {
			opacity: withTiming(isLastPage ? 0 : 1, { duration: 100 }),
			transform: [
				{
					translateY: withTiming(isLastPage ? 10 : 0, { duration: 100 })
				}
			]
		};
	});

	const onPressPagination = (index: number) => {
		ref.current?.scrollTo({
			count: index - progress.value,
			animated: true,
		});
	};

	const onPressNext = () => {
		if (isLastPage) {
			setIsPressStart();
		}
		ref.current?.next()
	}

	const onPressSkip = () => {
		setIsPressStart();
	}

	const isLastPage = currentProgress === data.length - 1;

	const nextLabel = useMemo(() => isLastPage ? '시작하기' : '다음', [isLastPage]);

	return (
		<View className="flex-1 items-center justify-between">
			<Carousel
				ref={ref}
				width={width}
				height={width * 1.6}
				data={data}
				onProgressChange={progress}
				loop={false}
				renderItem={({ item }) => (
					<VStack space="md" className="pt-12 flex-1 items-center justify-start">
						<VStack space="sm" className="items-center px-6">
							<Text size="3xl" weight="bold" className="text-typography-900">{item.title}</Text>
							<Text size="xl" weight="semi-bold" className="max-w-[80%] text-center text-typography-500">{item.description}</Text>
						</VStack>
						<Image
							source={item.image}
							style={{ width, height: imageHeight }}
							contentFit="contain"
						/>
					</VStack>
				)}
			/>

			<VStack className="w-full items-center px-5">
				<Pagination.Basic
					progress={progress}
					data={data}
					dotStyle={{
						width: 25,
						height: 4,
						backgroundColor: "rgba(0,0,0,0.1)",
						borderRadius: 4,
					}}
					activeDotStyle={{
						width: 25,
						height: 4,
						backgroundColor: "#362303",
						borderRadius: 4,
					}}
					containerStyle={{
						gap: 8,
						marginBottom: 20,
					}}
					horizontal
					onPress={onPressPagination}
				/>
				<VStack space="sm" className="w-full items-center">
					<AnimatedPressable scale="sm" className='w-full items-center mb-4' onPress={onPressNext} withHaptic>
						<HStack space="xs" className="w-full items-center px-28 py-3 bg-primary-500 rounded-full">
							<Text size="lg" weight="semi-bold" className="pl-2 text-typography-0">{nextLabel}</Text>
							<Icon as={ChevronRight} size="lg" className="text-typography-0" />
						</HStack>
					</AnimatedPressable>
					{/* <Animated.View style={skipButtonStyle}>
						<Button variant="text" onPress={onPressSkip} innerClassName="w-full items-center">
							<ButtonText>건너뛰기</ButtonText>
						</Button>
					</Animated.View> */}
				</VStack>
			</VStack>
		</View>
	);
}
