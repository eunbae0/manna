import { useState, useEffect } from 'react';

const DEFAULT_DELAY_MS = 225;

/**
 * 값이 false로 변경될 때 지정된 시간만큼 지연시키는 훅
 * 주로 로딩 상태를 일정 시간 유지하는 데 사용
 *
 * @param value 원본 값 (주로 isLoading과 같은 boolean 값)
 * @param delayMs false로 변경될 때 지연할 시간(ms), 기본값 400ms
 * @returns 지연된 값
 */
export function useDelayedValue(
	value: boolean,
	delayMs = DEFAULT_DELAY_MS,
): boolean {
	const [delayedValue, setDelayedValue] = useState(value);

	useEffect(() => {
		// 값이 true로 바뀌면 즉시 반영
		if (value) {
			setDelayedValue(true);
			return;
		}

		// 값이 false로 바뀌면 지정된 시간 후에 반영
		const timer = setTimeout(() => {
			setDelayedValue(false);
		}, delayMs);

		return () => clearTimeout(timer);
	}, [value, delayMs]);

	return delayedValue;
}
