import type { FieldValue } from '@react-native-firebase/firestore';

export type ServerMetadata = {
	createdAt: FieldValue;
	updatedAt: FieldValue;
	deletedAt?: FieldValue;
	isDeleted?: boolean;
};

export type ClientMetadata = {
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
	isDeleted?: boolean;
};
