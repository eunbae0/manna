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

	date.setUTCHours(0, 0, 0, 0);

	return date;
};
