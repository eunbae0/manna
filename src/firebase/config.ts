import { getFirestore } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { getMessaging } from '@react-native-firebase/messaging';

export const auth = getAuth();

export const database = getFirestore();

export const messaging = getMessaging();
// export const analytics = getAnalytics(app);
