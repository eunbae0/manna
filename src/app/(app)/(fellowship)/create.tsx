import { Animated, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useFellowshipStore } from '@/store/createFellowship';
import type { FellowshipStoreStep } from '@/store/createFellowship/types';

import FellowshipInfoScreen from '@/features/fellowship/screens/create/FellowshipInfoScreen';
import FellowshipContentScreen from '@/features/fellowship/screens/create/FellowshipContentScreen';
import FellowshipOptionsScreen from '@/features/fellowship/screens/create/FellowshipOptionsScreen';
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
			case 'OPTIONS':
				return <FellowshipOptionsScreen />;
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
