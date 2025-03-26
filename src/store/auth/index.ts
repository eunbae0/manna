import { auth } from '@/firebase/config';
import {
	getUser,
	logout,
	sendEmailLink,
	signInWithApple,
	signInWithEmail,
	signInWithGoogle,
	updateLastLogin,
	updateUser,
} from '@/api/auth';
import type {
	AuthGroup,
	AuthType,
	ClientUser,
	UpdateUserInput,
} from '@/api/auth/types';
import type { ApiError } from '@/api/errors/types';
import { handleApiError } from '@/api/errors';
import { router } from 'expo-router';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
	user: ClientUser | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: ApiError | null;
	currentGroup: AuthGroup | null;
};

type AuthActions = {
	signIn: <T extends AuthType>(
		type: T,
		data: T extends 'EMAIL' ? { email: string } : undefined,
	) => Promise<void>;
	sendEmailLink: (email: string) => Promise<void>;
	logout: () => Promise<void>;
	updateProfile: (userId: string, user: UpdateUserInput) => void;
	validateUserCredentials: () => Promise<void>;
	clearError: () => void;
	updateAuthenticated: (isAuthenticated: AuthState['isAuthenticated']) => void;
	updateUser: (user: AuthState['user']) => void;
	updateCurrentGroup: (group: AuthGroup | null) => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
	immer(
		persist(
			(set, get) => ({
				user: null,
				isAuthenticated: false,
				loading: true,
				error: null,
				currentGroup: null,

				signIn: async (type, data) => {
					set({ loading: true, error: null });
					try {
						switch (type) {
							case 'EMAIL': {
								await signInWithEmail({ email: data?.email ?? '' });
								// TODO: update user
								set({
									isAuthenticated: true,
									loading: false,
								});
								break;
							}
							case 'APPLE': {
								const { user, existUser } = await signInWithApple();
								set({
									user,
									currentGroup: user?.groups?.[0] ?? null,
									isAuthenticated: true,
									loading: false,
								});
								if (existUser) {
									router.push('/(app)');
								} else {
									router.push('/(auth)/onboarding');
								}
								break;
							}
							case 'GOOGLE': {
								const { user, existUser } = await signInWithGoogle();
								set({
									user,
									currentGroup: user?.groups?.[0] ?? null,
									isAuthenticated: true,
									loading: false,
								});
								if (existUser) {
									router.push('/(app)');
								} else {
									router.push('/(auth)/onboarding');
								}
								break;
							}
						}
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
					const authType = get().user?.authType ?? null;
					try {
						await logout(authType);
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
							await updateUser(userId, user);
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
						await updateLastLogin(auth.currentUser.uid);
						const user = await getUser(auth.currentUser.uid);
						set({
							isAuthenticated: true,
							user,
							currentGroup: user?.groups?.[0] ?? null,
						});
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
