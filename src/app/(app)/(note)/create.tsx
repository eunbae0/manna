import { VStack } from '#/components/ui/vstack';
import {
	SafeAreaView,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { router } from 'expo-router';
import {
	ActivityIndicator,
	Keyboard,
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';
import {
	AlignJustify,
	BookText,
	CalendarCog,
	Check,
	ChevronUp,
	Megaphone,
	Plus,
} from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToastStore } from '@/store/toast';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { usePreventBackWithConfirm } from '@/shared/hooks/usePreventBackWithConfirm';
import { ExitConfirmModal } from '@/components/common/exit-confirm-modal';
import DateTimePicker, {
	DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { KeyboardToolbar } from '@/shared/components/KeyboardToolbar';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import { useCreateNote } from '@/features/notes/hooks/useCreateNote';
import { useWorshipStore } from '@/store/worship';
import { cn } from '@/shared/utils/cn';
import type { ClientWorshipType } from '@/api/worship-types/types';
import Animated, {
	useSharedValue,
	withTiming,
	useAnimatedStyle,
	interpolate,
	Easing,
} from 'react-native-reanimated';
import { isAndroid } from '@/shared/utils/platform';

export default function CreateScreen() {
	const insets = useSafeAreaInsets();

	const [title, setTitle] = useState('');
	const [scripture, setScripture] = useState('');
	const [preacher, setPreacher] = useState('');
	const [content, setContent] = useState('');
	const [selectedDate, setSelectedDate] = useState(new Date());

	const hasContent = !!title || !!scripture || !!preacher || !!content;

	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();

	// 뒤로가기 방지 및 확인 모달 훅 사용
	const { bottomSheetProps, handleExit } = usePreventBackWithConfirm({
		condition: hasContent,
	});
	const { showSuccess, showInfo } = useToastStore();
	const titleRef = useRef<TextInput>(null);

	const { worshipTypes } = useWorshipStore();
	const [selectedWorshipType, setSelectedWorshipType] =
		useState<ClientWorshipType | null>(null);

	const { createNote, isLoading } = useCreateNote({
		onSuccess: (noteId) => {
			showSuccess('노트가 생성되었어요');
			handleExit();
			router.replace(`/(app)/(note)/${noteId}`);
		},
		onError: () => {
			showSuccess('노트 생성에 실패했어요. 다시 시도해주세요');
		},
	});

	const handleCreateNote = () => {
		if (!title) {
			showInfo('설교 제목을 입력해주세요');
			return;
		}

		if (!selectedWorshipType) {
			showInfo('예배 종류를 선택해주세요');
			return;
		}

		const noteData = {
			title,
			date: selectedDate,
			content,
			sermon: scripture,
			preacher,
			worshipType: selectedWorshipType,
		};

		createNote(noteData);
	};

	const handleOpenDate = () => {
		if (Keyboard.isVisible()) {
			Keyboard.dismiss();
		}
		if (isAndroid) {
			DateTimePickerAndroid.dismiss('date');
			DateTimePickerAndroid.open({
				mode: 'date',
				value: selectedDate,
				onChange: (event, date) => {
					if (event.type === 'set') {
						setSelectedDate(date ?? new Date());
					}
				},
			});
			return;
		}
		handleOpen();
	};

	useEffect(() => {
		setTimeout(() => {
			titleRef.current?.focus();
		}, 100);
	}, []);

	// 펼쳐짐/접힘 애니메이션
	const [isFolded, setIsFolded] = useState(false);
	const foldAnimation = useSharedValue(1); // 1: 펼쳐짐, 0: 접힘
	const rotateAnimation = useSharedValue(0); // 0: 아래 화살표, 1: 위 화살표

	const toggleFold = () => {
		setIsFolded((prev) => !prev);
		foldAnimation.value = withTiming(isFolded ? 1 : 0, {
			duration: 300,
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		});
		rotateAnimation.value = withTiming(isFolded ? 0 : 1, {
			duration: 300,
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		});
	};

	const contentStyle = useAnimatedStyle(() => {
		return {
			opacity: foldAnimation.value,
			maxHeight: interpolate(foldAnimation.value, [0, 1], [0, 500]),
			height: 'auto',
			gap: 16,
			marginTop: interpolate(foldAnimation.value, [0, 1], [0, 16]),
			flexDirection: 'column',
		};
	});

	const iconStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					rotate: `${interpolate(rotateAnimation.value, [0, 1], [0, 180])}deg`,
				},
			],
		};
	});

	return (
		<>
			<SafeAreaView className="h-full">
				<KeyboardDismissView>
					<VStack space="xl" className="h-full">
						<Header />
						<KeyboardAwareScrollView keyboardShouldPersistTaps="always">
							<VStack space="2xl" className="px-6 flex-1">
								<VStack space="md" className="w-full">
									<TextInput
										ref={titleRef}
										placeholder="설교 제목"
										className="text-3xl font-pretendard-bold"
										value={title}
										onChangeText={setTitle}
									/>
									<Pressable onPress={handleOpenDate}>
										<HStack className="items-center justify-between">
											<Text size="lg" className="text-typography-500">
												{selectedDate.toLocaleDateString('ko-KR', {
													year: 'numeric',
													month: 'long',
													day: 'numeric',
													weekday: 'long',
												})}
											</Text>
											<Button size="sm" variant="icon" onPress={handleOpenDate}>
												<ButtonIcon as={CalendarCog} />
											</Button>
										</HStack>
									</Pressable>
								</VStack>
								<VStack
									space="sm"
									className="relative bg-gray-50 border border-gray-200 rounded-2xl px-4 py-5"
								>
									<Pressable
										onPress={() => toggleFold()}
										className="absolute top-5 right-4 z-10"
									>
										<HStack space="xs" className="items-center">
											<Text size="md" className="text-typography-600">
												{isFolded ? '펼치기' : '접기'}
											</Text>
											<Animated.View style={iconStyle}>
												<Icon
													as={ChevronUp}
													size="md"
													className="stroke-typography-600"
												/>
											</Animated.View>
										</HStack>
									</Pressable>
									<VStack space="xs">
										<HStack space="sm" className="items-center">
											<Icon
												as={BookText}
												size="sm"
												className="stroke-typography-600"
											/>
											<Text size="md" className="text-typography-600">
												설교 본문
											</Text>
										</HStack>
										<TextInput
											placeholder="ex. 창세기 1장 1절"
											className="w-full text-xl ml-6"
											value={scripture}
											onChangeText={setScripture}
										/>
									</VStack>
									<Animated.View style={contentStyle}>
										<VStack space="xs">
											<HStack space="sm" className="items-center">
												<Icon
													as={AlignJustify}
													size="sm"
													className="stroke-typography-600"
												/>
												<Text size="md" className="text-typography-600">
													예배 종류
												</Text>
											</HStack>

											<ScrollView
												horizontal
												showsHorizontalScrollIndicator={false}
												contentContainerStyle={{ paddingRight: 20 }}
												className="flex-grow ml-4"
											>
												<HStack space="sm" className="py-1 items-center">
													{worshipTypes.map((type) => (
														<TouchableOpacity
															key={type.id.toString()}
															onPress={() => setSelectedWorshipType(type)}
															className={cn(
																'mr-1 px-3 py-1 rounded-full',
																selectedWorshipType?.id === type.id
																	? 'border border-primary-200 bg-primary-100 text-primary-700'
																	: 'border border-primary-200 text-typography-700',
															)}
														>
															<HStack space="xs" className="items-center">
																<Text size="md">{type.name}</Text>
																{selectedWorshipType?.id === type.id && (
																	<Icon
																		as={Check}
																		size="xs"
																		className="stroke-typography-700"
																	/>
																)}
															</HStack>
														</TouchableOpacity>
													))}
													<TouchableOpacity
														onPress={() =>
															router.push('/(app)/selectWorshipTypeModal')
														}
														className="mr-1 p-2 border border-primary-200 bg-primary-50 rounded-full"
													>
														<Icon as={Plus} size="sm" className="" />
													</TouchableOpacity>
												</HStack>
											</ScrollView>
										</VStack>
										<VStack space="xs">
											<HStack space="sm" className="items-center">
												<Icon
													as={Megaphone}
													size="sm"
													className="stroke-typography-600"
												/>
												<Text size="md" className="text-typography-600">
													설교자
												</Text>
											</HStack>

											<TextInput
												placeholder="비어 있음"
												className="w-full text-xl ml-6"
												value={preacher}
												onChangeText={setPreacher}
											/>
										</VStack>
									</Animated.View>
								</VStack>
								<TextInput
									placeholder="설교 노트를 적어보세요 ..."
									className="text-xl flex-1 min-h-80"
									multiline={true}
									textAlignVertical="top"
									value={content}
									onChangeText={setContent}
								/>
							</VStack>
						</KeyboardAwareScrollView>
						<Button
							size="lg"
							className="mx-6 mb-6"
							rounded
							onPress={handleCreateNote}
							disabled={isLoading}
						>
							<ButtonText>노트 저장하기</ButtonText>
						</Button>
					</VStack>

					{/* Bottom Sheet for Date Picker */}
					<BottomSheetContainer snapPoints={['50%']}>
						<View className="items-center justify-center pt-5 pb-10">
							<DateTimePicker
								value={selectedDate}
								mode="date"
								display="inline"
								locale="ko"
								onChange={(event, date) => {
									if (date) {
										setSelectedDate(date);
										handleClose();
									}
								}}
							/>
						</View>
					</BottomSheetContainer>

					{/* 뒤로가기 확인 모달 */}
					<ExitConfirmModal {...bottomSheetProps} onExit={handleExit} />
				</KeyboardDismissView>
			</SafeAreaView>
			<KeyboardToolbar />
		</>
	);
}
