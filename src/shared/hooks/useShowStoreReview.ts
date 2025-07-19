import { storeReviewStorage } from '@/storage';
import * as StoreReview from 'expo-store-review';
import { useCallback } from 'react';

const APP_LAUNCH_COUNT = 'appLaunchCount';
const LAST_REVIEW_SHOWN_AT = 'lastReviewShownAt';

const 삽십일 = 30 * 24 * 60 * 60 * 1000;

const 최소_앱_시작_횟수 = 3;
const 표시까지_남은시간 = 0.5 * 1000;

export function useShowStoreReview() {
	const incrementAppLaunchCount = useCallback(() => {
		const count = storeReviewStorage.getNumber(APP_LAUNCH_COUNT) || 0;
		storeReviewStorage.set(APP_LAUNCH_COUNT, count + 1);
	}, []);

	const showReview = async () => {
		await new Promise((resolve) => setTimeout(resolve, 표시까지_남은시간));

		const isAvailable = await StoreReview.isAvailableAsync();
		if (!isAvailable) {
			return;
		}
		const hasAction = await StoreReview.hasAction();
		if (!hasAction) return;

		const appLaunchCount = storeReviewStorage.getNumber(APP_LAUNCH_COUNT) || 0;
		const lastReviewShownAt =
			storeReviewStorage.getNumber(LAST_REVIEW_SHOWN_AT) || 0;

		const thirthyDaysAgo = Date.now() - 삽십일;

		// 5번 이상 실행하고, 마지막 리뷰 요청 후 30일이 지났을 때만 표시
		const shouldShow =
			appLaunchCount >= 최소_앱_시작_횟수 && lastReviewShownAt < thirthyDaysAgo;

		if (shouldShow) {
			await StoreReview.requestReview();
			storeReviewStorage.set(LAST_REVIEW_SHOWN_AT, Date.now());
			storeReviewStorage.set(APP_LAUNCH_COUNT, 0); // 카운트 초기화
		}
	};

	return { incrementAppLaunchCount, showReview };
}
