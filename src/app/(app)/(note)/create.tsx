import { VStack } from '#/components/ui/vstack';
import {
	SafeAreaView,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { router } from 'expo-router';
import {
	ActivityIndicator,
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
	Megaphone,
} from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import { useState, useEffect } from 'react';
import { createUserNote } from '@/api/notes';
import { useToastStore } from '@/store/toast';
import { Button, ButtonText } from '#/components/ui/button';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Timestamp } from 'firebase/firestore';
import { fetchUserWorshipTypes } from '@/api/worship-types';
import { WorshipTypeSelector } from '@/components/worship/WorshipTypeSelector';

export default function CreateScreen() {
	const insets = useSafeAreaInsets();

	const [title, setTitle] = useState('');
	const [scripture, setScripture] = useState('');
	const [preacher, setPreacher] = useState('');
	const [content, setContent] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date());

	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet();

	const [worshipTypes, setWorshipTypes] = useState<string[]>([]);
	const [selectedWorshipType, setSelectedWorshipType] = useState('');
	const [isLoadingWorshipTypes, setIsLoadingWorshipTypes] = useState(true);

	const { showSuccess } = useToastStore();

	useEffect(() => {
		const fetchWorshipTypes = async () => {
			try {
				setIsLoadingWorshipTypes(true);
				const types = await fetchUserWorshipTypes();
				setWorshipTypes(types.map((type) => type.name));
				setSelectedWorshipType(types[0].name);
			} catch (error) {
				console.error('Failed to fetch worship types:', error);
			} finally {
				setIsLoadingWorshipTypes(false);
			}
		};

		fetchWorshipTypes();
	}, []);

	const handleCreateNote = async () => {
		if (!title) {
			showSuccess('설교 제목을 입력해주세요.', '알림');
			return;
		}

		try {
			setIsLoading(true);

			const noteData = {
				title,
				date: Timestamp.fromDate(selectedDate),
				content: content || '',
				sermon: scripture || '',
				preacher: preacher || '',
				worshipType: selectedWorshipType,
			};

			const noteId = await createUserNote(noteData);

			showSuccess('노트가 생성되었어요.', '성공');

			router.replace(`/(app)/(note)/${noteId}`);
		} catch (error) {
			console.error('Failed to create note:', error);
			showSuccess('노트 생성에 실패했어요. 다시 시도해주세요.', '오류');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView className="h-full">
			<VStack space="xl" className="h-full">
				<Header
					label="설교 노트 쓰기"
					onPressBackButton={() => router.back()}
				/>
				<VStack space="2xl" className="px-6 flex-1">
					<TextInput
						placeholder="설교 제목"
						className="text-3xl font-pretendard-bold"
						value={title}
						onChangeText={setTitle}
					/>

					<VStack space="lg">
						<HStack space="sm" className="items-center w-full">
							<HStack space="sm" className="w-1/4 items-center">
								<Icon as={Calendar} size="lg" className="text-typography-600" />
								<Text size="lg" className="text-typography-600">
									날짜
								</Text>
							</HStack>
							<TouchableOpacity
								className="w-full flex-row items-center"
								onPress={() => handleOpen()}
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
								<Icon as={BookText} size="lg" className="text-typography-600" />
								<Text size="lg" className="text-typography-600">
									설교 본문
								</Text>
							</HStack>
							<TextInput
								placeholder="ex. 창세기 1장 1절"
								className="w-full text-[16px]"
								value={scripture}
								onChangeText={setScripture}
							/>
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
							{isLoadingWorshipTypes ? (
								<ActivityIndicator size="small" />
							) : (
								<WorshipTypeSelector />
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
							<TextInput
								placeholder="비어 있음"
								className="w-full text-[16px]"
								value={preacher}
								onChangeText={setPreacher}
							/>
						</HStack>
					</VStack>
					<TextInput
						placeholder="설교 노트를 적어보세요 ..."
						className="text-xl flex-1"
						multiline={true}
						textAlignVertical="top"
						value={content}
						onChangeText={setContent}
					/>
				</VStack>

				<Button
					size="lg"
					className="mx-6 mb-6 rounded-full"
					onPress={handleCreateNote}
					disabled={isLoading}
				>
					<ButtonText>노트 저장하기</ButtonText>
				</Button>
			</VStack>

			{/* Bottom Sheet for Date Picker */}
			<BottomSheetContainer>
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
		</SafeAreaView>
	);
}
