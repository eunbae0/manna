import type {
	ClientGroup,
	CreateGroupInput,
	UpdateGroupInput,
	AddGroupMemberInput,
	JoinGroupInput,
	GroupMemberRole,
	Group,
	UpdateGroupMemberInput,
} from './types';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';
import { getGroupService } from './service';
import { getUserService } from '../user/service';

/**
 * Fetches all groups
 * @returns Array of group data
 */
export const fetchGroupsByGroupIds = withApiLogging(
	async (groupIds: string[]): Promise<ClientGroup[]> => {
		try {
			const groupService = getGroupService();
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
			const groupService = getGroupService();
			const group = await groupService.getGroupById(groupId);
			if (!group) {
				return null;
			}
			const groupMembers = await groupService.getGroupMembers(groupId);
			return groupService.convertToClientGroup(groupId, group, groupMembers);
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
			const groupService = getGroupService();
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
			const groupService = getGroupService();
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
	async (groupData: CreateGroupInput): Promise<ClientGroup> => {
		try {
			const groupService = getGroupService();

			const group = await groupService.createGroup(groupData);
			const groupMember = await groupService.addGroupMember(
				group.id,
				groupData.member,
			);
			return groupService.convertToClientGroup(group.id, group, [groupMember]);
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
			const groupService = getGroupService();
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
 * @param memberIds IDs of the members of the group
 * @param groupId ID of the group to delete
 */
export const deleteGroup = withApiLogging(
	async (memberIds: string[], groupId: string): Promise<void> => {
		try {
			const groupService = getGroupService();
			const userService = getUserService();
			await groupService.deleteGroup(groupId);
			for (const memberId of memberIds) {
				await userService.removeUserGroup(memberId, groupId);
			}
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
			const groupService = getGroupService();
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
			const groupService = getGroupService();
			const userService = getUserService();
			await groupService.removeGroupMember(groupId, userId);
			await userService.removeUserGroup(userId, groupId);
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
export const updateGroupMember = withApiLogging(
	async (
		groupId: string,
		memberData: UpdateGroupMemberInput,
	): Promise<void> => {
		try {
			const groupService = getGroupService();
			await groupService.updateGroupMember(groupId, memberData);
		} catch (error) {
			throw handleApiError(error, 'updateGroupMember', 'group');
		}
	},
	'updateGroupMember',
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
			const groupService = getGroupService();
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
			const groupService = getGroupService();
			return await groupService.regenerateInviteCode(groupId);
		} catch (error) {
			throw handleApiError(error, 'regenerateInviteCode', 'group');
		}
	},
	'regenerateInviteCode',
	'group',
);
