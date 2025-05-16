/**
 * App version config
 */
export type AppVersionConfig = {
	minVersion: string;
	latestVersion: string;
	forceUpdate: boolean;
	updateMessage: string;
};

export interface UpdateNote {
	title: string;
	description: string;
	imageUrls?: string[];
}

export interface AppUpdate {
	version: string;
	releaseDate: Date;
	notes: UpdateNote[];
	isActive: boolean;
}
