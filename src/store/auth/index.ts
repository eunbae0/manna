import { auth } from '@/firebase/config';
import {
	getFirestoreUser,
	logout,
	sendEmailLink,
	signIn,
	updateFirestoreUser,
} from '@/api/auth';
import type { Group, User } from '@/shared/types/user';
import type { AuthType } from '@/api/auth/types';
import type { ApiError } from '@/api/errors/types';
import { handleApiError } from '@/api/errors';
import { router } from 'expo-router';
import { serverTimestamp } from 'firebase/firestore';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
	user: User | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: ApiError | null;
	currentGroup: Group | null;
};

type AuthActions = {
	signIn: <T extends AuthType>(
		type: T,
		data: T extends 'EMAIL' ? { email: string } : undefined,
	) => Promise<void>;
	sendEmailLink: (email: string) => Promise<void>;
	logout: () => Promise<void>;
	updateProfile: (userId: string, user: Partial<User>) => void;
	validateUserCredentials: () => Promise<void>;
	clearError: () => void;
	updateAuthenticated: (isAuthenticated: AuthState['isAuthenticated']) => void;
	updateUser: (user: AuthState['user']) => void;
	updateCurrentGroup: (group: AuthState['currentGroup']) => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
	immer(
		persist(
			(set) => ({
				user: null,
				isAuthenticated: false,
				loading: true,
				error: null,
				currentGroup: null,

				signIn: async (type, data) => {
					set({ loading: true, error: null });
					try {
						await signIn<typeof type>(type, data);
						set({
							isAuthenticated: true,
							loading: false,
						});
						router.replace('/(app)/(tabs)/(home)');
					} catch (error) {
						const apiError = handleApiError(error);
						set({
							error: apiError,
							loading: false,
						});
					}
				},

				sendEmailLink: async (email) => {
					set({ loading: true, error: null });
					try {
						await sendEmailLink(email);
						set({
							loading: false,
						});
					} catch (error) {
						const apiError = handleApiError(error);
						set({
							error: apiError,
							loading: false,
						});
					}
				},

				logout: async () => {
					try {
						await logout();
						set({
							user: null,
							isAuthenticated: false,
						});
					} catch (error) {
						const apiError = handleApiError(error);
						set({ error: apiError });
					}
				},
				updateProfile: async (userId, user) =>
					set(async (state) => {
						if (!state.user) return;
						try {
							await updateFirestoreUser(userId, user);
							state.user = { ...state.user, ...user };
						} catch (error) {
							throw handleApiError(error);
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
						const apiError = handleApiError(err);
						set({ error: apiError });
					} finally {
						set({ loading: false });
					}
				},
				clearError: () => set({ error: null }),
				updateAuthenticated: (isAuthenticated) =>
					set(() => ({ isAuthenticated })),
				updateUser: (user) => set(() => ({ user })),
				updateCurrentGroup: (group) => set(() => ({ currentGroup: group })),
			}),
			{
				name: 'auth-storage',
				storage: createJSONStorage(() => AsyncStorage),
			},
		),
	),
);
