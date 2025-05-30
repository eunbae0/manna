import type { ClientFellowshipV2 } from '@/features/fellowship/api/types';

export type FellowShipStoreData = Omit<
	ClientFellowshipV2,
	'identifiers' | 'metadata' | 'extensions'
>;

export type FellowshipStoreStep = 'INFO' | 'CONTENT' | 'OPTIONS';

export type FellowshipStoreType = 'CREATE' | 'EDIT';
