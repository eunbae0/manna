import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Pressable, SafeAreaView, View, type TextInput } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { CheckIcon, X } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, ButtonText } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
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

export function CreatePrayerRequestScreen() {
	const { user, currentGroup } = useAuthStore();

	const {
		id: editId,
		date: editDate,
		value: editValue,
	} = useLocalSearchParams<{
		id?: string;
		date?: YYYYMMDD;
		value?: string;
	}>();
	const isEditMode = !!editId;

	const [prayerRequestText, setPrayerRequestText] = useState(editValue || '');
	const [isAnonymous, setIsAnonymous] = useState(false);

	const ref = useRef<TextInput>(null);

	const queryClient = useQueryClient();

	const { updatePrayerRequest, isUpdating } = usePrayerRequestMutations();

	const todayDate = getKSTDate(new Date());

	// Use the custom hook for creating prayer requests
	const { createPrayerRequest: submitPrayerRequest, isLoading: isCreating } = useCreatePrayerRequest({
		onSuccess: () => {
			router.back();
		},
	});

	const handlePressSubmitButton = () => {
		if (isEditMode) {
			updatePrayerRequest({
				prayerRequestId: editId,
				data: {
					value: prayerRequestText.trim(),
					member: {
						id: user?.id || '',
						displayName: isAnonymous ? '익명' : user?.displayName || '',
						photoUrl: isAnonymous ? '' : user?.photoUrl || '',
					},
				},
			});

			// Manually handle navigation since we're not using the onSuccess callback
			setTimeout(() => {
				Promise.all([
					queryClient.invalidateQueries({
						queryKey: [
							'prayer-requests',
							currentGroup?.groupId || '',
							editDate,
						],
					}),
					queryClient.invalidateQueries({
						queryKey: ['all-prayer-requests', currentGroup?.groupId || ''],
					}),
				]);
				router.back();
			}, 500);
		} else {
			submitPrayerRequest({
				value: prayerRequestText,
				date: new Date(),
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

	return (
		<KeyboardAvoidingView className="h-full">
			<VStack className="flex-1">
				<VStack className="w-full px-6 py-6 gap-10">
					<HStack className="relative items-center justify-end font-pretendard-semi-bold">
						<Text
							size="xl"
							className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
						>
							{isEditMode ? '기도 제목 수정하기' : '기도 제목 작성하기'}
						</Text>
						<Pressable onPress={() => router.back()}>
							<Icon as={X} size="lg" />
						</Pressable>
					</HStack>

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
			<VStack
				className="w-full px-6"
				style={{ paddingBottom: top + bottom + 12 }}
			>
				<Button
					size="lg"
					isDisabled={!prayerRequestText.trim() || isCreating || isUpdating}
					onPress={handlePressSubmitButton}
					className="rounded-full"
				>
					<ButtonText>{isEditMode ? '수정 완료' : '작성 완료'}</ButtonText>
				</Button>
			</VStack>
		</KeyboardAvoidingView>
	);
}

export default CreatePrayerRequestScreen;
