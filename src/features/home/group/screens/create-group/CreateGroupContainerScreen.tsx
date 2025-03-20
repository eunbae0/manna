import { useState } from 'react';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';
import CreateGroupFirstStepScreen from '@/features/home/group/screens/create-group/CreateGroupFirstStepScreen';
import CreateGroupSecondStepScreen from '@/features/home/group/screens/create-group/CreateGroupSecondStepScreen';
import type { ClientGroup } from '@/api/group/types';

export type CreateGroupStep = 'GROUP_NAME' | 'CODE';

export default function CreateGroupContainerScreen() {
	const [step, setStep] = useState<CreateGroupStep>('GROUP_NAME');
	const [group, setGroup] = useState<ClientGroup | null>(null);

	const switchStep = (step: CreateGroupStep) => {
		switch (step) {
			case 'GROUP_NAME':
				return (
					<CreateGroupFirstStepScreen setStep={setStep} setGroup={setGroup} />
				);
			case 'CODE':
				return <CreateGroupSecondStepScreen group={group} />;
			default:
				return <Redirect href="/+not-found" />;
		}
	};

	return <KeyboardAvoidingView>{switchStep(step)}</KeyboardAvoidingView>;
}
