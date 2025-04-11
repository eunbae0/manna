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

				// // 자동으로 토스트 제거 (타이머 대신 스토어 외부에서 처리)
				// setTimeout(() => {
				// 	set((state) => {
				// 		state.toasts = state.toasts.filter((t) => t.id !== id);
				// 		return state;
				// 	});
				// }, 3000);
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
