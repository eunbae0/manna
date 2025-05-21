import { Animated, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useFellowshipStore } from '@/store/createFellowship';
import type { FellowshipStoreStep } from '@/store/createFellowship/types';

import FellowshipInfoScreen from '@/features/fellowship/screens/create/FellowshipInfoScreen';
import FellowshipContentScreen from '@/features/fellowship/screens/create/FellowshipContentScreen';
import FellowshipIcebrakingScreen from '@/features/fellowship/screens/create/IceBreakingScreen';
import FellowshipSermonTopicScreen from '@/features/fellowship/screens/create/FellowshipSermonTopicScreen';
import { usePreventBackWithConfirm } from '@/shared/hooks/usePreventBackWithConfirm';
import { ExitConfirmModal } from '@/components/common/exit-confirm-modal';
import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateFellowshipScreen() {
	const { currentStep, clearFellowship } = useFellowshipStore();

	const switchStep = useCallback((step: FellowshipStoreStep) => {
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
	}, []);

	const { bottomSheetProps, handleExit } = usePreventBackWithConfirm({
		condition: true,
	});

	return (
		<SafeAreaView style={{ flex: 1 }}>
			{switchStep(currentStep)}
			<ExitConfirmModal
				{...bottomSheetProps}
				onExit={() => {
					clearFellowship();
					handleExit();
				}}
			/>
		</SafeAreaView>
	);
}
