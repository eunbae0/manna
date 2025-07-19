import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();
export const storeReviewStorage = new MMKV({ id: 'store-review' });
