export const FELLOWSHIP_QUERY_KEY = 'fellowship';
export const FELLOWSHIPS_QUERY_KEY = 'fellowships';

export const INFINITE_FELLOWSHIPS_QUERY_KEY = [
	FELLOWSHIPS_QUERY_KEY,
	'infinite',
] as const;

export const USER_FELLOWSHIPS_QUERY_KEY = [
	FELLOWSHIPS_QUERY_KEY,
	'user',
] as const;

export const RECENT_FELLOWSHIPS_QUERY_KEY = [
	FELLOWSHIPS_QUERY_KEY,
	'recent',
] as const;

export const CALENDAR_FELLOWSHIPS_QUERY_KEY = [
	FELLOWSHIPS_QUERY_KEY,
	'calendar-dates',
] as const;

export const SELECTED_DATE_FELLOWSHIPS_QUERY_KEY = [
	FELLOWSHIPS_QUERY_KEY,
	'by-date',
] as const;
