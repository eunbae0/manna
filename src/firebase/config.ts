import { getFirestore } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

export const auth = getAuth();

export const database = getFirestore();

// export const analytics = getAnalytics(app);
