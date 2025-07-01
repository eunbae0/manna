import type { ClientWorshipType } from '@/api/worship-types/types';
import { storage } from '../../../storage/index';
import type { Note, NoteInput, SyncMetadata, UTCString } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useSyncStore } from '../store/sync';

const getUserKeyPrefix = (userId: string) => `user_${userId}_`;

export class NoteStorageService {
	private static instance: NoteStorageService;
	private userId: string | null = null;

	private constructor() {}

	public static getInstance(userId: string): NoteStorageService {
		// 기존 인스턴스가 있고 userId가 일치하면 그대로 반환
		if (
			NoteStorageService.instance &&
			NoteStorageService.instance.userId === userId
		) {
			return NoteStorageService.instance;
		}

		// userId가 다르거나 인스턴스가 없으면 새 인스턴스 생성
		NoteStorageService.instance = new NoteStorageService();
		NoteStorageService.instance.setUserId(userId);
		return NoteStorageService.instance;
	}

	// 사용자 설정 (로그인 시 호출)
	public setUserId(userId: string): void {
		this.userId = userId;
	}

	// 사용자 정보 초기화 (로그아웃 시 호출)
	public clearUserId(): void {
		this.userId = null;
	}

	// 사용자별 노트 키 생성
	private getNotesKey(): string {
		if (!this.userId) {
			throw new Error(
				'사용자 ID가 설정되지 않았습니다. setUserId를 먼저 호출하세요.',
			);
		}
		return `${getUserKeyPrefix(this.userId)}notes`;
	}

	// 사용자별 동기화 메타데이터 키 생성
	private getNotesSyncMetaKey(): string {
		if (!this.userId) {
			throw new Error(
				'사용자 ID가 설정되지 않았습니다. setUserId를 먼저 호출하세요.',
			);
		}
		return `${getUserKeyPrefix(this.userId)}notes_sync_meta`;
	}

	// 모든 노트 가져오기
	public getAllNotes(): Note[] {
		const notesJson = storage.getString(this.getNotesKey());
		if (!notesJson) return [];

		const notes: Record<string, Note> = JSON.parse(notesJson);
		return Object.values(notes).filter((note) => !note.metadata?.isDeleted);
	}

	public getNotesByWorshipType(worshipType: ClientWorshipType | null): Note[] {
		const notes = this.getAllNotes();
		return worshipType
			? notes.filter((note) => note.worshipType.id === worshipType.id)
			: notes;
	}

	public getNote(id: string): Note | undefined {
		const notesJson = storage.getString(this.getNotesKey());
		const notes: Record<string, Note> = notesJson ? JSON.parse(notesJson) : {};
		return notes[id];
	}

	// 노트 저장 (생성 또는 업데이트)
	public saveNote(note: NoteInput): Note {
		const notesJson = storage.getString(this.getNotesKey());
		const notes: Record<string, Note> = notesJson ? JSON.parse(notesJson) : {};

		const now = new Date().toUTCString();
		let savedNote: Note;
		const existedNote = note.id ? notes[note.id] : undefined;

		if (existedNote) {
			// 기존 노트 업데이트
			savedNote = {
				...existedNote,
				...note,
				metadata: {
					...existedNote.metadata,
					updatedAt: now,
					syncedAt: undefined, // 동기화 필요 표시
				},
			};
		} else {
			// 새 노트 생성
			const id = note.id || `local_${uuidv4()}`; // 서버의 note인 경우 id 그대로 사용
			savedNote = {
				id,
				title: note.title || '',
				content: note.content || '',
				date: note.date || new Date().toUTCString(),
				sermon: note.sermon || '',
				preacher: note.preacher || '',
				worshipType: note.worshipType,
				metadata: {
					createdAt: now,
					updatedAt: now,
					syncedAt: note.metadata?.syncedAt || undefined,
					isDeleted: false,
				},
			};
		}

		notes[savedNote.id] = savedNote;
		storage.set(this.getNotesKey(), JSON.stringify(notes));

		// 동기화 메타데이터 업데이트
		if (!note.metadata?.syncedAt) this.markForSync(savedNote.id);

		return savedNote;
	}

	// 노트 삭제 (소프트 삭제)
	public deleteNote(id: string, hardDelete?: boolean): void {
		const notesJson = storage.getString(this.getNotesKey());
		if (!notesJson) return;

		const notes: Record<string, Note> = JSON.parse(notesJson);
		if (!notes[id]) return;

		const isLocalNote = id.startsWith('local_');

		if (hardDelete || isLocalNote) {
			delete notes[id];
			storage.set(this.getNotesKey(), JSON.stringify(notes));
			isLocalNote && this.removePendingSyncItem(id);
			return;
		}

		notes[id] = {
			...notes[id],
			metadata: {
				...notes[id].metadata,
				isDeleted: true,
				updatedAt: new Date().toUTCString(),
				syncedAt: undefined,
			},
		};

		storage.set(this.getNotesKey(), JSON.stringify(notes));
		this.markForSync(id);
	}

	// 동기화 필요한 항목 표시
	public markForSync(id: string): void {
		const metaJson = storage.getString(this.getNotesSyncMetaKey());
		const meta: SyncMetadata = metaJson
			? JSON.parse(metaJson)
			: { lastSyncTime: '', pendingChanges: [] };

		if (!meta.pendingChanges.includes(id)) {
			meta.pendingChanges.push(id);
			storage.set(this.getNotesSyncMetaKey(), JSON.stringify(meta));

			if (this.userId) {
				const { increasePendingChangesCount } = useSyncStore.getState(); // MARK: Why it work?
				increasePendingChangesCount();
			}
		}
	}

	// 동기화 완료 표시
	public markAsSynced(id: string): void {
		const notesJson = storage.getString(this.getNotesKey());
		if (!notesJson) return;

		const notes: Record<string, Note> = JSON.parse(notesJson);
		if (!notes[id]) return;

		notes[id] = {
			...notes[id],
			metadata: {
				...notes[id].metadata,
				syncedAt: new Date().toUTCString(),
			},
		};

		storage.set(this.getNotesKey(), JSON.stringify(notes));

		// 동기화 메타데이터에서 제거
		const metaJson = storage.getString(this.getNotesSyncMetaKey());
		if (metaJson) {
			const meta: SyncMetadata = JSON.parse(metaJson);
			meta.pendingChanges = meta.pendingChanges.filter((item) => item !== id);
			meta.lastSyncTime = new Date().toUTCString();
			storage.set(this.getNotesSyncMetaKey(), JSON.stringify(meta));
		}
	}

	public removePendingSyncItem(id: string): void {
		const metaJson = storage.getString(this.getNotesSyncMetaKey());
		if (!metaJson) return;

		const meta: SyncMetadata = JSON.parse(metaJson);
		meta.pendingChanges = meta.pendingChanges.filter((item) => item !== id);
		storage.set(this.getNotesSyncMetaKey(), JSON.stringify(meta));
		if (this.userId) {
			const { decreasePendingChangesCount } = useSyncStore.getState(); // MARK: Why it work?
			decreasePendingChangesCount();
		}
	}

	// 동기화 필요한 항목 가져오기
	public getPendingSyncItems(): Note[] {
		const metaJson = storage.getString(this.getNotesSyncMetaKey());
		if (!metaJson) return [];

		const meta: SyncMetadata = JSON.parse(metaJson);
		const notesJson = storage.getString(this.getNotesKey());
		if (!notesJson) return [];

		const notes: Record<string, Note> = JSON.parse(notesJson);

		return meta.pendingChanges.filter((id) => notes[id]).map((id) => notes[id]);
	}

	// 마지막 동기화 시간 가져오기
	public getLastSyncTime(): UTCString {
		const metaJson = storage.getString(this.getNotesSyncMetaKey());
		if (!metaJson) return new Date('1970-01-01T00:00:00.000Z').toUTCString();

		const meta: SyncMetadata = JSON.parse(metaJson);
		return (
			meta.lastSyncTime || new Date('1970-01-01T00:00:00.000Z').toUTCString()
		);
	}

	// 마지막 동기화 시간 업데이트
	public updateLastSyncTime(timestamp: UTCString): void {
		const metaJson = storage.getString(this.getNotesSyncMetaKey());
		let meta: SyncMetadata = metaJson
			? JSON.parse(metaJson)
			: { lastSyncTime: '', pendingChanges: [] };

		meta = {
			...meta,
			lastSyncTime: timestamp,
		};

		storage.set(this.getNotesSyncMetaKey(), JSON.stringify(meta));
	}
}
