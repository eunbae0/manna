import { create } from 'zustand';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { useToastStore } from '../toast';
import { openAppSettings } from '@/shared/utils/app/open_app_settings';

interface AnswerRecordingState {
	id: string | null;
	isRecording: boolean;
	liveTranscript: string;

	startListening: (id: string) => Promise<void>;
	stopListening: (id: string) => void;
	updateTranscript: (transcript: string) => void;
	reset: () => void;
	onUnMount: () => void;
}

export const useAnswerRecordingStore = create<AnswerRecordingState>(
	(set, get) => ({
		isRecording: false,
		id: null,
		liveTranscript: '',

		startListening: async (id: string) => {
			const hasPermission = await getRecordingPermission();
			if (!hasPermission) return;

			if (id === get().id) return;

			set({ id, isRecording: true, liveTranscript: '' });

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

		stopListening: (id: string) => {
			if (get().id !== id) return;
			ExpoSpeechRecognitionModule.stop();
			set({ id: null, isRecording: false });
			console.log('녹음 중지');
		},

		updateTranscript: (transcript: string) => {
			set({
				liveTranscript: transcript,
			});
		},

		reset: () => {
			set({
				isRecording: false,
				id: null,
				liveTranscript: '',
			});
		},

		onUnMount: () => {
			ExpoSpeechRecognitionModule.stop();
			get().reset();
		},
	}),
);

async function getRecordingPermission() {
	const { showInfo } = useToastStore.getState();
	const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

	switch (result.status) {
		case 'granted':
			return true;
		case 'denied':
			showInfo(
				'음성 인식 권한이 필요해요. 설정에서 [마이크]와 [음성 인식] 권한을 모두 허가해주세요',
			);
			setTimeout(() => {
				openAppSettings();
			}, 1300);
			return false;
		case 'undetermined':
			showInfo('음성 인식 권한이 필요해요');
			return false;
		default:
			return false;
	}
}
