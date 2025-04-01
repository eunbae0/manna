import {
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
	deleteDoc,
	serverTimestamp,
	query,
	where,
	orderBy,
	type FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { database } from '@/firebase/config';
import type {
	Group,
	ClientGroup,
	CreateGroupInput,
	UpdateGroupInput,
	GroupMember,
	AddGroupMemberInput,
	JoinGroupInput,
	GroupMemberRole,
	GroupUser,
} from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Firestore service for group operations
 */
export class FirestoreGroupService {
	// 싱글톤 인스턴스를 저장할 정적 변수
	private static instance: FirestoreGroupService | null = null;

	// 싱글톤 인스턴스를 반환하는 정적 메서드
	public static getInstance(): FirestoreGroupService {
		if (!FirestoreGroupService.instance) {
			FirestoreGroupService.instance = new FirestoreGroupService();
		}
		return FirestoreGroupService.instance;
	}

	// 생성자를 private으로 설정하여 외부에서 인스턴스 생성을 방지
	private constructor() {}
	private readonly collectionPath: string = 'groups';

	/**
	 * Converts a Firestore group to a client group
	 * @param id Group ID
	 * @param data Firestore group data
	 * @returns Client group
	 */
	private convertToClientGroup(
		id: string,
		data: FirebaseFirestoreTypes.DocumentData,
	): ClientGroup {
		return {
			id,
			groupName: data.groupName,
			inviteCode: data.inviteCode,
			members: data.members || [],
		};
	}

	private generateInviteCode(): string {
		return uuidv4().substring(0, 6).toUpperCase();
	}

	/**
	 * Gets all groups
	 * @returns Array of groups
	 */
	async getGroupsByGroupIds(groupIds: string[]): Promise<ClientGroup[]> {
		const groupsRef = collection(database, this.collectionPath);
		const q = query(
			groupsRef,
			where('id', 'in', groupIds),
			orderBy('createdAt', 'desc'),
		);
		const querySnapshot = await getDocs(q);

		const groups: ClientGroup[] = [];
		for (const doc of querySnapshot.docs) {
			const data = doc.data();
			groups.push(this.convertToClientGroup(doc.id, data));
		}

		return groups;
	}

	/**
	 * Gets a specific group by ID
	 * @param groupId ID of the group
	 * @returns Group data or null if not found
	 */
	async getGroupById(groupId: string): Promise<ClientGroup | null> {
		const groupRef = doc(database, this.collectionPath, groupId);
		const groupDoc = await getDoc(groupRef);

		if (!groupDoc.exists) {
			return null;
		}

		const data = groupDoc.data() || {};
		return this.convertToClientGroup(groupDoc.id, data);
	}

	/**
	 * Gets groups by user ID
	 * @param userId ID of the user
	 * @returns Array of groups that the user is a member of
	 */
	async getGroupsByUserId(userId: string): Promise<ClientGroup[]> {
		const userRef = doc(database, `users/${userId}`);
		const groupsRef = collection(database, this.collectionPath);

		// Query for groups where the user is a member
		const q = query(
			groupsRef,
			where('members', 'array-contains', {
				user: userRef,
				isLeader: false,
			}),
		);

		const querySnapshot = await getDocs(q);

		const groups: ClientGroup[] = [];
		for (const doc of querySnapshot.docs) {
			const data = doc.data();
			groups.push(this.convertToClientGroup(doc.id, data));
		}

		return groups;
	}

	/**
	 * Gets a group by invite code
	 * @param inviteCode Invite code of the group
	 * @returns Group data or null if not found
	 */
	async getGroupByInviteCode(inviteCode: string): Promise<ClientGroup | null> {
		const groupsRef = collection(database, this.collectionPath);
		const q = query(groupsRef, where('inviteCode', '==', inviteCode));
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) {
			return null;
		}

		const doc = querySnapshot.docs[0];
		const data = doc.data();
		return this.convertToClientGroup(doc.id, data);
	}

	/**
	 * Creates a new group
	 * @param groupData Group data to be saved
	 * @returns ID and invite code of the created group
	 */
	async createGroup({ groupName, user }: CreateGroupInput): Promise<Group> {
		const id = uuidv4();
		const groupRef = doc(database, this.collectionPath, id);

		// Generate a unique 6-character invite code
		const inviteCode = this.generateInviteCode();

		const data: Group = {
			groupName,
			id,
			inviteCode,
			members: [{ role: 'leader', user }],
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};

		await setDoc(groupRef, data);
		return data;
	}

	/**
	 * Updates an existing group
	 * @param groupId ID of the group to update
	 * @param groupData Updated group data
	 */
	async updateGroup(
		groupId: string,
		groupData: UpdateGroupInput,
	): Promise<void> {
		const groupRef = doc(database, this.collectionPath, groupId);

		const data: Record<string, any> = {
			...groupData,
			updatedAt: serverTimestamp(),
		};

		await updateDoc(groupRef, data);
	}

	/**
	 * Deletes a group
	 * @param groupId ID of the group to delete
	 */
	async deleteGroup(groupId: string): Promise<void> {
		const groupRef = doc(database, this.collectionPath, groupId);
		await deleteDoc(groupRef);
	}

	/**
	 * Adds a member to a group
	 * @param groupId ID of the group
	 * @param memberData Member data to add
	 */
	async addGroupMember(
		groupId: string,
		memberData: AddGroupMemberInput,
	): Promise<void> {
		const group = await this.getGroupById(groupId);

		if (!group) {
			throw new Error(`Group with ID ${groupId} not found`);
		}

		// Check if the user is already a member
		const existingMemberIndex = group.members.findIndex(
			(member) => member.user.id === memberData.user.id,
		);

		if (existingMemberIndex >= 0) {
			throw new Error('User is already a member of this group');
		}

		const newUser = Object.assign(
			{ id: memberData.user.id },
			memberData.user.displayName
				? { displayName: memberData.user.displayName }
				: {},
			memberData.user.photoUrl ? { photoUrl: memberData.user.photoUrl } : {},
		) as GroupUser;

		const newMember: GroupMember = {
			user: newUser,
			role: memberData.role,
		};

		const updatedMembers = [...group.members, newMember];

		await this.updateGroup(groupId, {
			members: updatedMembers,
		});
	}

	/**
	 * Removes a member from a group
	 * @param groupId ID of the group
	 * @param userId ID of the user to remove
	 */
	async removeGroupMember(groupId: string, userId: string): Promise<void> {
		const group = await this.getGroupById(groupId);

		if (!group) {
			throw new Error(`Group with ID ${groupId} not found`);
		}

		if (group.members.length <= 1) {
			throw new Error('Cannot remove last member from group');
		}

		// Find the member to remove
		const memberIndex = group.members.findIndex(
			(member) => member.user.id === userId,
		);

		if (memberIndex < 0) {
			throw new Error('User is not a member of this group');
		}

		// Remove the member
		const updatedMembers = [
			...group.members.slice(0, memberIndex),
			...group.members.slice(memberIndex + 1),
		];

		await this.updateGroup(groupId, {
			members: updatedMembers,
		});
	}

	/**
	 * Updates a member's role in a group
	 * @param groupId ID of the group
	 * @param userId ID of the user
	 * @param role Role of the user
	 */
	async updateMemberRole(
		groupId: string,
		userId: string,
		role: GroupMemberRole,
	): Promise<void> {
		const group = await this.getGroupById(groupId);

		if (!group) {
			throw new Error('Group with ID ${groupId} not found');
		}

		const userRef = doc(database, `users/${userId}`);

		// Find the member to update
		const memberIndex = group.members.findIndex(
			(member) => (member.user as any).path === userRef.path,
		);

		if (memberIndex < 0) {
			throw new Error('User is not a member of this group');
		}

		// Update the member's role
		const updatedMembers = [...group.members];
		updatedMembers[memberIndex] = {
			...updatedMembers[memberIndex],
			role,
		};

		await this.updateGroup(groupId, {
			members: updatedMembers,
		});
	}

	/**
	 * Join a group using an invite code
	 * @param joinData Join group data
	 * @returns ID of the joined group
	 */
	async joinGroup(joinData: JoinGroupInput): Promise<string> {
		const { inviteCode, user } = joinData;

		const group = await this.getGroupByInviteCode(inviteCode);

		if (!group) {
			throw new Error(`Group with invite code ${inviteCode} not found`);
		}

		await this.addGroupMember(group.id, {
			user,
			role: 'member',
		});

		return group.id;
	}

	/**
	 * Regenerate a group's invite code
	 * @param groupId ID of the group
	 * @returns New invite code
	 */
	async regenerateInviteCode(groupId: string): Promise<string> {
		const group = await this.getGroupById(groupId);

		if (!group) {
			throw new Error(`Group with ID ${groupId} not found`);
		}

		// Generate a new unique 6-character invite code
		const newInviteCode = this.generateInviteCode();

		const groupRef = doc(database, this.collectionPath, groupId);

		await updateDoc(groupRef, {
			inviteCode: newInviteCode,
			updatedAt: serverTimestamp(),
		});

		return newInviteCode;
	}
}

export const getGroupService = (): FirestoreGroupService => {
	return FirestoreGroupService.getInstance();
};
