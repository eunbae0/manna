import { getFirestore } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { getMessaging } from '@react-native-firebase/messaging';
import { getStorage } from '@react-native-firebase/storage';
import { getDatabase } from '@react-native-firebase/database';
import { getFunctions } from '@react-native-firebase/functions';

export const auth = getAuth();

export const database = getFirestore();

export const messaging = getMessaging();

export const storage = getStorage();

export const database2 = getDatabase();

export const functions = getFunctions();

// export const analytics = getAnalytics(app);
