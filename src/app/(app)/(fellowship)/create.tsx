import { Animated } from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import FellowshipInfoScreen from '@/components/screens/fellowship/FellowshipInfoScreen';
import {
	type FellowshipStep,
	useFellowshipStore,
} from '@/store/createFellowship';
import FellowshipContentScreen from '@/components/screens/fellowship/FellowshipContentScreen';
import FellowshipIcebrakingScreen from '@/components/screens/fellowship/FellowshipIcebrakingScreen';
import FellowshipSermonTopicScreen from '@/components/screens/fellowship/FellowshipSermonTopicScreen';

export default function CreateFellowshipScreen() {
	const { currentStep } = useFellowshipStore();

	const switchStep = (step: FellowshipStep) => {
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
