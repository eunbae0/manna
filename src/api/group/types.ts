import type { FirestoreUser } from '@/shared/types';
import type { FieldValue } from '@react-native-firebase/firestore';

export type GroupUser = Pick<FirestoreUser, 'id' | 'displayName' | 'photoUrl'>;

/**
 * Group member role
 */
export type GroupMemberRole = 'leader' | 'member';

/**
 * Group member type
 */
export type GroupMember = {
	user: GroupUser;
	role: GroupMemberRole;
};

/**
 * Server-side Group with Firestore specific fields
 * Used for Firestore storage and retrieval
 */
export interface Group {
	id: string;
	groupName: string;
	inviteCode: string;
	members: GroupMember[];
	createdAt: FieldValue;
	updatedAt: FieldValue;
}

/**
 * Client-side Group with JavaScript Date objects
 * Used for application logic and UI rendering
 */
export interface ClientGroup {
	id: string;
	groupName: string;
	inviteCode: string;
	members: GroupMember[];
}

/**
 * Input data for creating a new group
 */
export type CreateGroupInput = Pick<ClientGroup, 'groupName'> & {
	user: GroupUser;
};

/**
 * Input data for updating an existing group
 */
export type UpdateGroupInput = Partial<Omit<ClientGroup, 'id' | 'inviteCode'>>;

/**
 * Input data for adding a member to a group
 */
export type AddGroupMemberInput = {
	user: GroupUser;
	role: GroupMemberRole;
};

/**
 * Input data for joining a group via invite code
 */
export type JoinGroupInput = {
	inviteCode: string;
	user: GroupUser;
};
