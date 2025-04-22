// const copy = `# h1 Heading 8-)

// **This is some bold text!**

// This is normal text
// `;

// export default function NoteDetailScreen() {
// 	return (
// 		<SafeAreaView>
// 			<Header label={'설교 노트'} />
// 			<VStack>
// 				<Markdown>{copy}</Markdown>
// 			</VStack>
// 		</SafeAreaView>
// 	);
// }

import { VStack } from '#/components/ui/vstack';
import {
	SafeAreaView,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { router, useLocalSearchParams } from 'expo-router';
import {
	ActivityIndicator,
	Alert,
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
	Delete,
	Edit,
	Megaphone,
	Plus,
	Trash,
} from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import { useEffect, useState } from 'react';
import { useToastStore } from '@/store/toast';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { Note } from '@/api/notes/types';
import { useWorshipStore } from '@/store/worship';
import type { ClientWorshipType } from '@/api/worship-types/types';
import {
	useNote,
	useUpdateNote,
	useDeleteNote,
} from '@/features/notes/hooks/useNote';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Keyboard } from 'react-native';
import Animated, {
	useSharedValue,
	withTiming,
	useAnimatedStyle,
	interpolate,
	Easing,
} from 'react-native-reanimated';
import { cn } from '@/shared/utils/cn';
import { KeyboardToolbar } from '@/shared/components/KeyboardToolbar';

export default function NoteScreen() {
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();

	const [isEditing, setIsEditing] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [selectedWorshipType, setSelectedWorshipType] =
		useState<ClientWorshipType | null>(null);

	// 펼쳐짐/접힘 애니메이션
	const [isFolded, setIsFolded] = useState(false);

	const foldAnimation = useSharedValue(1); // 1: 펼쳐짐, 0: 접힘
	const rotateAnimation = useSharedValue(0); // 0: 아래 화살표, 1: 위 화살표

	const toggleFold = (_isFolded?: boolean) => {
		if (_isFolded !== undefined) {
			setIsFolded(_isFolded);
			foldAnimation.value = withTiming(!_isFolded ? 1 : 0, {
				duration: 300,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			});
			rotateAnimation.value = withTiming(!_isFolded ? 0 : 1, {
				duration: 300,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			});
		} else {
			setIsFolded((prev) => !prev);
			foldAnimation.value = withTiming(isFolded ? 1 : 0, {
				duration: 300,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			});
			rotateAnimation.value = withTiming(isFolded ? 0 : 1, {
				duration: 300,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			});
		}
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

	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();

	const { showSuccess } = useToastStore();

	// Get worship types from global store
	const { worshipTypes } = useWorshipStore();

	// Use custom hooks for API operations
	const { note, isLoading: isLoadingNote } = useNote(id);
	const { updateNote, isLoading: isUpdating } = useUpdateNote(id, {
		onSuccess: () => {
			setIsEditing(false);
			showSuccess('노트가 수정되었어요');
		},
		onError: () => {
			showSuccess('노트 수정에 실패했어요. 다시 시도해주세요');
		},
	});

	// Local state for editing
	const [editableNote, setEditableNote] = useState<Partial<Note>>({});

	// Initialize editable note and date when note data is loaded
	useEffect(() => {
		if (note) {
			setEditableNote(note);
			if (note.date) {
				setSelectedDate(note.date.toDate());
			}
			if (note.worshipType) {
				// Find the matching worship type from the global store
				const matchingType = worshipTypes.find(
					(type) => type.name === note.worshipType.name,
				);
				if (matchingType) {
					setSelectedWorshipType(matchingType);
				}
			}
		}
	}, [note, worshipTypes]);

	const { deleteNote, isLoading: isDeleting } = useDeleteNote(id, {
		onSuccess: () => {
			showSuccess('노트가 삭제되었어요');
			router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/note');
		},
		onError: () => {
			showSuccess('노트 삭제에 실패했어요. 다시 시도해주세요');
		},
	});

	const handleDeleteNote = () => {
		Alert.alert(
			'노트 삭제',
			'정말 이 노트를 삭제할까요?',
			[
				{
					text: '취소',
					style: 'cancel',
				},
				{
					text: '삭제',
					style: 'destructive',
					onPress: () => deleteNote(),
				},
			],
			{ cancelable: true },
		);
	};

	const handleEditButton = () => {
		toggleFold(false);
		setIsEditing(true);
	};

	const handleUpdateNoteSubmit = () => {
		if (!editableNote.title) {
			showSuccess('설교 제목을 입력해주세요.');
			return;
		}

		updateNote({
			title: editableNote.title || '',
			date: selectedDate,
			content: editableNote.content || '',
			sermon: editableNote.sermon || '',
			preacher: editableNote.preacher || '',
			worshipType: {
				name: selectedWorshipType?.name || '',
				id: selectedWorshipType?.id || '',
			},
		});
	};

	const isLoading = isLoadingNote || isUpdating || isDeleting;

	if (isLoadingNote || !note) {
		return <ActivityIndicator />;
	}

	const handlePressDate = () => {
		handleOpen();
		Keyboard.dismiss();
	};

	return (
		<>
			<SafeAreaView className="h-full">
				<VStack space="xl" className="h-full">
					<Header className="justify-between pr-4">
						{isEditing ? (
							<Button variant="icon" onPress={handleUpdateNoteSubmit}>
								<ButtonIcon as={Check} />
							</Button>
						) : (
							<HStack space="xs">
								<Button variant="icon" onPress={handleEditButton}>
									<ButtonIcon as={Edit} />
								</Button>
								<Button variant="icon" onPress={() => handleDeleteNote()}>
									<ButtonIcon as={Trash} className="stroke-red-600" />
								</Button>
							</HStack>
						)}
					</Header>
					<KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
						<VStack space="2xl" className="px-6 flex-1">
							<VStack space="md" className="w-full">
								{isEditing ? (
									<TextInput
										placeholder="설교 제목"
										className="text-3xl font-pretendard-bold text-typography-700"
										value={editableNote.title}
										onChangeText={(title) =>
											setEditableNote((prev: Partial<Note>) => ({
												...prev,
												title,
											}))
										}
									/>
								) : (
									<Text className="text-3xl font-pretendard-bold text-typography-900">
										{note.title}
									</Text>
								)}
								<HStack className="items-center justify-between">
									<Text size="lg" className="text-typography-500">
										{selectedDate.toLocaleDateString('ko-KR', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											weekday: 'long',
										})}
									</Text>
									{isEditing && (
										<Button size="sm" variant="icon" onPress={handlePressDate}>
											<ButtonIcon as={CalendarCog} />
										</Button>
									)}
								</HStack>
							</VStack>
							<VStack className="gap-10">
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
										{isEditing ? (
											<TextInput
												placeholder="ex. 창세기 1장 1절"
												className="w-full text-xl ml-6 font-pretendard-Regular"
												value={editableNote.sermon}
												onChangeText={(sermon) =>
													setEditableNote((prev) => ({
														...prev,
														sermon,
													}))
												}
											/>
										) : (
											<Text
												size="xl"
												className={cn(
													'ml-6',
													!note.sermon && 'text-typography-500',
												)}
											>
												{note.sermon || '비어 있음'}
											</Text>
										)}
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
											{isEditing ? (
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
											) : (
												<HStack space="sm" className="ml-4 py-1">
													<Text
														size="md"
														className="px-3 py-1 rounded-full bg-primary-100 border border-primary-200 text-primary-700"
													>
														{selectedWorshipType?.name || '예배 종류 없음'}
													</Text>
												</HStack>
											)}
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
											{isEditing ? (
												<TextInput
													placeholder="비어 있음"
													className="w-full text-xl ml-6 font-pretendard-Regular"
													value={editableNote.preacher}
													onChangeText={(preacher) =>
														setEditableNote((prev) => ({
															...prev,
															preacher,
														}))
													}
												/>
											) : (
												<Text
													size="xl"
													className={cn(
														'ml-6',
														!note.preacher && 'text-typography-500',
													)}
												>
													{note.preacher || '비어 있음'}
												</Text>
											)}
										</VStack>
									</Animated.View>
								</VStack>
								{isEditing ? (
									<TextInput
										placeholder="설교 노트를 적어보세요..."
										className="text-xl flex-1 h-full pb-6 min-h-80 font-pretendard-Regular"
										multiline={true}
										textAlignVertical="top"
										scrollEnabled={false}
										value={editableNote.content}
										onChangeText={(content) =>
											setEditableNote((prev: Partial<Note>) => ({
												...prev,
												content,
											}))
										}
									/>
								) : (
									<Text className="text-xl flex-1 pb-6">{note.content}</Text>
								)}
							</VStack>
						</VStack>
					</KeyboardAwareScrollView>
					{isEditing && (
						<Button
							size="lg"
							className="mx-6 mb-6"
							onPress={handleUpdateNoteSubmit}
							rounded
							disabled={isLoading}
						>
							<ButtonText>노트 수정하기</ButtonText>
						</Button>
					)}
				</VStack>
				{/* Bottom Sheet for Date Picker */}
				<BottomSheetContainer snapPoints={['50%']}>
					<View
						className="items-center justify-center pt-5 pb-10"
						style={{ marginBottom: insets.bottom }}
					>
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
			</SafeAreaView>
			<KeyboardToolbar />
		</>
	);
}
