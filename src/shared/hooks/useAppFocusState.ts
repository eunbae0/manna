import { useState, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

type AppStateType = 'active' | 'background' | 'inactive' | 'unknown';

/**
 * 앱의 포커스 상태를 관리하는 훅
 *
 * 앱이 활성화 상태(active), 백그라운드 상태(background), 비활성 상태(inactive)를 추적합니다.
 * 사용자가 앱 설정 화면에 갔다가 돌아오는 경우 등을 감지할 수 있습니다.
 *
 * @returns {Object} 앱의 상태 정보
 * - isActive: 앱이 활성 상태인지 여부 (사용자가 앱을 사용 중)
 * - isBackground: 앱이 백그라운드 상태인지 여부 (홈 화면으로 나갔거나 다른 앱으로 전환)
 * - isInactive: 앱이 비활성 상태인지 여부 (iOS에서 멀티태스킹 화면이나 알림 센터 열었을 때)
 * - currentState: 현재 앱 상태
 * - previousState: 이전 앱 상태
 * - isReturningFromBackground: 앱이 백그라운드나 비활성 상태에서 활성 상태로 돌아왔는지 여부
 */
export function useAppFocusState() {
	const [appState, setAppState] = useState<AppStateType>('unknown');
	const previousAppStateRef = useRef<AppStateType>('unknown');
	const [isReturningFromBackground, setIsReturningFromBackground] =
		useState(false);

	useEffect(() => {
		const subscription = AppState.addEventListener(
			'change',
			handleAppStateChange,
		);

		// 초기 상태 설정
		setAppState(AppState.currentState as AppStateType);
		previousAppStateRef.current = AppState.currentState as AppStateType;

		return () => {
			subscription.remove();
		};
	}, []);

	const handleAppStateChange = (nextAppState: AppStateStatus) => {
		const previousState = previousAppStateRef.current;
		previousAppStateRef.current = appState;

		// 앱이 백그라운드나 비활성 상태에서 활성 상태로 돌아왔는지 확인
		if (
			nextAppState === 'active' &&
			(appState === 'background' || appState === 'inactive')
		) {
			setIsReturningFromBackground(true);
		} else {
			setIsReturningFromBackground(false);
		}

		setAppState(nextAppState as AppStateType);
	};

	return {
		isActive: appState === 'active',
		isBackground: appState === 'background',
		isInactive: appState === 'inactive',
		currentState: appState,
		previousState: previousAppStateRef.current,
		isReturningFromBackground,
	};
}
