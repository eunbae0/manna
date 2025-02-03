import { View, Text } from 'react-native';

import { getDocs, collection } from 'firebase/firestore';
import { useEffect } from 'react';
import { database } from '@/firebase/config';

export default function HomeScreen() {
	const get = async () => {
		const querySnapshot = await getDocs(collection(database, 'users'));
		querySnapshot.forEach((doc) => {
			console.log(`${doc.id} => ${doc.data()}`);
		});
	};
	useEffect(() => {
		(async () => await get())();
	}, []);
	return (
		<View>
			<Text>메인</Text>
		</View>
	);
}
