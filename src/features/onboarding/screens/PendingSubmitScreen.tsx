import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, {
	useSharedValue,
	withTiming,
	useAnimatedStyle,
} from 'react-native-reanimated';
import { useOnboardingStore } from '@/store/onboarding';
import { VStack } from '#/components/ui/vstack';
import { Heading } from '@/shared/components/heading';
import { Text } from '@/shared/components/text';
import LottieView from 'lottie-react-native';

import { runOnJS } from 'react-native-reanimated';

export default function PendingSubmitScreen() {
	const { userData, isOnboarding, setStep } = useOnboardingStore();
	const progress = useSharedValue(0);
	const [isDurationDone, setIsDurationDone] = useState(false);

	useEffect(() => {
		progress.value = withTiming(80, { duration: 2500 }, () => {
			runOnJS(setIsDurationDone)(true);
		});
	}, [progress]);

	useEffect(() => {
		if (isDurationDone && !isOnboarding) {
			setStep('FINISH');
		}
	}, [isDurationDone, isOnboarding, setStep]);

	const animatedBarStyle = useAnimatedStyle(() => ({
		width: `${progress.value}%`,
	}));

	return (
		<VStack className="flex-1 h-full items-center justify-center px-4">
			<VStack className="flex-1 items-center justify-center gap-8">
				<VStack space="lg" className="items-center">
					<Heading size="3xl">
						{userData.displayName
							? `${userData.displayName}님을 맞이할 준비를 하고 있어요`
							: '회원님을 맞이할 준비를 하고 있어요'}
					</Heading>
					<Text
						size="lg"
						weight="medium"
						className="text-typography-600 text-center"
					>
						잠시만 기다려주세요 🙂
					</Text>
				</VStack>
				<LottieView
					source={require('../../../../assets/lotties/onboarding_pending.json')}
					autoPlay
					loop
					style={{ width: 180, height: 120 }}
				/>
			</VStack>

			{/* ProgressBar */}
			<VStack className="mb-10 w-full items-center">
				<View
					accessible
					accessibilityRole="progressbar"
					accessibilityValue={{
						min: 0,
						max: 100,
						now: Math.round(progress.value),
					}}
					style={{
						width: '90%',
						height: 8,
						backgroundColor: 'lightgray',
						borderRadius: 4,
						overflow: 'hidden',
					}}
				>
					<Animated.View
						style={[
							{
								height: '100%',
								backgroundColor: '#362303',
								borderRadius: 4,
							},
							animatedBarStyle,
						]}
					/>
				</View>
			</VStack>
		</VStack>
	);
}
