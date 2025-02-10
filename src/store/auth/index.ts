import { auth } from '@/firebase/config';
import {
	getFirestoreUser,
	logout,
	signInWithEmail,
	signUp,
	updateFirestoreUser,
} from '@/services/auth';
import type { AuthType, User } from '@/types/user';
import { router } from 'expo-router';
import { serverTimestamp } from 'firebase/firestore';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
	user: User | null;
	// token: string | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: string | null;
};

type AuthActions = {
	signUp: (
		type: AuthType,
		data: { email: string; password: string },
	) => Promise<void>;
	signInWithEmail: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	updateProfile: (userId: string, user: Partial<User>) => void;
	validateUserCredentials: () => Promise<void>;
	clearError: () => void;
	updateAuthenticated: (isAuthenticated: AuthState['isAuthenticated']) => void;
	updateUser: (user: AuthState['user']) => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
	immer(
		persist(
			(set) => ({
				user: null,
				// token: null,
				isAuthenticated: false,
				loading: true,
				error: null,

				signUp: async (type, { email, password }) => {
					set({ loading: true, error: null });
					try {
						await signUp(type, { email, password });
						set({
							isAuthenticated: true,
							loading: false,
						});
						router.replace('/(app)/(tabs)/(home)');
					} catch (error) {
						set({
							error: error.message,
							loading: false,
						});
					}
				},

				signInWithEmail: async (email, password) => {
					set({ loading: true, error: null });
					try {
						await signInWithEmail(email, password);
						set({
							isAuthenticated: true,
							loading: false,
						});
						router.replace('/(app)/(tabs)/(home)');
					} catch (error) {
						set({
							error: error.message,
							loading: false,
						});
					}
				},

				logout: async () => {
					try {
						await logout();
						set({
							user: null,
							// token: null,
							isAuthenticated: false,
						});
					} catch (error) {}
				},
				updateProfile: async (userId, user) =>
					set(async (state) => {
						if (!state.user) return;
						try {
							await updateFirestoreUser(userId, user);
							state.user = { ...state.user, ...user };
						} catch (error) {
							throw new Error(error.message);
						}
					}),
				validateUserCredentials: async () => {
					set({ loading: true });
					await auth.authStateReady();
					if (!auth.currentUser) {
						set({ loading: false });
						return;
					}
					try {
						await updateFirestoreUser(auth.currentUser.uid, {
							lastLogin: serverTimestamp(),
						});
						const user = await getFirestoreUser(auth.currentUser.uid);
						set({ isAuthenticated: true, user });
					} catch (err) {
						// signOut
					} finally {
						set({ loading: false });
					}
				},
				clearError: () => set({ error: null }),
				updateAuthenticated: (isAuthenticated) =>
					set(() => ({ isAuthenticated })),
				updateUser: (user) => set(() => ({ user })),
			}),
			{
				name: 'auth-storage',
				storage: createJSONStorage(() => AsyncStorage),
			},
		),
	),
);
