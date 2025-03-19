import type { ClientFellowship } from '@/features/fellowship/api/types';

export type FellowShipStoreData = Omit<ClientFellowship, 'id' | 'groupId'>;

export type FellowshipStoreStep =
	| 'INFO'
	| 'CONTENT'
	| 'CONTENT_ICEBREAKING'
	| 'CONTENT_SERMON';

export type FellowshipStoreType = 'CREATE' | 'EDIT';
