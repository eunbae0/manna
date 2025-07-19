import { type Ref, useCallback, useImperativeHandle, useState } from 'react';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Button, ButtonText, ButtonIcon } from '@/components/common/button';
import type { Note } from '@/features/note/types';
import { formatLocalDate } from '@/shared/utils/date';
import { Brain, Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import {
	View,
	FlatList,
	Keyboard,
	ActivityIndicator,
	type ViewProps,
} from 'react-native';
import { Text } from '@/shared/components/text';
import { Icon } from '#/components/ui/icon';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { router } from 'expo-router';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';
import { cn } from '@/shared/utils/cn';
import { useAiSummary } from '../../hooks/useAiSummary';
import { useToastStore } from '@/store/toast';
import { EMBED_NOTE_AI_SUMMARY_PROMPT } from '../../constants/aiSummary';

type Props = {
	notes: Note[] | null;
	updateAnswer: (text: string) => void;
	ref: Ref<{ handleOpenEmbedNoteSheet: () => void }>;
};

export function EmbedNoteSheet({ notes, updateAnswer, ref }: Props) {
	const [selectedNote, setSelectedNote] = useState<Note | null>(null);
	const [text, setText] = useState('');
	const { showInfo, showError, showSuccess } = useToastStore();

	const {
		BottomSheetContainer,
		handleOpen: handleOpenSheet,
		handleClose: handleCloseSheet,
	} = useBottomSheet({ onClose: () => resetState() });

	useImperativeHandle(ref, () => ({
		handleOpenEmbedNoteSheet: handleOpenSheet,
	}));

	const handlePressWriteNote = useCallback(() => {
		handleCloseSheet();
		router.dismissTo('/(app)/(tabs)/note');
	}, [handleCloseSheet]);

	const handlePressNoteItem = useCallback((item: Note) => {
		setSelectedNote(item);
		setText(item.content);
	}, []);

	const {
		data: summaries,
		mutate: mutateAiSummary,
		isPending: isPendingAiSummary,
		reset: resetAiSummary,
	} = useAiSummary(EMBED_NOTE_AI_SUMMARY_PROMPT);

	const [selectedSummaryIndex, setSelectedSummaryIndex] = useState<number>(-1);

	const handleStartAiSummarize = async () => {
		Keyboard.dismiss();

		if (!text) {
			showInfo('요약할 노트 내용이 없어요.');
			return;
		}
		mutateAiSummary(text, {
			onError: () => {
				showError('요약 생성 중 오류가 발생했어요. 다시 시도해주세요.');
			},
		});
	};

	const resetState = useCallback(() => {
		setSelectedSummaryIndex(-1);
		setText('');
		setSelectedNote(null);
		resetAiSummary();
	}, [resetAiSummary]);

	const handlePressAiSummaryItem = useCallback(
		(index: number) => {
			if (selectedSummaryIndex === index) {
				setSelectedSummaryIndex(-1);
				return;
			}
			setSelectedSummaryIndex(index);
		},
		[selectedSummaryIndex],
	);

	const handlePressApplyNote = useCallback(() => {
		if (summaries && selectedSummaryIndex !== -1) {
			updateAnswer(summaries[selectedSummaryIndex]);
			showSuccess('설교 노트가 적용되었어요.');
			handleCloseSheet();
			resetState();
			return;
		}
		if (!text) {
			showError('텍스트를 입력해주세요.');
			return;
		}
		updateAnswer(text);
		showSuccess('설교 노트가 적용되었어요.');
		handleCloseSheet();
		resetState();
	}, [
		text,
		summaries,
		selectedSummaryIndex,
		updateAnswer,
		showError,
		resetState,
		showSuccess,
		handleCloseSheet,
	]);

	return (
		<BottomSheetContainer>
			<View
				className={cn('px-4 pt-4', selectedNote ? 'pb-4' : 'max-h-[60vh] pb-8')}
			>
				{selectedNote ? (
					<VStack space="xl">
						<HStack space="lg" className="items-end justify-between">
							<VStack space="xs">
								<Text weight="bold" size="2xl" className="text-typography-800">
									{selectedNote.title}
								</Text>
								<Text size="md" className="text-typography-500">
									{formatLocalDate(new Date(selectedNote.date))} |{' '}
									{selectedNote.worshipType.name}
								</Text>
							</VStack>
							<AnimatedPressable
								className="bg-primary-200/50 rounded-xl px-4 py-2"
								onPress={handleStartAiSummarize}
								disabled={isPendingAiSummary}
							>
								<HStack space="xs" className="items-center">
									<Text
										size="md"
										weight="semi-bold"
										className="text-primary-600/70"
									>
										{isPendingAiSummary ? '요약 중...' : 'AI로 요약하기'}
									</Text>
									{isPendingAiSummary ? (
										<ActivityIndicator size="small" />
									) : (
										<Icon
											as={Brain}
											size="sm"
											className="text-primary-600/70"
										/>
									)}
								</HStack>
							</AnimatedPressable>
						</HStack>
						<View className="flex-1">
							<BottomSheetTextInput
								defaultValue={selectedNote.content}
								onChangeText={setText}
								multiline
								className={cn(TEXT_INPUT_STYLE, 'text-lg py-6 max-h-52')}
							/>
						</View>
						<VStack>
							{summaries?.map((summary, index) => (
								<AnimatedPressable
									key={summary}
									scale="sm"
									className={cn(
										'py-3 px-4 mb-3 border border-background-200/70 rounded-xl',
										selectedSummaryIndex === index
											? 'bg-primary-50/80 border-primary-500/60'
											: '',
									)}
									onPress={() => handlePressAiSummaryItem(index)}
								>
									<HStack space="lg" className="items-center justify-between">
										<VStack space="xs" className="flex-1">
											<Text
												weight="semi-bold"
												size="lg"
												className="text-typography-700"
											>
												{summary}
											</Text>
										</VStack>
										{selectedSummaryIndex === index ? (
											<HStack className="justify-center items-center w-6 h-6 bg-primary-500 rounded-md">
												<Icon as={Check} size="sm" color="white" />
											</HStack>
										) : (
											<HStack className="justify-center items-center w-6 h-6 border border-primary-500 rounded-md">
												<Icon as={Check} size="sm" color="white" />
											</HStack>
										)}
									</HStack>
								</AnimatedPressable>
							))}
						</VStack>
						<HStack space="sm">
							<Button
								size="lg"
								variant="outline"
								rounded={false}
								onPress={() => setSelectedNote(null)}
								className="flex-1"
							>
								<ButtonIcon as={ChevronLeft} />
								<ButtonText>뒤로가기</ButtonText>
							</Button>
							<Button
								size="lg"
								rounded={false}
								onPress={handlePressApplyNote}
								className="flex-1"
							>
								<ButtonText>
									{selectedSummaryIndex !== -1
										? 'AI 요약 적용하기'
										: '노트 내용 적용하기'}
								</ButtonText>
								<ButtonIcon as={Check} />
							</Button>
						</HStack>
					</VStack>
				) : (
					<View className={cn(notes && notes.length > 0 ? 'pb-10' : '')}>
						{notes && notes.length > 0 && (
							<Text size="2xl" weight="bold" className="pb-6">
								작성한 노트를 선택해주세요
							</Text>
						)}
						<FlatList
							data={notes}
							renderItem={({ item }) => (
								<AnimatedPressable
									scale="sm"
									key={item.id}
									className="py-3 px-4 mb-3 border border-background-200/70 rounded-xl"
									onPress={() => handlePressNoteItem(item)}
								>
									<HStack space="md" className="items-center justify-between">
										<VStack space="xs">
											<Text
												weight="semi-bold"
												size="xl"
												className="text-typography-700"
											>
												{item.title}
											</Text>
											<HStack space="xs">
												<Text size="md" className="text-typography-500">
													{formatLocalDate(new Date(item.date))}
												</Text>
												<Text size="md" className="text-typography-500">
													| {item.worshipType.name}
												</Text>
											</HStack>
										</VStack>
										<Icon
											as={ChevronRight}
											size="md"
											className="text-typography-400"
										/>
									</HStack>
								</AnimatedPressable>
							)}
							keyExtractor={(item) => item.id}
							ListEmptyComponent={
								<VStack className="px-1 gap-9">
									<VStack space="sm">
										<Text
											size="2xl"
											weight="bold"
											className="text-typography-700"
										>
											작성한 설교 노트가 없어요
										</Text>
										<Text
											size="lg"
											weight="medium"
											className="text-typography-600"
										>
											설교 노트를 작성하고 내용을 그룹원들과 공유해보세요.
										</Text>
									</VStack>
									<Button
										size="lg"
										rounded={false}
										onPress={handlePressWriteNote}
										fullWidth
									>
										<ButtonText>설교 노트 작성하기</ButtonText>
										<ButtonIcon as={ChevronRight} />
									</Button>
								</VStack>
							}
						/>
					</View>
				)}
			</View>
		</BottomSheetContainer>
	);
}
