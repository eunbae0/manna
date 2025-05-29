import type { ClientGroupMember } from '@/api/prayer-request/types';
import type { DeepPartial } from '@/shared/utils/deepPartial';
import type { FieldValue, Timestamp } from '@react-native-firebase/firestore';

// 기본 타입 정의
export type categoryId = string;
export type contentId = string;
export type participantId = string;
export type answerContent = string;

export type FellowshipCategoryType =
	| 'iceBreaking'
	| 'sermonTopic'
	| 'prayerRequests'
	| 'custom';

// 참가자 타입
export interface ServerFellowshipParticipantV2 {
	id: string;
	displayName?: string;
}

export interface ClientFellowshipParticipantV2
	extends ServerFellowshipParticipantV2 {
	photoUrl?: string;
	isGuest: boolean;
}

// 답변 타입
export interface ServerFellowshipAnswerV2 {
	participantId: string;
	content: string;
}

export interface ClientFellowshipAnswerV2 {
	participant: ClientFellowshipParticipantV2;
	content: string;
}

// 콘텐츠 아이템 기본 타입
export interface FellowshipContentItemV2Base {
	id: string;
	title: string;
	order: number;
}

// 서버/클라이언트 콘텐츠 아이템 타입
export interface ServerFellowshipContentItemV2
	extends FellowshipContentItemV2Base {
	answers: Record<participantId, answerContent>;
}

export interface ClientFellowshipContentItemV2
	extends FellowshipContentItemV2Base {
	answers: ClientFellowshipAnswerV2[];
}

// 카테고리 기본 타입
export interface FellowshipCategoryV2Base {
	id: string;
	title: string;
	order: number;
	type: FellowshipCategoryType;
	isActive: boolean;
}

// 서버/클라이언트 카테고리 타입
export interface ServerFellowshipCategoryV2 extends FellowshipCategoryV2Base {
	items: Record<contentId, ServerFellowshipContentItemV2>;
}

export interface ClientFellowshipCategoryV2 extends FellowshipCategoryV2Base {
	items: Record<contentId, ClientFellowshipContentItemV2>;
}

export interface CompactClientFellowshipCategoryV2
	extends FellowshipCategoryV2Base {
	items: Record<contentId, FellowshipContentItemV2Base>;
}

// 기도 요청 필드 타입
export interface ServerFellowshipPrayerRequestFieldV2 {
	isActive: boolean;
	answers: Record<participantId, answerContent>;
}

export interface ClientFellowshipPrayerRequestFieldV2 {
	isActive: boolean;
	answers: ClientFellowshipAnswerV2[];
}

// 기본 Fellowship 타입
export interface BaseFellowshipV2 {
	identifiers: {
		id: string;
		groupId: string;
	};
	roles: {
		leaderId: string;
	};
	metadata: {
		schemaVersion: string;
		createdAt: Timestamp;
		updatedAt: Timestamp;
		// status: 'draft' | 'published' | 'archived';
	};
	options: {
		enableMemberReply: boolean;
	};
	extensions?: Record<string, unknown>;
}

// 서버/클라이언트 Fellowship 타입
export interface ServerFellowshipV2 extends BaseFellowshipV2 {
	info: {
		title: string;
		preacher: string;
		preachText: string;
		date: Timestamp;
		participants: ServerFellowshipParticipantV2[];
	};
	content: {
		categories: Record<categoryId, ServerFellowshipCategoryV2>;
	};
}

export interface ClientFellowshipV2 extends BaseFellowshipV2 {
	info: {
		title: string;
		preacher: string;
		preachText: string;
		date: Date;
		participants: ClientFellowshipParticipantV2[];
	};
	content: {
		categories: Record<categoryId, ClientFellowshipCategoryV2>;
	};
}

export interface CompactClientFellowshipV2 extends BaseFellowshipV2 {
	info: {
		title: string;
		preacher: string;
		preachText: string;
		date: Date;
		participants: ServerFellowshipParticipantV2[];
	};
	content: {
		categories: Record<categoryId, CompactClientFellowshipCategoryV2>;
	};
}

// 입력 타입
export interface CreateFellowshipInputV2
	extends Omit<BaseFellowshipV2, 'identifiers' | 'metadata'> {
	identifiers: Omit<BaseFellowshipV2['identifiers'], 'id'>;
	info: {
		title: string;
		preacher: string;
		preachText: string;
		date: Date;
		participants: ServerFellowshipParticipantV2[];
	};
	content: {
		categories: Record<categoryId, ServerFellowshipCategoryV2>;
	};
}

export type UpdateFellowshipInputV2 = DeepPartial<CreateFellowshipInputV2>;

// 기존 타입 정의
/**
 * Base Fellowship interface with common properties
 */
interface BaseFellowship {
	id: string;
	groupId: string;
	info: {
		preachTitle: string;
		preacher?: FellowshipInfoField;
		preachText?: FellowshipInfoField;
		leaderId: string;
	};
	content: {
		iceBreaking: ServerFellowshipContentField[];
		sermonTopic: ServerFellowshipContentField[];
		prayerRequest: ServerFellowshipPrayerRequestField;
	};
	options: {
		enableMemberReply: boolean;
	};
}

export type ClientFellowshipMember = ClientGroupMember & {
	isLeader: boolean;
	isGuest: boolean;
};
export type ServerFellowshipMember = Omit<ClientFellowshipMember, 'photoUrl'>;

/**
 * Server-side Fellowship with Timestamp objects
 * Used for Firestore storage and retrieval
 */
export interface ServerFellowship extends BaseFellowship {
	createdAt: FieldValue;
	updatedAt: FieldValue;
	info: {
		date: Timestamp;
		preachTitle: string;
		preacher?: FellowshipInfoField;
		preachText?: FellowshipInfoField;
		members: ServerFellowshipMember[];
		leaderId: string;
	};
}

/**
 * Client-side Fellowship with JavaScript Date objects
 * Used for application logic and UI rendering
 */
export interface ClientFellowship extends BaseFellowship {
	info: {
		date: Date;
		preachTitle: string;
		preacher?: FellowshipInfoField;
		preachText?: FellowshipInfoField;
		members: ClientFellowshipMember[];
		leaderId: string;
	};
	content: {
		iceBreaking: ClientFellowshipContentField[];
		sermonTopic: ClientFellowshipContentField[];
		prayerRequest: ClientFellowshipPrayerRequestField;
	};
}

// Fellowship fields

// common
export type FellowshipInfoField = { value?: string; isActive: boolean };

// server
export type ServerFellowshipContentField = {
	id: string;
	question: string;
	answers: ServerFellowshipAnswerField[];
};

export type ServerFellowshipPrayerRequestField = {
	isActive: boolean;
	answers: ServerFellowshipAnswerField[];
};

export type ServerFellowshipAnswerField = {
	member: ServerFellowshipMember;
	value: string;
};

// client
export type ClientFellowshipContentField = {
	id: string;
	question: string;
	answers: ClientFellowshipAnswerField[];
};

export type ClientFellowshipPrayerRequestField = {
	isActive: boolean;
	answers: ClientFellowshipAnswerField[];
};

export type ClientFellowshipAnswerField = {
	member: ClientFellowshipMember;
	value: string;
};

// input types

export type CreateFellowshipInput = Omit<
	FellowshipUpdateData,
	'id' | 'groupId'
>;
export type UpdateFellowshipInput = DeepPartial<FellowshipUpdateData>;

export interface FellowshipUpdateData extends BaseFellowship {
	info: {
		date: Date;
		preachTitle: string;
		preacher?: FellowshipInfoField;
		preachText?: FellowshipInfoField;
		members: ServerFellowshipMember[];
		leaderId: string;
	};
}
