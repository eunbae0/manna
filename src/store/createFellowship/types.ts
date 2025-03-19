import type { ClientFellowship } from '@/api/fellowship/types';

export type FellowShipStoreData = Omit<ClientFellowship, 'id' | 'groupId'>;

export type FellowshipStoreStep =
	| 'INFO'
	| 'CONTENT'
	| 'CONTENT_ICEBREAKING'
	| 'CONTENT_SERMON';

export type FellowshipStoreType = 'CREATE' | 'EDIT';
