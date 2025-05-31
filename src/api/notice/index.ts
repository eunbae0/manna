import type { Notice } from './types';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';
import { getNoticeService } from './service';

/**
 * Fetches all notices
 * @returns Array of notices or null if not found
 */
export const fetchAllNotices = withApiLogging(
	async (): Promise<Notice[] | null> => {
		try {
			const noticeService = getNoticeService();
			return await noticeService.getAllNotices();
		} catch (error) {
			throw handleApiError(error, 'fetchAllNotices', 'notice');
		}
	},
	'fetchAllNotices',
	'notice',
);

/**
 * Fetches a notice by ID
 * @param id Notice ID
 * @returns Notice data or null if not found
 */
export const fetchNoticeById = withApiLogging(
	async (id: string): Promise<Notice | null> => {
		try {
			const noticeService = getNoticeService();
			return await noticeService.getNoticeById(id);
		} catch (error) {
			throw handleApiError(error, 'fetchNoticeById', 'notice');
		}
	},
	'fetchNoticeById',
	'notice',
);

/**
 * Fetches all pinned notices
 * @returns Array of pinned notices or null if not found
 */
export const fetchPinnedNotices = withApiLogging(
	async (): Promise<Notice[] | null> => {
		try {
			const noticeService = getNoticeService();
			return await noticeService.getPinnedNotices();
		} catch (error) {
			throw handleApiError(error, 'fetchPinnedNotices', 'notice');
		}
	},
	'fetchPinnedNotices',
	'notice',
);

/**
 * Fetches all notices that should be displayed on the main screen
 * @returns Array of notices for main screen or null if not found
 */
export const fetchMainScreenNotices = withApiLogging(
	async (): Promise<Notice[] | null> => {
		try {
			const noticeService = getNoticeService();
			return await noticeService.getMainScreenNotices();
		} catch (error) {
			throw handleApiError(error, 'fetchMainScreenNotices', 'notice');
		}
	},
	'fetchMainScreenNotices',
	'notice',
);

export * from './types';
