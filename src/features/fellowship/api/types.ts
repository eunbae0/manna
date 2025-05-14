import type { ClientGroupMember } from '@/api/prayer-request/types';
import type { DeepPartial } from '@/shared/utils/deepPartial';
import type { FieldValue, Timestamp } from '@react-native-firebase/firestore';

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

// Schema V2

export interface BaseFellowshipV2 {
	id: string;
	groupId: string;
	metadata: {
		schemaVersion: string;
		createdAt: Timestamp;
		updatedAt: Timestamp;
		status: 'draft' | 'published' | 'archived';
	};
	info: {
		title: string;
		date: Date | Timestamp;
		preacher?: FellowshipInfoField;
		preachText?: FellowshipInfoField;
		participants: ClientFellowshipMember[] | ServerFellowshipMember[];
	};
	content: {
		iceBreaking:
			| ClientFellowshipContentField[]
			| ServerFellowshipContentField[];
		sermonTopic:
			| ClientFellowshipContentField[]
			| ServerFellowshipContentField[];
		prayerRequest:
			| ClientFellowshipPrayerRequestField
			| ServerFellowshipPrayerRequestField;
	};
	extensions?: Record<string, unknown>;
}
