import { Button, ButtonText } from '@/components/common/button';
import { Divider } from '#/components/ui/divider';
import { Heading } from '#/components/ui/heading';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Switch } from '#/components/ui/switch';
import { Text } from '#/components/ui/text';
import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';
import { useAuthStore } from '@/store/auth';
import { useFellowshipStore } from '@/store/createFellowship';
import { ChevronRight, CircleHelp } from 'lucide-react-native';
import { Pressable, SafeAreaView } from 'react-native';

export default function FellowshipContentScreen() {
	const { currentGroup } = useAuthStore();
	const {
		type,
		fellowshipId,
		setStep,
		updateFellowshipContent,
		content,
		completeFellowship,
	} = useFellowshipStore();

	return (
		<SafeAreaView className="h-full">
			<VStack className="flex-1">
				<Header onPressBackButton={() => setStep('INFO')} />
				<VStack className="px-5 py-6 gap-12 flex-1">
					<HStack className="items-center justify-between">
						<Heading className="text-[24px]">나눔은 어떻게 진행할까요?</Heading>
						<Pressable>
							<Icon
								as={CircleHelp}
								size="lg"
								className="color-typography-600"
							/>
						</Pressable>
					</HStack>
					<VStack className="gap-8">
						<Pressable onPress={() => setStep('CONTENT_ICEBREAKING')}>
							<HStack className="py-3 items-center justify-between w-full">
								<Heading size="lg">아이스 브레이킹</Heading>
								<HStack space="md" className="items-center">
									<Text size="lg" className="text-typography-600">
										{content.iceBreaking.length}개
									</Text>
									<Icon
										as={ChevronRight}
										size="lg"
										className="color-typography-600"
									/>
								</HStack>
							</HStack>
						</Pressable>
						<Pressable onPress={() => setStep('CONTENT_SERMON')}>
							<HStack className="py-3 items-center justify-between w-full">
								<Heading size="lg">설교 나눔</Heading>
								<HStack space="md" className="items-center">
									<Text size="lg" className="text-typography-600">
										{content.sermonTopic.length}개
									</Text>
									<Icon
										as={ChevronRight}
										size="lg"
										className="color-typography-600"
									/>
								</HStack>
							</HStack>
						</Pressable>
						<Divider />
						<HStack className="items-center justify-between">
							<VStack space="xs">
								<Heading>기도 제목</Heading>
								<Text className="text-typography-600">
									소그룹원과 기도 제목을 나눠보세요
								</Text>
							</VStack>
							<Switch
								size="md"
								isDisabled={false}
								defaultValue={content.prayerRequest.isActive}
								onChange={() => {
									updateFellowshipContent({
										prayerRequest: {
											...content.prayerRequest,
											isActive: !content.prayerRequest.isActive,
										},
									});
								}}
							/>
						</HStack>
					</VStack>
				</VStack>
				<HStack space="sm" className="mb-6 mx-5">
					<Button
						size="lg"
						variant="outline"
						rounded
						className="flex-1"
						onPress={() => {
							setStep('INFO');
						}}
					>
						<ButtonText>이전으로</ButtonText>
					</Button>
					<Button
						size="lg"
						variant="solid"
						rounded
						className="flex-1"
						onPress={async () => {
							await completeFellowship({
								type,
								groupId: currentGroup?.groupId || '',
								fellowshipId,
							});
						}}
					>
						<ButtonText>
							{type === 'CREATE' ? '생성하기' : '저장하기'}
						</ButtonText>
					</Button>
				</HStack>
			</VStack>
		</SafeAreaView>
	);
}
