import { auth } from '@/firebase/config';
import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen() {
	const { signUp } = useAuthStore();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	return (
		<SafeAreaView>
			<TextInput
				value={email}
				onChangeText={(text) => {
					setEmail(text);
				}}
				style={{ backgroundColor: 'lightgray' }}
			/>
			<Text>Auth</Text>
			<TextInput
				value={password}
				onChangeText={(text) => {
					setPassword(text);
				}}
				style={{ backgroundColor: 'lightgray' }}
			/>
			<Button
				title={'Auth'}
				onPress={async () => {
					console.log(auth);
				}}
			/>
			<Button
				title={'로그인'}
				onPress={async () => {
					await signUp('EMAIL', { email, password });
					router.replace('/');
				}}
			/>
		</SafeAreaView>
	);
}
