import type { ClientUser } from '@/shared/types';
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
		members: FellowshipMember[];
	};
	content: {
		iceBreaking: FellowshipContentField[];
		sermonTopic: FellowshipContentField[];
		prayerRequest: FellowshipPrayerRequestField;
	};
}

/**
 * Server-side Fellowship with Timestamp objects
 * Used for Firestore storage and retrieval
 */
export interface Fellowship extends BaseFellowship {
	createdAt: FieldValue;
	updatedAt: FieldValue;
	info: {
		date: Timestamp;
		preachTitle: string;
		preacher?: FellowshipInfoField;
		preachText?: FellowshipInfoField;
		members: FellowshipMember[];
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
		members: FellowshipMember[];
	};
}

export type FellowshipMember = Partial<
	Pick<ClientUser, 'id' | 'displayName' | 'photoUrl'>
> & {
	isLeader: boolean;
};

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
	member: FellowshipMember;
	value: string;
};

export type UpdateFellowshipInput = DeepPartial<
	Omit<ClientFellowship, 'id' | 'groupId' | 'createdAt'>
>;
