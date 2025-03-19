import React, { useEffect } from 'react';
import { Toast, ToastTitle, ToastDescription } from '#/components/ui/toast';
import { useToastStore } from '@/store/toast';
import { VStack } from '#/components/ui/vstack';
import { Box } from '#/components/ui/box';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ToastContainer = () => {
	const { toasts, removeToast } = useToastStore();
	const { top } = useSafeAreaInsets();

	// 각 토스트마다 일정 시간 후 자동으로 제거
	useEffect(() => {
		toasts.forEach((toast) => {
			const timer = setTimeout(() => {
				removeToast(toast.id);
			}, 3000); // 3초 후 제거

			return () => clearTimeout(timer);
		});
	}, [toasts, removeToast]);

	if (toasts.length === 0) return null;

	return (
		<Box style={{ top }} className="absolute px-4 z-30 mt-2 w-full">
			<VStack space="sm" className="items-center">
				{toasts.map((toast) => (
					<Toast
						key={toast.id}
						action={toast.type}
						variant="solid"
						className="w-full rounded-full"
					>
						<VStack space="xs">
							{toast.title && <ToastTitle>{toast.title}</ToastTitle>}
							<ToastDescription>{toast.message}</ToastDescription>
						</VStack>
					</Toast>
				))}
			</VStack>
		</Box>
	);
};
