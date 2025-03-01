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
