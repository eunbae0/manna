import { create } from 'zustand';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import type { ClientFellowshipMember } from '@/features/fellowship/api/types';
import { useToastStore } from '../toast';
import { openAppSettings } from '@/shared/utils/app/open_app_settings';

type TranscriptItem = {
	member: ClientFellowshipMember;
	transcript: string;
};

interface AnswerRecordingState {
	isRecording: boolean;
	isRecordingMode: boolean;
	currentMember: ClientFellowshipMember | null;
	liveTranscript: TranscriptItem[];

	toggleRecordingMode: () => Promise<void>;
	startListening: (member: ClientFellowshipMember) => void;
	stopListening: () => void;
	updateTranscript: (
		member: ClientFellowshipMember,
		transcript: string,
	) => void;
	clearTranscriptForMember: (memberId: string) => void;
	setIsRecording: (isRecording: boolean) => void;
	setCurrentMember: (member: ClientFellowshipMember | null) => void;
	reset: () => void;
}

export const useAnswerRecordingStore = create<AnswerRecordingState>(
	(set, get) => ({
		isRecording: false,
		isRecordingMode: false,
		currentMember: null,
		liveTranscript: [],

		toggleRecordingMode: async () => {
			const { showInfo } = useToastStore.getState();
			const result =
				await ExpoSpeechRecognitionModule.requestPermissionsAsync();

			switch (result.status) {
				case 'granted':
					set((state) => ({ isRecordingMode: !state.isRecordingMode }));
					break;
				case 'denied':
					showInfo(
						'음성 인식 권한이 필요해요. 설정에서 [마이크]와 [음성 인식] 권한을 모두 허가해주세요',
					);
					setTimeout(() => {
						openAppSettings();
					}, 1300);
					break;
				case 'undetermined':
					showInfo('음성 인식 권한이 필요해요');
					break;
			}
		},

		startListening: (member) => {
			set({ currentMember: member });
			// 트랜스크립트 초기화 로직
			set((state) => ({
				liveTranscript:
					state.liveTranscript.findIndex(
						(item) => item.member.id === member.id,
					) === -1
						? [...state.liveTranscript, { member, transcript: '' }]
						: state.liveTranscript,
			}));

			ExpoSpeechRecognitionModule.start({
				lang: 'ko-KR',
				interimResults: true,
				continuous: true,
				volumeChangeEventOptions: {
					enabled: true,
					intervalMillis: 300,
				},
				contextualStrings: [
					'예수님',
					'하나님',
					'설교',
					'말씀',
					'예배',
					'교회',
					'계획',
					'찬양',
					'기도',
					'성경',
				],
				iosTaskHint: 'dictation',
			});
			console.log('녹음 시작');
		},

		stopListening: () => {
			ExpoSpeechRecognitionModule.stop();
			console.log('녹음 중지');
		},

		updateTranscript: (member, transcript) => {
			set((state) => ({
				liveTranscript: state.liveTranscript.map((item) =>
					item.member.id === member.id ? { ...item, transcript } : item,
				),
			}));
		},

		clearTranscriptForMember: (memberId) => {
			set((state) => ({
				liveTranscript: state.liveTranscript.filter(
					(item) => item.member.id !== memberId,
				),
			}));
		},

		setIsRecording: (isRecording) => set({ isRecording }),
		setCurrentMember: (member) => set({ currentMember: member }),

		reset: () => {
			set({
				isRecording: false,
				isRecordingMode: false,
				currentMember: null,
				liveTranscript: [],
			});
		},
	}),
);
