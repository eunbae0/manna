import {
	deleteAccount,
	logout,
	signInWithApple,
	signInWithEmail,
	signInWithGoogle,
	signUpWithEmail,
} from '@/api/auth';
import type { AuthType, EmailSignInInput } from '@/api/auth/types';
import type { ApiError } from '@/api/errors/types';
import { handleApiError } from '@/api/errors';
import { router } from 'expo-router';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import type { ClientUser, UpdateUserInput, UserGroup } from '@/shared/types';
import { getUser, updateUser } from '@/api/user';

type AuthState = {
	user: ClientUser | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: ApiError | null;
	currentGroup: UserGroup | null;
};

type AuthActions = {
	signIn: <T extends AuthType>(
		type: T,
		data: T extends 'EMAIL' ? EmailSignInInput : undefined,
	) => Promise<{ id: string }>;
	signUp: (data: EmailSignInInput) => Promise<{ id: string }>;
	// sendEmailLink: (email: string) => Promise<void>;
	logout: () => Promise<void>;
	updateProfile: (userId: string, user: UpdateUserInput) => Promise<void>;
	onAuthStateChanged: (
		user: FirebaseAuthTypes.User | null,
		fcmToken: string,
	) => void;
	clearError: () => void;
	updateAuthenticated: (isAuthenticated: AuthState['isAuthenticated']) => void;
	updateUser: (user: AuthState['user']) => void;
	updateCurrentGroup: (group: UserGroup | null) => void;
	deleteAccount: () => Promise<void>;
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
								if (!data) {
									throw new Error('Invalid data');
								}
								const { user } = await signInWithEmail({
									email: data.email,
									password: data.password,
								});

								set({
									user,
									currentGroup: user?.groups?.[0] ?? null,
									isAuthenticated: true,
									loading: false,
								});
								return { id: user.id };
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
								return { id: user.id };
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
								return { id: user.id };
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

				signUp: async (data: EmailSignInInput) => {
					set({ loading: true, error: null });
					try {
						const { user } = await signUpWithEmail(data);
						set({
							user,
							currentGroup: user?.groups?.[0] ?? null,
							isAuthenticated: true,
							loading: false,
						});
						return { id: user.id };
					} catch (error) {
						const apiError = handleApiError(error);
						set({
							error: apiError,
							loading: false,
						});
					}
				},

				// sendEmailLink: async (email) => {
				// 	set({ loading: true, error: null });
				// 	try {
				// 		await sendEmailLink(email);
				// 		set({
				// 			loading: false,
				// 		});
				// 	} catch (error) {
				// 		const apiError = handleApiError(error);
				// 		set({
				// 			error: apiError,
				// 			loading: false,
				// 		});
				// 	}
				// },

				logout: async () => {
					const authType = get().user?.authType ?? null;
					try {
						await logout(authType);
						set({
							user: null,
							currentGroup: null,
							isAuthenticated: false,
						});
					} catch (error) {
						const apiError = handleApiError(error);
						set({ error: apiError });
					}
				},
				updateProfile: async (userId, user) => {
					if (!get().user) return;
					try {
						await updateUser(userId, user);
						set((state) => ({
							user: state.user ? { ...state.user, ...user } : null,
						}));
					} catch (error) {
						throw handleApiError(error);
					}
				},
				onAuthStateChanged: async (user, fcmToken) => {
					set({ loading: true });
					if (!user) {
						set({
							loading: false,
							isAuthenticated: false,
							user: null,
							currentGroup: null,
						});
						return;
					}
					try {
						await updateUser(user.uid, { fcmToken });
						const firestoreUser = await getUser(user.uid);
						set({
							isAuthenticated: true,
							user: firestoreUser,
							currentGroup: firestoreUser?.groups?.[0] ?? null,
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
				updateUser: (user) =>
					set((state) => ({
						user: state.user ? { ...state.user, ...user } : null,
					})),
				updateCurrentGroup: (group) =>
					set({
						currentGroup: group,
					}),
				deleteAccount: async () => {
					await deleteAccount();
					set({
						user: null,
						currentGroup: null,
						isAuthenticated: false,
					});
				},
			}),
			{
				name: 'auth-storage',
				storage: createJSONStorage(() => AsyncStorage),
			},
		),
	),
);
