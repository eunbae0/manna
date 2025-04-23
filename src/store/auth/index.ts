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
import type {
	ClientUser,
	ManagedUserGroup,
	UpdateUserInput,
	UserGroup,
} from '@/shared/types';
import {
	createUserGroup,
	getUser,
	updateAllUserGroup,
	updateUser,
	updateUserGroup,
} from '@/api/user';
import type { OnboardingState } from '../onboarding';
import { onUserSignIn, onUserSignOut } from '@/shared/utils/amplitude';

type AuthState = {
	user: ClientUser | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: ApiError | null;
	currentGroup: ManagedUserGroup | null;
};

type AuthActions = {
	signIn: <T extends AuthType>(
		type: T,
		data: T extends 'EMAIL'
			? EmailSignInInput
			: T extends 'APPLE' | 'GOOGLE'
				? { updateUserData?: OnboardingState['updateUserData'] }
				: undefined,
	) => Promise<{ id: string }>;
	signUp: (data: EmailSignInInput) => Promise<{ id: string }>;
	// sendEmailLink: (email: string) => Promise<void>;
	logout: () => Promise<void>;
	updateUserProfile: (userId: string, user: UpdateUserInput) => Promise<void>;
	addUserGroupProfile: (
		userId: string,
		group: Required<UserGroup>,
	) => Promise<void>;
	updateUserGroupProfile: (userId: string, group: UserGroup) => Promise<void>;
	updateAllUserGroupProfile: (
		userId: string,
		groups: UserGroup[],
	) => Promise<void>;
	onAuthStateChanged: (
		user: FirebaseAuthTypes.User | null,
		fcmTokens: string,
	) => Promise<void>;
	clearError: () => void;
	updateAuthenticated: (isAuthenticated: AuthState['isAuthenticated']) => void;
	updateUser: (user: AuthState['user']) => void;
	updateCurrentGroup: (group: ManagedUserGroup | null) => void;
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

								const currentGroup =
									user?.groups?.find((g) => g.isMain) ??
									user?.groups?.[0] ??
									null;
								set({
									user,
									currentGroup,
									isAuthenticated: true,
									loading: false,
								});
								return { id: user.id };
							}
							case 'APPLE': {
								const { user, existUser, givenName } = await signInWithApple();
								data?.updateUserData({ displayName: givenName });
								const currentGroup =
									user?.groups?.find((g) => g.isMain) ??
									user?.groups?.[0] ??
									null;
								set({
									user,
									currentGroup,
									isAuthenticated: true,
									loading: false,
								});
								if (existUser) {
									router.replace('/(app)');
								} else {
									router.replace('/(auth)/onboarding');
								}
								return { id: user.id };
							}
							case 'GOOGLE': {
								const { user, existUser, profileImage } =
									await signInWithGoogle();
								data?.updateUserData({ photoUrl: profileImage ?? null });
								const currentGroup =
									user?.groups?.find((g) => g.isMain) ??
									user?.groups?.[0] ??
									null;
								set({
									user,
									currentGroup,
									isAuthenticated: true,
									loading: false,
								});
								if (existUser) {
									router.replace('/(app)');
								} else {
									router.replace('/(auth)/onboarding');
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
						const currentGroup =
							user?.groups?.find((g) => g.isMain) ?? user?.groups?.[0] ?? null;
						set({
							user,
							currentGroup,
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
						onUserSignOut();
					} catch (error) {
						const apiError = handleApiError(error);
						set({ error: apiError });
					}
				},
				updateUserProfile: async (userId, user) => {
					if (!get().user) return;
					try {
						const updatedUser = await updateUser(userId, user);
						set((state) => ({
							user: state.user ? { ...state.user, ...updatedUser } : null,
						}));
					} catch (error) {
						throw handleApiError(error);
					}
				},
				addUserGroupProfile: async (userId, group) => {
					const user = get().user;
					if (!user) return;
					try {
						await createUserGroup(userId, group);
						const newGroups = [...(user.groups ?? []), group];
						set((state) => ({
							user: state.user ? { ...state.user, groups: newGroups } : null,
							currentGroup: group,
						}));
					} catch (error) {
						throw handleApiError(error);
					}
				},
				updateUserGroupProfile: async (userId, group) => {
					const user = get().user;
					if (!user) return;
					try {
						const existingGroup = user.groups?.find(
							(g) => g.groupId === group.groupId,
						);
						if (existingGroup) {
							await updateUserGroup(userId, group);
						} else {
							await createUserGroup(userId, group);
						}

						const newGroups = [...(user.groups ?? [])];
						if (existingGroup) {
							newGroups.splice(newGroups.indexOf(existingGroup), 1, group);
						} else {
							newGroups.push(group);
						}

						set((state) => ({
							user: state.user ? { ...state.user, groups: newGroups } : null,
							currentGroup: group,
						}));
					} catch (error) {
						throw handleApiError(error);
					}
				},
				updateAllUserGroupProfile: async (userId, groups) => {
					const user = get().user;
					if (!user) return;
					try {
						await updateAllUserGroup(userId, groups);

						set((state) => ({
							user: state.user ? { ...state.user, groups } : null,
							currentGroup: state.currentGroup,
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
						await updateUser(user.uid, { fcmTokens: [fcmToken] });
						const firestoreUser = await getUser(user.uid);
						const currentGroup =
							firestoreUser?.groups?.find((g) => g.isMain) ??
							firestoreUser?.groups?.[0] ??
							null;
						set({
							isAuthenticated: true,
							user: firestoreUser,
							currentGroup,
						});
						onUserSignIn(firestoreUser);
					} catch (err) {
						// signOut
						const apiError = handleApiError(err);
						set({
							loading: false,
							isAuthenticated: false,
							user: null,
							currentGroup: null,
							error: apiError,
						});
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
					onUserSignOut();
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
