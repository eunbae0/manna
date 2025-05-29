import type { ClientFellowshipV2 } from '@/features/fellowship/api/types';

export type FellowShipStoreData = Omit<
	ClientFellowshipV2,
	'identifiers' | 'metadata' | 'extensions'
>;

export type FellowshipStoreStep =
	| 'INFO'
	| 'CONTENT'
	| 'OPTIONS'
	| 'CONTENT_ICEBREAKING'
	| 'CONTENT_SERMON';

export type FellowshipStoreType = 'CREATE' | 'EDIT';
