import { Animated } from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFellowshipStore } from '@/store/createFellowship';
import type { FellowshipStoreStep } from '@/store/createFellowship/types';

import FellowshipInfoScreen from '@/features/fellowship/screens/create/FellowshipInfoScreen';
import FellowshipContentScreen from '@/features/fellowship/screens/create/FellowshipContentScreen';
import FellowshipIcebrakingScreen from '@/features/fellowship/screens/create/FellowshipIcebrakingScreen';
import FellowshipSermonTopicScreen from '@/features/fellowship/screens/create/FellowshipSermonTopicScreen';

export default function CreateFellowshipScreen() {
	const { currentStep } = useFellowshipStore();

	const switchStep = (step: FellowshipStoreStep) => {
		switch (step) {
			case 'INFO':
				return <FellowshipInfoScreen />;
			case 'CONTENT':
				return <FellowshipContentScreen />;
			case 'CONTENT_ICEBREAKING':
				return <FellowshipIcebrakingScreen />;
			case 'CONTENT_SERMON':
				return <FellowshipSermonTopicScreen />;
			default:
				return <Redirect href="/+not-found" />;
		}
	};

	return (
		<SafeAreaView>
			<Animated.View
			// style={{ transform: [{ translateX: slideAnim }] }}
			>
				{switchStep(currentStep)}
			</Animated.View>
		</SafeAreaView>
	);
}
