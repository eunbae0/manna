import type { FirestoreUser } from '@/shared/types';
import type { FieldValue } from '@react-native-firebase/firestore';

export type GroupUser = Pick<
	FirestoreUser,
	'id' | 'displayName' | 'photoUrl' | 'statusMessage'
>;

/**
 * Group member role
 */
export type GroupMemberRole = 'leader' | 'member';

/**
 * Group member type
 */
export type GroupMember = GroupUser & {
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
	member: GroupMember;
};

/**
 * Input data for updating an existing group
 */
export type UpdateGroupInput = Partial<Omit<ClientGroup, 'id' | 'members'>>;

/**
 * Input data for adding a member to a group
 */
export type AddGroupMemberInput = GroupMember;

export type UpdateGroupMemberInput = Partial<
	Omit<AddGroupMemberInput, 'id'>
> & { id: string };

/**
 * Input data for joining a group via invite code
 */
export type JoinGroupInput = {
	inviteCode: string;
	member: GroupMember;
};
