import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useMemo } from 'react';
import type { AppStateStatus } from 'react-native';
import { AppState } from 'react-native';
import { fetchAppConfigVersion } from '@/api/app_config';
import {
	compareVersions,
	getCurrentAppVersion,
} from '@/shared/utils/app/app_version';
import { logEvent, AnalyticsEvents } from '@/utils/analytics';

const APP_VERSION_QUERY_KEY = ['app-version'];
const REFETCH_INTERVAL = 1000 * 60 * 60; // 1시간마다 체크

export function useAppVersionCheck() {
	const currentVersion = getCurrentAppVersion();
	const appStateRef = useRef<AppStateStatus>(AppState.currentState);

	// React Query를 사용하여 앱 버전 정보 가져오기
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: APP_VERSION_QUERY_KEY,
		queryFn: fetchAppConfigVersion,
		refetchInterval: REFETCH_INTERVAL,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		staleTime: REFETCH_INTERVAL,
	});

	// 앱 상태 변경 감지 및 백그라운드에서 포그라운드로 돌아올 때 리페치
	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextAppState) => {
			if (
				appStateRef.current.match(/inactive|background/) &&
				nextAppState === 'active'
			) {
				// 앱이 백그라운드에서 포그라운드로 돌아왔을 때 리페치
				refetch();
			}
			appStateRef.current = nextAppState;
		});

		return () => {
			subscription.remove();
		};
	}, [refetch]);

	// 버전 비교 계산
	const versionInfo = useMemo(() => {
		if (!data)
			return { needsUpdate: false, isOutdated: false, forceUpdate: false };

		const needsUpdate = compareVersions(currentVersion, data.latestVersion) < 0;
		const isOutdated = compareVersions(currentVersion, data.minVersion) < 0;

		// 업데이트가 필요한 경우 분석 이벤트 기록
		if (needsUpdate) {
			logEvent(AnalyticsEvents.APP_UPDATE_NEEDED, {
				current_version: currentVersion,
				latest_version: data.latestVersion,
				force_update: data.forceUpdate,
			});
		}
		return {
			needsUpdate,
			isOutdated,
			forceUpdate: isOutdated && data.forceUpdate,
			updateMessage: data.updateMessage,
			latestVersion: data.latestVersion,
		};
	}, [data, currentVersion]);

	return {
		isLoading,
		error,
		currentVersion,
		...versionInfo,
		refetch,
	};
}
