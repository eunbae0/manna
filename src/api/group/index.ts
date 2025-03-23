import type {
	ClientGroup,
	CreateGroupInput,
	UpdateGroupInput,
	AddGroupMemberInput,
	JoinGroupInput,
	GroupMemberRole,
	Group,
} from './types';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';
import { FirestoreGroupService } from './service';
import { updateUser } from '../auth';
import { database } from '@/firebase/config';
import { arrayUnion, doc } from 'firebase/firestore';

/**
 * Creates a group service instance
 * @returns Group service instance
 */
function createGroupService() {
	return new FirestoreGroupService();
}

/**
 * Fetches all groups
 * @returns Array of group data
 */
export const fetchGroupsByGroupIds = withApiLogging(
	async (groupIds: string[]): Promise<ClientGroup[]> => {
		try {
			const groupService = createGroupService();
			const result = await groupService.getGroupsByGroupIds(groupIds);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				count: result.length,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(result, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'fetchGroupsByGroupIds', 'group');
		}
	},
	'fetchGroupsByGroupIds',
	'group',
);

/**
 * Fetches a specific group by ID
 * @param groupId ID of the group to fetch
 * @returns Group data or null if not found
 */
export const fetchGroupById = withApiLogging(
	async (groupId: string): Promise<ClientGroup | null> => {
		try {
			const groupService = createGroupService();
			return await groupService.getGroupById(groupId);
		} catch (error) {
			throw handleApiError(error, 'fetchGroupById', 'group');
		}
	},
	'fetchGroupById',
	'group',
);

/**
 * Fetches groups that a user is a member of
 * @param userId ID of the user
 * @returns Array of group data
 */
export const fetchGroupsByUserId = withApiLogging(
	async (userId: string): Promise<ClientGroup[]> => {
		try {
			const groupService = createGroupService();
			const result = await groupService.getGroupsByUserId(userId);

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				count: result.length,
				userId,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(result, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'fetchGroupsByUserId', 'group');
		}
	},
	'fetchGroupsByUserId',
	'group',
);

/**
 * Fetches a group by invite code
 * @param inviteCode Invite code of the group
 * @returns Group data or null if not found
 */
export const fetchGroupByInviteCode = withApiLogging(
	async (inviteCode: string): Promise<ClientGroup | null> => {
		try {
			const groupService = createGroupService();
			return await groupService.getGroupByInviteCode(inviteCode);
		} catch (error) {
			throw handleApiError(error, 'fetchGroupByInviteCode', 'group');
		}
	},
	'fetchGroupByInviteCode',
	'group',
);

/**
 * Creates a new group
 * @param groupData Group data to be saved
 * @returns ID and invite code of the created group
 */
export const createGroup = withApiLogging(
	async (groupData: CreateGroupInput): Promise<Group> => {
		try {
			const groupService = createGroupService();
			return await groupService.createGroup(groupData);
		} catch (error) {
			throw handleApiError(error, 'createGroup', 'group');
		}
	},
	'createGroup',
	'group',
);

/**
 * Updates an existing group
 * @param groupId ID of the group to update
 * @param groupData Updated group data
 */
export const updateGroup = withApiLogging(
	async (groupId: string, groupData: UpdateGroupInput): Promise<void> => {
		try {
			const groupService = createGroupService();
			await groupService.updateGroup(groupId, groupData);
		} catch (error) {
			throw handleApiError(error, 'updateGroup', 'group');
		}
	},
	'updateGroup',
	'group',
);

/**
 * Deletes a group
 * @param groupId ID of the group to delete
 */
export const deleteGroup = withApiLogging(
	async (groupId: string): Promise<void> => {
		try {
			const groupService = createGroupService();
			await groupService.deleteGroup(groupId);
		} catch (error) {
			throw handleApiError(error, 'deleteGroup', 'group');
		}
	},
	'deleteGroup',
	'group',
);

/**
 * Adds a member to a group
 * @param groupId ID of the group
 * @param memberData Member data to add
 */
export const addGroupMember = withApiLogging(
	async (groupId: string, memberData: AddGroupMemberInput): Promise<void> => {
		try {
			const groupService = createGroupService();
			await groupService.addGroupMember(groupId, memberData);
		} catch (error) {
			throw handleApiError(error, 'addGroupMember', 'group');
		}
	},
	'addGroupMember',
	'group',
);

/**
 * Removes a member from a group
 * @param groupId ID of the group
 * @param userId ID of the user to remove
 */
export const removeGroupMember = withApiLogging(
	async (groupId: string, userId: string): Promise<void> => {
		try {
			const groupService = createGroupService();
			await groupService.removeGroupMember(groupId, userId);
		} catch (error) {
			throw handleApiError(error, 'removeGroupMember', 'group');
		}
	},
	'removeGroupMember',
	'group',
);

/**
 * Updates a member's role in a group
 * @param groupId ID of the group
 * @param userId ID of the user
 * @param isLeader Whether the user should be a leader
 */
export const updateMemberRole = withApiLogging(
	async (
		groupId: string,
		userId: string,
		role: GroupMemberRole,
	): Promise<void> => {
		try {
			const groupService = createGroupService();
			await groupService.updateMemberRole(groupId, userId, role);
		} catch (error) {
			throw handleApiError(error, 'updateMemberRole', 'group');
		}
	},
	'updateMemberRole',
	'group',
);

/**
 * Join a group using an invite code
 * @param joinData Join group data
 * @returns ID of the joined group
 */
export const joinGroup = withApiLogging(
	async (joinData: JoinGroupInput): Promise<string> => {
		try {
			const groupService = createGroupService();
			return await groupService.joinGroup(joinData);
		} catch (error) {
			throw handleApiError(error, 'joinGroup', 'group');
		}
	},
	'joinGroup',
	'group',
);

/**
 * Regenerate a group's invite code
 * @param groupId ID of the group
 * @returns New invite code
 */
export const regenerateInviteCode = withApiLogging(
	async (groupId: string): Promise<string> => {
		try {
			const groupService = createGroupService();
			return await groupService.regenerateInviteCode(groupId);
		} catch (error) {
			throw handleApiError(error, 'regenerateInviteCode', 'group');
		}
	},
	'regenerateInviteCode',
	'group',
);
