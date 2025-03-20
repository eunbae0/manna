import GroupLandingScreen, {
	type GroupLandingOption,
} from '@/features/home/group/screens/GroupLandingScreen';
import { useOnboardingStore } from '@/store/onboarding';

export default function GroupStepScreen() {
	const { setStep } = useOnboardingStore();

	const handleOptionPress = (option: GroupLandingOption) => {
		switch (option) {
			case 'create':
				setStep('GROUP_CREATE');
				break;
			case 'join':
				setStep('GROUP_JOIN');
				break;
		}
	};

	return <GroupLandingScreen handlePressOption={handleOptionPress} />;
}
