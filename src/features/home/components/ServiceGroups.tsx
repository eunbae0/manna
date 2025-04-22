import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import LottieView from 'lottie-react-native';
import { VStack } from '#/components/ui/vstack';
import { router } from 'expo-router';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useFellowshipStore } from '@/store/createFellowship';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';

export default function ServiceGroups() {
	const { setType } = useFellowshipStore();

	const handlePressCreateFellowship = () => {
		trackAmplitudeEvent('Create Fellowship', { screen: 'Tab_Home' });
		setType('CREATE');
		router.push('/(app)/(fellowship)/create');
	};

	const handlePressNotes = () => {
		trackAmplitudeEvent('View Notes', { screen: 'Tab_Home' });
		router.replace('/(app)/(tabs)/note');
	};

	const handlePressFellowships = () => {
		trackAmplitudeEvent('View Fellowships List', { screen: 'Tab_Home' });
		router.push('/(app)/(fellowship)/list');
	};

	return (
		<VStack space="md" className="px-4">
			<AnimatedPressable
				className="flex-1"
				onPress={handlePressCreateFellowship}
			>
				<HStack className="bg-primary-500 rounded-2xl justify-between px-6 py-5">
					<VStack space="xs">
						<Heading size="lg" className="text-white">
							나눔 만들기
						</Heading>
						<Text size="sm" className="text-typography-200">
							나눔을 만들고 그룹원들과 소통해보세요
						</Text>
					</VStack>
					<LottieView
						source={require('../../../../assets/lotties/write.json')}
						autoPlay
						loop
						style={{
							width: 50,
							height: 50,
							marginTop: 4,
						}}
					/>
				</HStack>
			</AnimatedPressable>
			<HStack space="md">
				<AnimatedPressable className="flex-1" onPress={handlePressNotes}>
					<HStack className="bg-gray-200 rounded-2xl justify-between pl-5 pt-4">
						<VStack space="xs">
							<Heading size="md">내 설교 노트</Heading>
						</VStack>
						<LottieView
							source={require('../../../../assets/lotties/notes.json')}
							autoPlay
							loop
							style={{
								width: 80,
								height: 80,
							}}
						/>
					</HStack>
				</AnimatedPressable>
				<AnimatedPressable className="flex-1" onPress={handlePressFellowships}>
					<HStack className="bg-gray-200 rounded-2xl justify-between pl-5 pt-4">
						<VStack space="xs">
							<Heading size="md">나눔 기록</Heading>
						</VStack>
						<LottieView
							source={require('../../../../assets/lotties/fellowships.json')}
							autoPlay
							loop
							style={{
								width: 80,
								height: 80,
							}}
						/>
					</HStack>
				</AnimatedPressable>
			</HStack>
		</VStack>
	);
}
