import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Pressable, SafeAreaView, View, type TextInput } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { CheckIcon, ChevronLeft, X } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { Textarea, TextareaInput } from '#/components/ui/textarea';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import type { YYYYMMDD } from '@/shared/types/date';
import { usePrayerRequestMutations } from '../hooks/usePrayerRequestMutations';
import {
	Checkbox,
	CheckboxIndicator,
	CheckboxIcon,
	CheckboxLabel,
} from '#/components/ui/checkbox';
import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getKSTDate } from '@/shared/utils/date';
import { useCreatePrayerRequest } from '@/features/prayer-request/hooks/useCreatePrayerRequest';
import { PRAYER_REQUESTS_QUERY_KEY } from '../hooks/usePrayerRequestsByDate';
import { ALL_PRAYER_REQUESTS_QUERY_KEY } from '@/features/prayer-request/hooks/usePrayerRequests';
import { isAndroid } from '@/shared/utils/platform';
import AnimatedPressable from '@/components/common/animated-pressable';
import { cn } from '@/shared/utils/cn';
import { ModalHeader } from '@/shared/components/modal-header/ModalHeader';

export function CreatePrayerRequestScreen() {
	const { user, currentGroup } = useAuthStore();

	const {
		id: editId,
		value: editValue,
		isAnonymous: editIsAnonymous,
	} = useLocalSearchParams<{
		id?: string;
		date?: YYYYMMDD;
		value?: string;
		isAnonymous?: 'true' | 'false';
	}>();
	const isEditMode = !!editId;

	const [prayerRequestText, setPrayerRequestText] = useState(editValue || '');
	const [isAnonymous, setIsAnonymous] = useState(editIsAnonymous === 'true');

	const ref = useRef<TextInput>(null);

	const queryClient = useQueryClient();

	const { updatePrayerRequest, isUpdating } = usePrayerRequestMutations();

	const todayDate = getKSTDate(new Date());

	// Use the custom hook for creating prayer requests
	const { createPrayerRequest: submitPrayerRequest, isLoading: isCreating } =
		useCreatePrayerRequest();

	const handlePressSubmitButton = () => {
		if (isEditMode) {
			updatePrayerRequest({
				prayerRequestId: editId,
				data: {
					value: prayerRequestText.trim(),
					member: {
						id: user?.id || '',
					},
					isAnonymous,
				},
			});

			// Manually handle navigation since we're not using the onSuccess callback
			setTimeout(() => {
				Promise.all([
					queryClient.invalidateQueries({
						queryKey: [
							PRAYER_REQUESTS_QUERY_KEY,
							currentGroup?.groupId || '',
							todayDate,
						],
					}),
					queryClient.invalidateQueries({
						queryKey: [
							ALL_PRAYER_REQUESTS_QUERY_KEY,
							currentGroup?.groupId || '',
						],
					}),
				]);
				router.back();
			}, 500);
		} else {
			submitPrayerRequest({
				value: prayerRequestText,
				isAnonymous,
			});
		}
	};

	useEffect(() => {
		setTimeout(() => {
			ref.current?.focus();
		}, 200);
	}, []);

	const { bottom, top } = useSafeAreaInsets();
	console.log(top);

	return (
		<KeyboardAvoidingView className="h-full">
			<VStack
				className="flex-1 w-full gap-10 pt-2"
				style={{ paddingTop: isAndroid ? top : 0 }}
			>
				<ModalHeader
					title={isEditMode ? '기도 제목 수정하기' : '기도 제목 작성하기'}
					onBackPress={() => router.back()}
				/>
				<VStack className="w-full px-6 pb-6">
					<VStack space="3xl" className="w-full">
						<Heading className="text-[24px]">
							{isEditMode
								? '기도 제목을 수정해주세요'
								: '오늘의 기도 제목을 작성해주세요'}
						</Heading>
						<VStack space="md">
							<View>
								<Textarea size="xl">
									<TextareaInput
										//@ts-ignore
										ref={ref}
										placeholder="기도 제목을 입력해주세요"
										value={prayerRequestText}
										onChangeText={setPrayerRequestText}
										textAlignVertical="top"
										style={{ paddingTop: 12 }}
									/>
								</Textarea>
							</View>
							<Checkbox
								size="md"
								value={'익명'}
								onChange={() => setIsAnonymous(!isAnonymous)}
								isChecked={isAnonymous}
								className="ml-auto"
							>
								<CheckboxIndicator>
									<CheckboxIcon as={CheckIcon} />
								</CheckboxIndicator>
								<CheckboxLabel>익명으로 작성할래요</CheckboxLabel>
							</Checkbox>
						</VStack>
					</VStack>
				</VStack>
			</VStack>
			<VStack className="w-full px-6" style={{ paddingBottom: top + bottom }}>
				<Button
					size="lg"
					disabled={!prayerRequestText.trim() || isCreating || isUpdating}
					onPress={handlePressSubmitButton}
					rounded
				>
					<ButtonText>{isEditMode ? '수정 완료' : '작성 완료'}</ButtonText>
				</Button>
			</VStack>
		</KeyboardAvoidingView>
	);
}

export default CreatePrayerRequestScreen;
