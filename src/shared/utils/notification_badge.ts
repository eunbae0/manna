import * as Notifications from 'expo-notifications';

export const addBadgeCountAsync = async (): Promise<void> => {
	const badgeCount = await Notifications.getBadgeCountAsync();
	await Notifications.setBadgeCountAsync(badgeCount + 1);
};

export const getBadgeCountAsync = async (): Promise<number> => {
	return await Notifications.getBadgeCountAsync();
};

export const setBadgeCountAsync = async (badgeCount: number): Promise<void> => {
	await Notifications.setBadgeCountAsync(badgeCount);
};

export const resetBadgeCountAsync = async (): Promise<void> => {
	await Notifications.setBadgeCountAsync(0);
};
