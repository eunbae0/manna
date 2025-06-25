import { create } from 'zustand';
import { NoteStorageService } from '@/features/note/storage';
import {
	createNote,
	deleteNote,
	getNotesUpdatedSince,
	updateNote,
} from '@/features/note/api';
import type { UTCString } from '../types';
// import NetInfo from '@react-native-community/netinfo';

interface SyncState {
	isSyncing: boolean;
	lastSyncTime: UTCString | null;
	pendingChangesCount: number;
	syncError: string | null;
	syncNotes: (id: string, onComplete?: () => void) => Promise<void>;
	loadSyncStatus: (id: string) => void;
	increasePendingChangesCount: () => void;
	decreasePendingChangesCount: () => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
	isSyncing: false,
	lastSyncTime: null,
	pendingChangesCount: 0,
	syncError: null,
	increasePendingChangesCount: () =>
		set((state) => ({ pendingChangesCount: state.pendingChangesCount + 1 })),
	decreasePendingChangesCount: () =>
		set((state) => ({ pendingChangesCount: state.pendingChangesCount - 1 })),
	loadSyncStatus: async (id) => {
		const noteStorage = NoteStorageService.getInstance(id);
		if (!noteStorage) return;

		const pendingItems = noteStorage.getPendingSyncItems();
		const lastSyncTime = noteStorage.getLastSyncTime();
		const serverNotes = await getNotesUpdatedSince(lastSyncTime, id);

		const pendingChangesCount = pendingItems.length + serverNotes.length;

		set({
			lastSyncTime,
			pendingChangesCount,
		});
	},

	syncNotes: async (userId, onComplete) => {
		const noteStorage = NoteStorageService.getInstance(userId);
		if (!noteStorage) {
			return;
		}

		// 네트워크 연결 확인
		// const netInfo = await NetInfo.fetch();
		// if (!netInfo.isConnected) {
		// 	set({ syncError: '인터넷 연결이 필요합니다.' });
		// 	return;
		// }

		set({ isSyncing: true, syncError: null });

		try {
			// 1. 서버에서 변경사항 가져오기
			const lastSyncTime = noteStorage.getLastSyncTime();
			const serverNotes = await getNotesUpdatedSince(lastSyncTime, userId);

			for (const serverNote of serverNotes) {
				// 로컬에 저장
				noteStorage.saveNote({
					...serverNote,
					metadata: {
						...serverNote.metadata,
						syncedAt: Date.now().toLocaleString(),
					},
				});
			}

			// 2. 동기화 필요한 항목 가져오기
			const pendingNotes = noteStorage.getPendingSyncItems();

			// 3. 서버로 변경사항 푸시
			for (const note of pendingNotes) {
				if (note.metadata.isDeleted) {
					// 서버에 이미 존재하는 항목만 삭제 요청
					if (!note.id.startsWith('local_')) {
						await deleteNote(note.id, userId);
					}

					noteStorage.deleteNote(note.id, true); // 서버 delete 후, local에서 hard delete
					noteStorage.markAsSynced(note.id);
				} else if (note.id.startsWith('local_')) {
					// 로컬에서 생성된 항목은 서버에 새로 생성
					const { id, ...noteData } = note;
					const serverNote = await createNote(noteData, userId);

					// 로컬 ID를 서버 ID로 교체
					noteStorage.saveNote({
						...note,
						id: serverNote.id,
						metadata: {
							...note.metadata,
							syncedAt: new Date().toUTCString(),
						},
					});

					noteStorage.deleteNote(note.id, true);

					// 새 ID로 동기화 완료 표시
					noteStorage.markAsSynced(note.id);
				} else {
					// 기존 항목 업데이트
					await updateNote(note, userId);
					noteStorage.markAsSynced(note.id);
				}
			}

			// 4. 동기화 상태 업데이트
			// 현재 시간을 새로운 동기화 시간으로 설정
			const nowTime = new Date().toUTCString();
			noteStorage.updateLastSyncTime(nowTime);

			const newPendingItems = noteStorage.getPendingSyncItems();

			set({
				lastSyncTime: nowTime, // 현재 시간을 마지막 동기화 시간으로 사용
				pendingChangesCount: newPendingItems.length,
				isSyncing: false,
			});

			// 동기화 완료 후 콜백 호출
			if (onComplete && typeof onComplete === 'function') {
				onComplete();
			}
		} catch (error) {
			console.error('노트 동기화 오류:', error);
			set({
				syncError: error instanceof Error ? error.message : '알 수 없는 오류',
				isSyncing: false,
			});
		}
	},
}));
