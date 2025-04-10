import React, { useEffect } from 'react';
import { Toast, ToastTitle, ToastDescription } from '#/components/ui/toast';
import { type ToastType, useToastStore } from '@/store/toast';
import { VStack } from '#/components/ui/vstack';
import { Box } from '#/components/ui/box';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';

// 토스트 타입에 따른 아이콘 및 색상 설정
const getToastIconAndColor = (type: ToastType) => {
	switch (type) {
		case 'success':
			return {
				icon: CheckCircle,
				color: 'stroke-emerald-500',
				bgColor: 'rgba(16, 185, 129, 0.15)',
			};
		case 'error':
			return {
				icon: AlertCircle,
				color: 'stroke-red-500',
				bgColor: 'bg-emerald-200',
			};
		case 'info':
			return {
				icon: Info,
				color: 'stroke-blue-500',
				bgColor: 'bg-blue-500',
			};
		default:
			return {
				icon: Info,
				color: 'stroke-blue-500',
				bgColor: 'bg-blue-500',
			};
	}
};

export const ToastContainer = () => {
	const { toasts, removeToast } = useToastStore();
	const { top } = useSafeAreaInsets();

	// 각 토스트마다 일정 시간 후 자동으로 제거
	useEffect(() => {
		toasts.forEach((toast) => {
			const timer = setTimeout(() => {
				removeToast(toast.id);
			}, 3000);

			return () => clearTimeout(timer);
		});
	}, [toasts, removeToast]);

	if (toasts.length === 0) return null;

	return (
		<Box style={{ top }} className="absolute px-4 z-30 mt-2 w-full">
			<VStack space="sm" className="items-center">
				{toasts.map((toast) => {
					const {
						icon: IconComponent,
						color,
						bgColor,
					} = getToastIconAndColor(toast.type);

					return (
						<Box
							key={toast.id}
							style={{ backgroundColor: bgColor }}
							className="w-full rounded-full px-4 py-3 border border-gray-200 dark:border-gray-700"
						>
							<HStack space="sm" className="items-center">
								<Icon as={IconComponent} size="md" className={color} />
								<VStack space="xs" className="flex-1">
									{toast.title && (
										<ToastTitle className="text-gray-900 dark:text-gray-100 font-medium">
											{toast.title}
										</ToastTitle>
									)}
									<ToastDescription className="text-gray-700 dark:text-gray-300">
										{toast.message}
									</ToastDescription>
								</VStack>
							</HStack>
						</Box>
					);
				})}
			</VStack>
		</Box>
	);
};
