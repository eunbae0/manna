import type {
	ClientGroupMember,
	ServerGroupMember,
} from '@/api/prayer-request/types';
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
	};
	content: {
		iceBreaking: FellowshipContentField[];
		sermonTopic: FellowshipContentField[];
		prayerRequest: FellowshipPrayerRequestField;
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
	};
}

// Fellowship fields
export type FellowshipInfoField = { value?: string; isActive: boolean };

export type FellowshipContentField = {
	id: string;
	question: string;
	answers: FellowshipAnswerField[];
};

export type FellowshipPrayerRequestField = {
	isActive: boolean;
	answers: FellowshipAnswerField[];
};

export type FellowshipAnswerField = {
	member: ServerFellowshipMember;
	value: string;
};

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
	};
}
