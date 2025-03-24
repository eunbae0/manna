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
	Calendar,
	Check,
	Edit,
	Megaphone,
} from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import { useEffect, useState } from 'react';
import { useToastStore } from '@/store/toast';
import { Button, ButtonText } from '#/components/ui/button';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { Note } from '@/api/notes/types';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import { useNote, useUpdateNote } from '@/features/notes/hooks/useNote';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Keyboard } from 'react-native';

export default function NoteScreen() {
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();

	const [isEditing, setIsEditing] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date());

	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();

	const serviceTypes = ['주일예배', '수요예배', '금요철야', '새벽기도회'];
	const [selectedServiceType, setSelectedServiceType] = useState(
		serviceTypes[0],
	);

	const { showSuccess } = useToastStore();

	// Use custom hooks for API operations
	const { note, isLoading: isLoadingNote } = useNote(id);
	const { updateNote, isLoading: isUpdating } = useUpdateNote(id, {
		onSuccess: () => {
			setIsEditing(false);
			showSuccess('노트가 수정되었어요.', '성공');
		},
		onError: () => {
			showSuccess('노트 수정에 실패했어요. 다시 시도해주세요.', '오류');
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
				setSelectedServiceType(note.worshipType);
			}
		}
	}, [note]);

	const handleUpdateNoteSubmit = () => {
		if (!editableNote.title) {
			showSuccess('설교 제목을 입력해주세요.', '알림');
			return;
		}

		updateNote({
			title: editableNote.title || '',
			date: selectedDate,
			content: editableNote.content || '',
			sermon: editableNote.sermon || '',
			preacher: editableNote.preacher || '',
			worshipType: selectedServiceType,
		});
	};

	const isLoading = isLoadingNote || isUpdating;

	if (isLoadingNote || !note) {
		return <ActivityIndicator />;
	}

	const handlePressDate = () => {
		handleOpen();
		Keyboard.dismiss();
	};

	return (
		<SafeAreaView className="h-full">
			<VStack space="xl" className="h-full">
				<Header
					label="설교 노트"
					onPressBackButton={() => router.back()}
					className="justify-between pr-6"
				>
					<Pressable
						onPress={() =>
							isEditing ? handleUpdateNoteSubmit() : setIsEditing(true)
						}
					>
						{isEditing ? (
							<Icon as={Check} size="lg" className="text-typography-900" />
						) : (
							<Icon as={Edit} size="lg" className="text-typography-900" />
						)}
					</Pressable>
				</Header>
				<KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
					<VStack space="2xl" className="px-6 flex-1">
						{isEditing ? (
							<TextInput
								placeholder="설교 제목"
								className="text-3xl font-pretendard-bold"
								value={editableNote.title}
								onChangeText={(title) =>
									setEditableNote((prev: Partial<Note>) => ({
										...prev,
										title,
									}))
								}
							/>
						) : (
							<Text className="text-3xl font-pretendard-bold">
								{note.title}
							</Text>
						)}
						<VStack space="lg">
							<HStack space="sm" className="items-center w-full">
								<HStack space="sm" className="w-1/4 items-center">
									<Icon
										as={Calendar}
										size="lg"
										className="text-typography-600"
									/>
									<Text size="lg" className="text-typography-600">
										날짜
									</Text>
								</HStack>
								<TouchableOpacity
									className="w-full flex-row items-center"
									onPress={handlePressDate}
								>
									<Text size="lg" className="text-[16px] py-2 flex-1">
										{selectedDate.toLocaleDateString('ko-KR', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											weekday: 'long',
										})}
									</Text>
								</TouchableOpacity>
							</HStack>
							<HStack space="sm" className="items-center w-full">
								<HStack space="sm" className="w-1/4 items-center">
									<Icon
										as={BookText}
										size="lg"
										className="text-typography-600"
									/>
									<Text size="lg" className="text-typography-600">
										설교 본문
									</Text>
								</HStack>
								{isEditing ? (
									<TextInput
										placeholder="ex. 창세기 1장 1절"
										className="w-full text-[16px]"
										value={editableNote.sermon}
										onChangeText={(sermon) =>
											setEditableNote((prev) => ({
												...prev,
												sermon,
											}))
										}
									/>
								) : (
									<Text className="w-full text-[16px]">{note.sermon}</Text>
								)}
							</HStack>
							<HStack space="sm" className="items-center w-full">
								<HStack space="sm" className="w-1/4 items-center">
									<Icon
										as={AlignJustify}
										size="lg"
										className="text-typography-600"
									/>
									<Text size="lg" className="w-full text-typography-600">
										예배 종류
									</Text>
								</HStack>
								{isEditing ? (
									<ScrollView
										horizontal
										showsHorizontalScrollIndicator={false}
										contentContainerStyle={{ paddingRight: 20 }}
										className="flex-grow"
									>
										<HStack space="sm" className="py-1">
											{serviceTypes.map((type) => (
												<TouchableOpacity
													key={type}
													onPress={() => setSelectedServiceType(type)}
													className="mr-1"
												>
													<Text
														size="md"
														className={`px-2 py-1 rounded-full ${
															selectedServiceType === type
																? 'bg-primary-100 text-primary-700'
																: 'bg-gray-100 text-typography-700'
														}`}
													>
														{type}
													</Text>
												</TouchableOpacity>
											))}
										</HStack>
									</ScrollView>
								) : (
									<Text
										size="md"
										className="px-2 py-1 rounded-full bg-primary-100 text-primary-700"
									>
										{selectedServiceType}
									</Text>
								)}
							</HStack>
							<HStack space="sm" className="items-center w-full">
								<HStack space="sm" className="w-1/4 items-center">
									<Icon
										as={Megaphone}
										size="lg"
										className="text-typography-600"
									/>
									<Text size="lg" className="text-typography-600">
										설교자
									</Text>
								</HStack>
								{isEditing ? (
									<TextInput
										placeholder="비어 있음"
										className="w-full text-[16px]"
										value={editableNote.preacher}
										onChangeText={(preacher) =>
											setEditableNote((prev) => ({
												...prev,
												preacher,
											}))
										}
									/>
								) : (
									<Text className="w-full text-[16px]">{note.preacher}</Text>
								)}
							</HStack>
						</VStack>
						{isEditing ? (
							<TextInput
								placeholder="설교 노트를 적어보세요 ..."
								className="text-xl flex-1"
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
							<Text className="text-xl flex-1">{note.content}</Text>
						)}
					</VStack>
					{isEditing && (
						<Button
							size="lg"
							className="mx-6 mb-6 rounded-full"
							onPress={handleUpdateNoteSubmit}
							disabled={isLoading}
						>
							<ButtonText>노트 수정하기</ButtonText>
						</Button>
					)}
				</KeyboardAwareScrollView>
			</VStack>

			{/* Bottom Sheet for Date Picker */}
			<BottomSheetContainer>
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
	);
}
