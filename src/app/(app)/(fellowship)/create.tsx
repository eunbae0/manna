import { Animated } from 'react-native';
import { Redirect } from 'expo-router';

import { useFellowshipStore } from '@/store/createFellowship';
import type { FellowshipStoreStep } from '@/store/createFellowship/types';

import FellowshipInfoScreen from '@/features/fellowship/screens/create/FellowshipInfoScreen';
import FellowshipContentScreen from '@/features/fellowship/screens/create/FellowshipContentScreen';
import FellowshipIcebrakingScreen from '@/features/fellowship/screens/create/FellowshipIcebrakingScreen';
import FellowshipSermonTopicScreen from '@/features/fellowship/screens/create/FellowshipSermonTopicScreen';
import { usePreventBackWithConfirm } from '@/shared/hooks/usePreventBackWithConfirm';
import { ExitConfirmModal } from '@/components/common/exit-confirm-modal';

export default function CreateFellowshipScreen() {
	const { currentStep, clearFellowship } = useFellowshipStore();

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
	const { bottomSheetProps, handleExit } = usePreventBackWithConfirm({
		condition: true,
	});

	return (
		<>
			{switchStep(currentStep)}
			<ExitConfirmModal
				{...bottomSheetProps}
				onExit={() => {
					clearFellowship();
					handleExit();
				}}
			/>
		</>
	);
}
