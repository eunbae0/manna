import { useCallback, useEffect, useRef, useState } from 'react';
import type { ClientFellowshipParticipantV2 } from '@/features/fellowship/api/types';
import { useAnswerRecordingStore } from '@/store/fellowship/answer-recording';
import { useToastStore } from '@/store/toast';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Avatar } from '@/components/common/avatar';
import { Text } from '@/shared/components/text';
import { TextInput, Keyboard, ActivityIndicator, View } from 'react-native';
import { ButtonText, ButtonIcon } from '@/components/common/button';
import {
	Brain,
	Check,
	ChevronRight,
	Notebook,
	Pen,
	Trash,
} from 'lucide-react-native';
import { Button } from '@/components/common/button';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import {
	BottomSheetListHeader,
	BottomSheetListLayout,
} from '@/components/common/bottom-sheet';
import { cn } from '@/shared/utils/cn';
import { Icon } from '#/components/ui/icon';
import { Box } from '#/components/ui/box';
import { VolumeMeteringButton } from '../VolumeMeteringButton';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useAiSummary } from '@/features/fellowship/hooks/useAiSummary';
import {
	PopupMenu,
	PopupMenuItem,
	PopupMenuItemLabel,
} from '@/shared/components/popup-menu';
import { useAuthStore } from '@/store/auth';
import { NoteStorageService } from '@/features/note/storage';
import type { Note } from '@/features/note/types';
import { EmbedNoteSheet } from './EmbedNoteSheet';
import { FELLOWSHIP_AI_SUMMARY_PROMPT } from '../../constants/aiSummary';

export function AnswerField({
	member,
	answer,
	updateAnswer,
}: {
	member: ClientFellowshipParticipantV2;
	answer: string;
	updateAnswer: (memberId: string, content: string) => void;
}) {
	const { showSuccess, showInfo } = useToastStore();
	const { user } = useAuthStore();
	const isMe = user?.id === member.id;

	const [localAnswer, setLocalAnswer] = useState(answer);
	const lastUpdateRef = useRef(answer);

	// 디바운스 타이머 참조
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	// 텍스트 변경 핸들러
	const handleTextChange = (text: string) => {
		setLocalAnswer(text);

		// 이전 타이머가 있으면 취소
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		// 새 타이머 설정
		timerRef.current = setTimeout(() => {
			if (lastUpdateRef.current !== text) {
				updateAnswer(member.id, text);
				lastUpdateRef.current = text;
			}
			timerRef.current = null;
		}, 500);
	};

	// 외부에서 answer가 변경되었을 때 로컬 상태 동기화
	useEffect(() => {
		if (answer !== lastUpdateRef.current) {
			setLocalAnswer(answer);
			lastUpdateRef.current = answer;
		}
	}, [answer]);

	// 컴포넌트 언마운트 시 타이머 정리
	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);

	// 스토어 접근
	const {
		id: recordingId,
		isRecording,
		liveTranscript,
		startListening,
		stopListening,
		reset,
		onUnMount,
	} = useAnswerRecordingStore();

	const {
		data: summaries,
		mutate: mutateAiSummary,
		isPending: isPendingAiSummary,
	} = useAiSummary(FELLOWSHIP_AI_SUMMARY_PROMPT);
	const [selectedSummaryIndex, setSelectedSummaryIndex] = useState<number>(-1);

	const handleStartAiSummarize = async () => {
		Keyboard.dismiss();

		if (!localAnswer) {
			showInfo('나눔 답변이 입력되지 않았어요.');
			return;
		}
		if (isRecordingCurrentMember) {
			showInfo('현재 녹음 중이에요. 녹음을 종료한 다음 시도해주세요.');
			return;
		}
		mutateAiSummary(localAnswer, {
			onSuccess: () => {
				handleOpenSummarizeSheet();
			},
			onError: () => {
				showInfo('요약 생성 중 오류가 발생했어요. 다시 시도해주세요.');
			},
		});
	};

	// 바텀시트 관련 함수
	const { BottomSheetContainer, handleOpen, handleClose } = useBottomSheet({
		onClose: () => {
			setSelectedSummaryIndex(-1);
		},
	});

	const handleOpenSummarizeSheet = () => {
		handleOpen();
		setSelectedSummaryIndex(-1);
	};

	const handleCloseSummarizeSheet = () => {
		handleClose();
		setSelectedSummaryIndex(-1);
	};

	// 선택한 요약 적용 및 트랜스크립트 초기화
	const handleApplyRecording = () => {
		if (!summaries) return;
		const answer = summaries[selectedSummaryIndex] || localAnswer;
		// 답변 업데이트
		if (summaries.length > 0 && selectedSummaryIndex >= 0) {
			updateAnswer(member.id, answer);
			showSuccess('AI 요약이 적용되었어요');
		} else {
			updateAnswer(member.id, answer);
			showSuccess('녹음이 적용되었어요');
		}

		handleCloseSummarizeSheet();
	};

	const isRecordingCurrentMember = isRecording && recordingId === member.id;

	const showRecordingButton = !localAnswer || isRecordingCurrentMember;

	useSpeechRecognitionEvent('result', (event) => {
		if (!recordingId) return;
		if (!isRecordingCurrentMember) return;

		if (event.results && event.results.length > 0) {
			const transcript = event.results[0]?.transcript || '';
			handleTextChange(transcript);
		}
	});

	useSpeechRecognitionEvent('error', (event) => {
		if (!isRecordingCurrentMember) return;
		if (event.error === 'no-speech') return;
		showInfo('음성 인식 중 오류가 발생했어요');
		reset();
	});

	// 컴포넌트 언마운트 시 녹음 중지
	useEffect(() => {
		if (!isRecordingCurrentMember) return;
		return () => {
			onUnMount();
		};
	}, [isRecordingCurrentMember, onUnMount]);

	const [notes, setNotes] = useState<Note[]>([]);
	const ref = useRef<{ handleOpenEmbedNoteSheet: () => void }>(null);

	const handlePressGetFromNote = () => {
		if (!user?.id) return;
		const noteStorage = NoteStorageService.getInstance(user.id);
		const notes = noteStorage.getAllNotes();
		setNotes(
			notes.sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
			),
		);
		ref.current?.handleOpenEmbedNoteSheet();
	};

	return (
		<>
			<VStack space="sm">
				<HStack className="items-center gap-[6px]">
					<Avatar size="2xs" photoUrl={member.photoUrl || undefined} />
					<Text size="lg" weight="semi-bold" className="text-typography-600">
						{member.displayName}
					</Text>
				</HStack>
				<VStack space="xs">
					<VStack
						space="4xl"
						className={cn(
							'px-4 pt-2 pb-4 rounded-2xl items-center',
							isRecordingCurrentMember
								? 'bg-primary-200/20'
								: 'bg-background-100/80',
						)}
					>
						<TextInput
							value={localAnswer}
							placeholder={
								isRecordingCurrentMember
									? '녹음 대기 중...'
									: '답변을 입력해주세요'
							}
							onChangeText={handleTextChange}
							multiline
							scrollEnabled={false}
							textAlignVertical="top"
							className={cn('w-full text-lg text-typography-800')}
						/>
						<HStack space="lg" className="w-full items-center justify-between">
							<HStack space="sm" className="items-center">
								<AnimatedPressable
									className="bg-background-200/70 rounded-xl px-3 py-2"
									onPress={handleStartAiSummarize}
									disabled={isPendingAiSummary}
								>
									<HStack space="xs" className="items-center">
										{isPendingAiSummary ? (
											<ActivityIndicator size="small" />
										) : (
											<Icon
												as={Brain}
												size="sm"
												className="text-typography-600"
											/>
										)}
										<Text
											size="md"
											weight="semi-bold"
											className="text-typography-600"
										>
											{isPendingAiSummary ? '요약 중...' : 'AI 요약'}
										</Text>
									</HStack>
								</AnimatedPressable>
								{isMe && (
									<PopupMenu
										placement="bottom right"
										hasBackdrop={false}
										trigger={({ ...triggerProps }) => {
											return (
												<AnimatedPressable
													className="bg-background-200/70 rounded-xl px-3 py-2"
													{...triggerProps}
												>
													<Icon
														as={Notebook}
														size="sm"
														className="text-typography-600"
													/>
												</AnimatedPressable>
											);
										}}
									>
										<PopupMenuItem
											closeOnSelect
											onPress={handlePressGetFromNote}
										>
											<Icon
												as={Pen}
												size="sm"
												className="mr-2 text-typography-700"
											/>
											<PopupMenuItemLabel size="md">
												설교 노트에서 불러오기
											</PopupMenuItemLabel>
										</PopupMenuItem>
									</PopupMenu>
								)}
							</HStack>

							{showRecordingButton && (
								<VolumeMeteringButton
									onPress={() => {
										if (isRecording) stopListening(member.id);
										else startListening(member.id);
									}}
									isRecording={isRecordingCurrentMember}
								/>
							)}
						</HStack>
					</VStack>

					{/* Real-time transcription display */}
					{isRecording && liveTranscript && (
						<VStack
							space="sm"
							className="mt-2 p-3 bg-typography-50/80 rounded-md"
						>
							{liveTranscript && liveTranscript.length > 0 ? (
								<Text size="md">{liveTranscript}</Text>
							) : (
								<VStack space="sm">
									<Text size="md" className="text-typography-500">
										녹음 대기 중...
									</Text>
									<Text size="md" className="text-typography-500">
										말을 하면 여기에 기록됩니다.
									</Text>
								</VStack>
							)}
						</VStack>
					)}
				</VStack>
			</VStack>
			<BottomSheetContainer>
				<BottomSheetListLayout>
					<BottomSheetListHeader
						label="AI 요약 결과"
						onPress={handleCloseSummarizeSheet}
					/>
					{summaries && summaries.length > 0 && (
						<VStack space="sm" className="pb-4">
							<VStack space="sm">
								{summaries.map((summary, index) => (
									<AnimatedPressable
										scale="sm"
										key={summary}
										className={cn(
											'p-3 border rounded-lg',
											selectedSummaryIndex === index
												? 'border-primary-500 bg-primary-50'
												: 'border-gray-200',
										)}
										onPress={() => setSelectedSummaryIndex(index)}
									>
										<HStack space="md" className="items-center">
											<Text
												weight="medium"
												size="lg"
												className={cn(
													selectedSummaryIndex === index
														? 'text-primary-800'
														: 'text-typography-600',
													'flex-1',
												)}
											>
												{summary}
											</Text>
											{selectedSummaryIndex === index ? (
												<Box className="w-6 h-6 border border-primary-500 rounded-xl bg-primary-500 items-center justify-center">
													<Icon
														as={Check}
														size="sm"
														className="text-primary-50"
													/>
												</Box>
											) : (
												<Box className="w-6 h-6 border border-primary-500 rounded-xl" />
											)}
										</HStack>
									</AnimatedPressable>
								))}
							</VStack>
						</VStack>
					)}

					<Button
						size="lg"
						rounded={false}
						disabled={selectedSummaryIndex === -1}
						onPress={handleApplyRecording}
						fullWidth
					>
						<ButtonText>녹음 적용하기</ButtonText>
						<ButtonIcon as={Check} />
					</Button>
				</BottomSheetListLayout>
			</BottomSheetContainer>
			<EmbedNoteSheet
				notes={notes}
				updateAnswer={(text: string) => updateAnswer(member.id, text)}
				ref={ref}
			/>
		</>
	);
}
