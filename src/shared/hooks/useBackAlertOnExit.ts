import { BackHandler, ToastAndroid } from 'react-native';
import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'expo-router';

/**
 * 안드로이드에서 뒤로가기 버튼을 눌렀을 때 앱 종료 여부를 묻는 알림을 표시합니다.
 * 뒤로가기 버튼을 두 번 누르면 앱이 종료됩니다.
 * 이 훅은 안드로이드 전용이며, iOS에서는 아무 동작도 하지 않습니다.
 * 중요: 이 훅은 루트 경로(메인 화면)에서만 동작합니다. 다른 화면에서는 일반 뒤로가기가 작동합니다.
 * @returns void
 */
export function useBackAlertOnExit(): void {
	const backPressCount = useRef(0);
	const pathname = usePathname();
	const router = useRouter();

	// 토스트 타이머 관리
	const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

	// 루트 경로 확인 (메인 화면인지 체크)
	// 앱의 구조에 따라 이 부분 수정 필요
	const isRootRoute = useMemo(() => {
		return pathname === '/' || pathname === '/index';
	}, [pathname]);

	useEffect(() => {
		// 안드로이드 뒤로가기 버튼 핸들러
		const backAction = () => {
			// 루트 경로가 아니면 일반 뒤로가기 동작 수행
			if (!isRootRoute) {
				// 라우터 뒤로가기 수행
				router.back();
				return true;
			}

			// 루트 경로에서는 앱 종료 경고 표시
			backPressCount.current += 1;
			if (backPressCount.current >= 2) {
				// 두 번 누르면 앱 종료
				BackHandler.exitApp();
				backPressCount.current = 0;
				return true;
			}

			// 첫 번째 누름에서 토스트 메시지 표시
			ToastAndroid.show(
				'앱을 종료하려면 한 번 더 눌러주세요.',
				ToastAndroid.SHORT,
			);

			// 일정 시간 후 카운트 리셋
			if (toastTimerRef.current) {
				clearTimeout(toastTimerRef.current);
			}

			toastTimerRef.current = setTimeout(() => {
				backPressCount.current = 0;
			}, 2000);

			return true;
		};

		const backHandler = BackHandler.addEventListener(
			'hardwareBackPress',
			backAction,
		);

		return () => {
			backHandler.remove();
			backPressCount.current = 0;

			// 타이머 정리
			if (toastTimerRef.current) {
				clearTimeout(toastTimerRef.current);
				toastTimerRef.current = null;
			}
		};
	}, [isRootRoute, router]);
}
