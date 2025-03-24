import { Heading } from '#/components/ui/heading';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import { Pressable } from 'react-native';
import LottieView from 'lottie-react-native';
import { VStack } from '#/components/ui/vstack';
import { router } from 'expo-router';

export default function ServiceGroups() {
	const handlePressCreateFellowship = () => {
		router.push('/(app)/(fellowship)/create');
	};

	return (
		<HStack space="md" className="px-4">
			<Pressable className="flex-1" onPress={handlePressCreateFellowship}>
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
							width: 52,
							height: 52,
							paddingTop: 4,
						}}
					/>
				</HStack>
			</Pressable>
		</HStack>
	);
}
