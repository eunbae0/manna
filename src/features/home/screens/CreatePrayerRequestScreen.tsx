import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Pressable, SafeAreaView, View, type TextInput } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { CheckIcon, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { Button, ButtonText } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
import { Textarea, TextareaInput } from '#/components/ui/textarea';
import { useEffect, useRef, useState } from 'react';
import { createPrayerRequest } from '@/api/prayer-request';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import type { YYYYMMDD } from '@/shared/types/date';
import {
	Checkbox,
	CheckboxIndicator,
	CheckboxIcon,
	CheckboxLabel,
} from '#/components/ui/checkbox';
import { KeyboardAvoidingView } from '@/components/common/keyboard-view/KeyboardAvoidingView';

export function CreatePrayerRequestScreen({ date }: { date: YYYYMMDD }) {
	const [prayerRequestText, setPrayerRequestText] = useState('');
	const { user, currentGroup } = useAuthStore();
	const [isAnonymous, setIsAnonymous] = useState(false);

	const ref = useRef<TextInput>(null);

	const queryClient = useQueryClient();

	const { mutate: submitPrayerRequest, isPending } = useMutation({
		mutationFn: async () => {
			if (!prayerRequestText.trim()) {
				return;
			}

			return createPrayerRequest(currentGroup?.groupId || '', {
				value: prayerRequestText.trim(),
				date: new Date(),
				member: {
					id: user?.id || '',
					displayName: isAnonymous ? '익명' : user?.displayName || '',
					photoUrl: isAnonymous ? '' : user?.photoUrl || '',
				},
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['prayer-requests', currentGroup?.groupId || '', date],
			});
			router.back();
		},
	});

	const handlePressSubmitButton = () => {
		submitPrayerRequest();
	};

	useEffect(() => {
		setTimeout(() => {
			ref.current?.focus();
		}, 100);
	}, []);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<KeyboardAvoidingView>
				<VStack className="w-full h-full">
					<VStack className="w-full flex-1 px-6 py-6 gap-10">
						<HStack className="relative items-center justify-end font-pretendard-semi-bold">
							<Text
								size="xl"
								className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
							>
								기도 제목 작성하기
							</Text>
							<Pressable onPress={() => router.back()}>
								<Icon as={X} size="lg" />
							</Pressable>
						</HStack>

						<VStack space="3xl">
							<Heading className="text-[24px]">
								오늘의 기도 제목을 작성해주세요
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

					<VStack className="w-full px-6 py-8">
						<Button
							size="lg"
							isDisabled={!prayerRequestText.trim() || isPending}
							onPress={handlePressSubmitButton}
							className="rounded-full"
						>
							<ButtonText>작성 완료</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

export default CreatePrayerRequestScreen;
