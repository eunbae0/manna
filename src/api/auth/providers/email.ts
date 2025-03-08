import { auth } from '@/firebase/config';
import type { AuthProviderInterface } from '@/api/auth/types';
import {
	isSignInWithEmailLink,
	sendSignInLinkToEmail,
	signInWithEmailLink,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleApiError } from '../../errors';

export interface EmailAuthData {
	email: string;
}

export class EmailAuthProvider implements AuthProviderInterface {
	async signIn(incomingLink: string) {
		try {
			if (!isSignInWithEmailLink(auth, incomingLink)) {
				throw handleApiError({ message: 'Invalid sign in link' });
			}

			const email = await this.retrieveEmailForSignIn();
			const userCredential = await signInWithEmailLink(
				auth,
				email,
				incomingLink,
			);

			await AsyncStorage.removeItem('emailForSignIn');
			return userCredential;
		} catch (error) {
			throw handleApiError(error);
		}
	}

	async sendEmailLink(email: string) {
		const actionCodeSettings = {
			url: 'https://so-group.web.app/login', // 웹 폴백 URL
			handleCodeInApp: true,
			iOS: {
				bundleId: 'com.eunbae.sogroup',
			},
			android: {
				packageName: 'com.eunbae.sogroup',
				installApp: true,
				minimumVersion: '12',
			},
		};

		try {
			await sendSignInLinkToEmail(auth, email, actionCodeSettings);
			await AsyncStorage.setItem('emailForSignIn', email);
		} catch (error) {
			throw handleApiError(error);
		}
	}

	private async retrieveEmailForSignIn(): Promise<string> {
		const email = await AsyncStorage.getItem('emailForSignIn');
		if (!email) {
			throw handleApiError({ message: 'No email found for sign-in' });
		}
		return email;
	}
}
