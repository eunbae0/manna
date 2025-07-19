import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/text';
import { Icon } from '#/components/ui/icon';
import { useSyncStore } from '@/features/note/store/sync';
import {
	CloudOff,
	CloudDownload,
	Cloud,
	CloudAlert,
	CloudCogIcon,
} from 'lucide-react-native';
import { Spinner } from './spinner';
import { useAuthStore } from '@/store/auth';
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime';
import { Button } from './button';
import { HStack } from '#/components/ui/hstack';

interface SyncButtonProps {
	className?: string;
	onSyncComplete?: () => void;
}

export function SyncButton({ className, onSyncComplete }: SyncButtonProps) {
	const {
		isSyncing,
		lastSyncTime,
		pendingChangesCount,
		syncError,
		syncNotes,
		loadSyncStatus,
	} = useSyncStore();

	const { user } = useAuthStore();

	useEffect(() => {
		if (!user?.id) return;
		loadSyncStatus(user?.id);

		// 주기적으로 동기화 상태 확인
		const interval = setInterval(
			() => {
				loadSyncStatus(user?.id);
			},
			30 * 60 * 1000,
		); //30분마다 확인

		return () => clearInterval(interval);
	}, [user?.id, loadSyncStatus]);

	const handleSync = () => {
		if (!user?.id) return;
		syncNotes(user?.id, onSyncComplete);
	};

	const getFormattedTime = () => {
		if (!lastSyncTime) return null;
		return formatRelativeTime(new Date(lastSyncTime));
	};

	return (
		<Button
			onPress={handleSync}
			disabled={isSyncing}
			variant="text"
			className={`flex-row items-center ${className}`}
		>
			<HStack space="xs" className="items-center">
				{isSyncing ? (
					<Spinner size="small" />
				) : syncError ? (
					<Icon as={CloudOff} size="md" className="text-error-500" />
				) : pendingChangesCount > 0 ? (
					<Icon as={CloudCogIcon} size="md" className="text-yellow-600" />
				) : (
					<Icon as={Cloud} size="md" className="text-success-500" />
				)}
				{pendingChangesCount > 0 && !isSyncing && (
					<Text size="sm" weight="medium" className="ml-1 text-yellow-600">
						{pendingChangesCount}개의 노트 동기화 대기 중
					</Text>
				)}
				{pendingChangesCount === 0 &&
					lastSyncTime &&
					!isSyncing &&
					!syncError && (
						<Text size="sm" weight="medium" className="ml-1 text-gray-500">
							{getFormattedTime()} 동기화 완료됨
						</Text>
					)}
				{syncError && !isSyncing && (
					<Text size="sm" weight="medium" className="ml-1 text-error-500">
						동기화 실패
					</Text>
				)}
			</HStack>
		</Button>
	);
}
