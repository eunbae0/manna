import { Button, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Switch } from '#/components/ui/switch';
import { Text } from '@/shared/components/text';
import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';
import { useAuthStore } from '@/store/auth';
import { useFellowshipStore } from '@/store/createFellowship';
import { useBackHandler } from '@/shared/hooks/useBackHandler';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import { KeyboardAwareScrollView } from '@/shared/components/KeyboardAwareScrollView';
import { FELLOWSHIPS_QUERY_KEY } from '../../constants/queyKeys';
import { useQueryClient } from '@tanstack/react-query';
import { FEEDS_QUERY_KEY } from '@/features/feeds/hooks/useFeeds';
import { useShowStoreReview } from '@/shared/hooks/useShowStoreReview';

export default function FellowshipContentScreen() {
	const { showReview } = useShowStoreReview();
	const { currentGroup } = useAuthStore();
	const {
		type,
		fellowshipId,
		setStep,
		updateFellowshipOptions,
		options,
		completeFellowship,
	} = useFellowshipStore();

	useBackHandler(() => {
		setStep('INFO');
		return true;
	});

	const queryClient = useQueryClient();

	return (
		<>
			<KeyboardDismissView className="flex-1">
				<Header onPressBackButton={() => setStep('INFO')} />
				<KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
					<VStack className="flex-1">
						<VStack className="px-5 py-6 gap-14 flex-1">
							<HStack className="items-center justify-between">
								<Heading className="text-[24px]">
									나눔 옵션을 설정해보세요
								</Heading>
								{/* TODO: 도움말 모달 추가하기 */}
								{/* <Pressable>
									<Icon
										as={CircleHelp}
										size="lg"
										className="color-typography-600"
									/>
								</Pressable> */}
							</HStack>
							<VStack className="gap-6">
								<HStack className="items-center justify-between">
									<VStack space="xs">
										<Heading size="xl">그룹원도 나눔 답변 작성</Heading>
										<Text className="text-typography-600">
											활성화하면 그룹원도 함께 나눔 답변을 작성할 수 있어요
										</Text>
									</VStack>
									<Switch
										size="md"
										isDisabled={false}
										defaultValue={options.enableMemberReply}
										onChange={() => {
											updateFellowshipOptions({
												enableMemberReply: !options.enableMemberReply,
											});
										}}
									/>
								</HStack>
							</VStack>
						</VStack>
					</VStack>
				</KeyboardAwareScrollView>
				<HStack space="sm" className="mb-6 mx-5">
					<Button
						size="lg"
						variant="outline"
						className="flex-1"
						onPress={() => {
							setStep('CONTENT');
						}}
					>
						<ButtonText>이전으로</ButtonText>
					</Button>
					<Button
						size="lg"
						variant="solid"
						className="flex-1"
						onPress={async () => {
							await completeFellowship({
								type,
								groupId: currentGroup?.groupId || '',
								fellowshipId,
							});
							queryClient.invalidateQueries({
								queryKey: [FELLOWSHIPS_QUERY_KEY],
							});
							// 피드 쿼리 무효화
							queryClient.invalidateQueries({
								queryKey: [FEEDS_QUERY_KEY],
							});
							await showReview();
						}}
					>
						<ButtonText>
							{type === 'CREATE' ? '생성하기' : '저장하기'}
						</ButtonText>
					</Button>
				</HStack>
			</KeyboardDismissView>
		</>
	);
}
