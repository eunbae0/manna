import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ApiError } from '@/api/errors/types';

export type ToastType = 'success' | 'error' | 'info';

type Toast = {
	id: string;
	message: string;
	type: ToastType;
	title?: string;
};

type ToastState = {
	toasts: Toast[];
};

type ToastActions = {
	showToast: (toast: Omit<Toast, 'id'>) => void;
	showError: (error: ApiError | string) => void;
	showSuccess: (message: string, title?: string) => void;
	showInfo: (message: string, title?: string) => void;
	removeToast: (id: string) => void;
	clearToasts: () => void;
};

export const useToastStore = create<ToastState & ToastActions>()(
	immer((set) => ({
		toasts: [],

		showToast: (toast) =>
			set((state) => {
				const id = Date.now().toString();
				state.toasts.push({ ...toast, id });
			}),

		showError: (error) => {
			const errorMessage = typeof error === 'string' ? error : error.message;

			set((state) => {
				state.toasts.push({
					id: Date.now().toString(),
					type: 'error',
					title: '오류가 발생헸어요',
					message: errorMessage,
				});
			});
		},

		showSuccess: (message, title) => {
			set((state) => {
				state.toasts.push({
					id: Date.now().toString(),
					type: 'success',
					title,
					message,
				});
			});
		},

		showInfo: (message, title) => {
			set((state) => {
				state.toasts.push({
					id: Date.now().toString(),
					type: 'info',
					title,
					message,
				});
			});
		},

		removeToast: (id) =>
			set((state) => {
				state.toasts = state.toasts.filter((toast) => toast.id !== id);
			}),

		clearToasts: () =>
			set((state) => {
				state.toasts = [];
			}),
	})),
);
