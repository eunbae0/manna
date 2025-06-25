import type { YYYYMMDD } from '@/shared/types/date';

export const getKSTDate = (date: Date): YYYYMMDD => {
	return new Intl.DateTimeFormat('ko-KR', {
		timeZone: 'Asia/Seoul',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	})
		.format(date)
		.replace(/\. /g, '-')
		.replace(/\.$/, '') as YYYYMMDD;
};

export const parseKSTDate = (kstDateString: YYYYMMDD): Date => {
	const [year, month, day] = kstDateString.split('-').map(Number);

	const date = new Date(Date.UTC(year, month - 1, day));

	return date;
};

/**
 * Get the start of day in KST timezone (00:00:00.000)
 * @param date Date object
 * @returns Date object set to start of day in KST
 */
export const getStartOfDayKST = (date: Date): Date => {
	const kstDate = new Date(date);

	kstDate.setHours(0, 0, 0, 0);
	return kstDate;
};

/**
 * Get the end of day in KST timezone (23:59:59.999)
 * @param date Date object
 * @returns Date object set to end of day in KST
 */
export const getEndOfDayKST = (date: Date): Date => {
	const kstDate = new Date(date);

	kstDate.setHours(23, 59, 59, 999);
	return kstDate;
};

export type DateFormatStyle = 'dot' | 'text';

export interface DateFormatOptions {
	/**
	 * 날짜 형식 스타일 ('dot': 2025.01.01, 'text': 2025년 01월 01일)
	 * @default 'dot'
	 */
	style?: DateFormatStyle;

	/**
	 * 연도 표시 여부
	 * @default true
	 */
	showYear?: boolean;

	/**
	 * 월 표시 여부
	 * @default true
	 */
	showMonth?: boolean;

	/**
	 * 일 표시 여부
	 * @default true
	 */
	showDay?: boolean;

	/**
	 * 시간 표시 여부
	 * @default false
	 */
	showTime?: boolean;

	/**
	 * 분 표시 여부 (showTime이 true일 때만 적용)
	 * @default true
	 */
	showMinutes?: boolean;

	/**
	 * 초 표시 여부 (showTime이 true일 때만 적용)
	 * @default false
	 */
	showSeconds?: boolean;
}

export const formatLocalDate = (date: Date, options?: DateFormatOptions) => {
	const {
		style = 'dot',
		showYear = true,
		showMonth = true,
		showDay = true,
		showTime = false,
		showMinutes = true,
		showSeconds = false,
	} = options || {};

	// 날짜 부분 포맷 설정
	const dateOptions: Intl.DateTimeFormatOptions = {};

	if (showYear) dateOptions.year = 'numeric';
	if (showMonth) dateOptions.month = '2-digit';
	if (showDay) dateOptions.day = '2-digit';

	// 시간 부분 포맷 설정
	if (showTime) {
		dateOptions.hour = '2-digit';
		dateOptions.hour12 = false;

		if (showMinutes) {
			dateOptions.minute = '2-digit';
		}

		if (showSeconds) {
			dateOptions.second = '2-digit';
		}
	}

	// 기본 포맷팅
	let formatted = date.toLocaleDateString('ko-KR', dateOptions);

	// 스타일에 따른 후처리
	if (style === 'dot') {
		formatted = formatted.replace(/\. /g, '.').replace(/\.$/, '');

		if (showTime) {
			// 시간 부분 처리: "2025.01.01 13:45:30" 형식으로 변환
			formatted = formatted.replace(/ (\d+)시 ?/, ' $1:');
			formatted = formatted.replace(/(\d+)분 ?/, '$1');
			formatted = formatted.replace(/ (\d+)초?/, ':$1');
		}
	} else {
		formatted = formatted.replace(/\. /g, '월 ').replace(/\.$/, '일');

		if (showTime) {
			// 시간 부분은 그대로 유지 ("2025년 01월 01일 13시 45분 30초" 형식)
		}
	}

	return formatted;
};
