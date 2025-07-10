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
	UpdateGroupMemberInput,
	CoverImage,
} from './types';
import { v4 as uuidv4 } from 'uuid';
import { getUserGroups } from '../user';
import { FIREBASE_STORAGE_IMAGE_BASE_URL } from '@/shared/constants/firebase';
import { changeImageFormat } from '@/shared/utils/resize_image';
import { uploadImageAsync } from '@/shared/utils/firebase';

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
	private readonly subCollectionPath: string = 'members';

	/**
	 * Converts a Firestore group to a client group
	 * @param id Group ID
	 * @param data Firestore group data
	 * @returns Client group
	 */
	public convertToClientGroup(
		id: string,
		group: Group,
		groupMembers: GroupMember[],
	): ClientGroup {
		return {
			id,
			groupName: group.groupName,
			inviteCode: group.inviteCode,
			members: groupMembers,
			coverImages: group.coverImages,
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
		const q = query(groupsRef, where('id', 'in', groupIds));
		const querySnapshot = await getDocs(q);

		// 그룹 ID를 키로, 그룹 객체를 값으로 하는 Map 생성
		const groupMap = new Map<string, ClientGroup>();
		for (const doc of querySnapshot.docs) {
			const group = doc.data() as Group;
			const groupMembers = await this.getGroupMembers(doc.id);
			const clientGroup = this.convertToClientGroup(
				doc.id,
				group,
				groupMembers,
			);
			groupMap.set(clientGroup.id, clientGroup);
		}

		// 입력된 groupIds 순서대로 결과 배열 구성
		const sortedGroups: ClientGroup[] = [];
		for (const groupId of groupIds) {
			const group = groupMap.get(groupId);
			if (group) {
				sortedGroups.push(group);
			}
		}

		return sortedGroups;
	}

	/**
	 * Gets a specific group by ID
	 * @param groupId ID of the group
	 * @returns Group data or null if not found
	 */
	async getGroupById(groupId: string): Promise<Group | null> {
		const groupRef = doc(database, this.collectionPath, groupId);
		const groupDoc = await getDoc(groupRef);

		if (!groupDoc.exists()) {
			return null;
		}

		return groupDoc.data() as Group;
	}

	/**
	 * Gets groups by user ID
	 * @param userId ID of the user
	 * @returns Array of groups that the user is a member of
	 */
	async getGroupsByUserId(userId: string): Promise<ClientGroup[]> {
		const userGroups = await getUserGroups(userId);

		if (!userGroups) {
			return [];
		}

		const groups: ClientGroup[] = [];
		for (const userGroup of userGroups) {
			const group = await this.getGroupById(userGroup.groupId);
			if (!group) {
				continue;
			}
			const groupMembers = await this.getGroupMembers(userGroup.groupId);
			groups.push(
				this.convertToClientGroup(userGroup.groupId, group, groupMembers),
			);
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

		const group = doc.data() as Group;
		const groupMembers = await this.getGroupMembers(doc.id);

		return this.convertToClientGroup(doc.id, group, groupMembers);
	}

	/**
	 * Creates a new group
	 * @param groupData Group data to be saved
	 * @returns ID and invite code of the created group
	 */
	async createGroup({
		groupName,
	}: Pick<CreateGroupInput, 'groupName'>): Promise<Group> {
		const id = uuidv4();
		const groupRef = doc(database, this.collectionPath, id);

		// Generate a unique 6-character invite code
		const inviteCode = this.generateInviteCode();

		// TODO: coverImage 포함하도록 수정
		const data: Omit<Group, 'coverImages'> = {
			groupName,
			id,
			inviteCode,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};

		await setDoc(groupRef, data);
		return {
			...data,
			coverImages: [],
		};
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

		if (groupData.coverImages) {
			const path = `${FIREBASE_STORAGE_IMAGE_BASE_URL}/groups/${groupId}/coverImage`;

			const coverImages: CoverImage[] = [];
			for (const image of groupData.coverImages) {
				if (image.uri.includes('firebasestorage')) {
					coverImages.push(image);
					continue;
				}
				const imageId = uuidv4();
				const resizedPhotoUrl = await changeImageFormat(image.uri);
				const photoUrl = await uploadImageAsync(
					resizedPhotoUrl,
					`${path}/${imageId}`,
				);
				coverImages.push({
					...image,
					uri: photoUrl,
				});
			}
			groupData.coverImages = coverImages;
		}

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

	// Group Member

	async getGroupMembers(groupId: string): Promise<GroupMember[]> {
		const groupMembersRef = collection(
			database,
			this.collectionPath,
			groupId,
			this.subCollectionPath,
		);
		const querySnapshot = await getDocs(groupMembersRef);

		const members: GroupMember[] = [];
		for (const doc of querySnapshot.docs) {
			const data = doc.data();
			members.push(data as GroupMember);
		}

		return members;
	}

	async getGroupMember(
		groupId: string,
		userId: string,
	): Promise<GroupMember | null> {
		const groupMemberRef = doc(
			database,
			this.collectionPath,
			groupId,
			this.subCollectionPath,
			userId,
		);
		const groupMemberDoc = await getDoc(groupMemberRef);

		if (!groupMemberDoc.exists()) {
			return null;
		}
		return groupMemberDoc.data() as GroupMember;
	}

	/**
	 * Adds a member to a group
	 * @param groupId ID of the group
	 * @param memberData Member data to add
	 */
	async addGroupMember(
		groupId: string,
		memberData: AddGroupMemberInput,
	): Promise<GroupMember> {
		const grouopMemberRef = doc(
			database,
			this.collectionPath,
			groupId,
			this.subCollectionPath,
			memberData.id,
		);
		const newUser = Object.assign(
			{ id: memberData.id },
			memberData.displayName ? { displayName: memberData.displayName } : {},
			memberData.photoUrl ? { photoUrl: memberData.photoUrl } : {},
			{ role: memberData.role },
		) as GroupMember;

		await setDoc(grouopMemberRef, newUser);
		return newUser;
	}

	/**
	 * Removes a member from a group
	 * @param groupId ID of the group
	 * @param userId ID of the user to remove
	 */
	async removeGroupMember(groupId: string, userId: string): Promise<void> {
		const groupMemberRef = doc(
			database,
			this.collectionPath,
			groupId,
			this.subCollectionPath,
			userId,
		);
		await deleteDoc(groupMemberRef);
	}

	/**
	 * Updates a member's role in a group
	 * @param groupId ID of the group
	 * @param userId ID of the user
	 * @param role Role of the user
	 */
	async updateGroupMember(
		groupId: string,
		memberData: UpdateGroupMemberInput,
	): Promise<void> {
		const groupMemberRef = doc(
			database,
			this.collectionPath,
			groupId,
			this.subCollectionPath,
			memberData.id,
		);

		await updateDoc(groupMemberRef, memberData);
	}

	/**
	 * Join a group using an invite code
	 * @param joinData Join group data
	 * @returns ID of the joined group
	 */
	async joinGroup(joinData: JoinGroupInput): Promise<ClientGroup> {
		const { inviteCode, member } = joinData;

		const group = await this.getGroupByInviteCode(inviteCode);

		if (!group) {
			throw new Error(`${inviteCode}에 해당하는 그룹이 없어요`);
		}

		if (group.members.find((m) => m.id === member.id)) {
			throw new Error('이미 해당 소그룹에 참여하고 있어요');
		}

		await this.addGroupMember(group.id, member);

		return group;
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
