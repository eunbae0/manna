import type { YYYYMMDD } from '@/types/date';

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
