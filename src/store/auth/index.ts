import { auth } from '@/firebase/config';
import {
	getFirestoreUser,
	logout,
	signUp,
	updateFirestoreUser,
} from '@/services/auth';
import type { AuthType, User } from '@/types/user';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { shallow } from 'zustand/shallow';

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
	// login: (
	// 	type: AuthType,
	// 	data: { email: string; password: string },
	// ) => Promise<void>;
	logout: () => Promise<void>;
	updateProfile: (userId: string, user: Partial<User>) => void;
	validateUserCredentials: () => Promise<void>;
	clearError: () => void;
	updateAuthenticated: (isAuthenticated: AuthState['isAuthenticated']) => void;
	updateUser: (user: AuthState['user']) => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
	immer(
		// persist(
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
		// {
		// 	name: 'auth-storage',
		// 	storage: createJSONStorage(() => AsyncStorage),
		// 	partialize: (state) =>
		// 		Object.fromEntries(
		// 			Object.entries(state).filter(([key]) =>
		// 				['user', 'token'].includes(key),
		// 			),
		// 		),
		// },
		// ),
	),
);
