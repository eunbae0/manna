import {
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	serverTimestamp,
} from '@react-native-firebase/firestore';
import { database } from '@/firebase/config';
import { v4 as uuidv4 } from 'uuid';
import type { PraiseContiTag } from '../../types';
import type {
	CreatePraiseContiTagRequest,
	UpdatePraiseContiTagRequest,
	DeletePraiseContiTagRequest,
	GetPraiseContiTagRequest,
} from './types';

class PraiseContiTagService {
	private static instance: PraiseContiTagService | null = null;

	public static getInstance(): PraiseContiTagService {
		if (!PraiseContiTagService.instance) {
			PraiseContiTagService.instance = new PraiseContiTagService();
		}
		return PraiseContiTagService.instance;
	}

	private getTagsCollection() {
		return collection(database, 'praise_conti_tags');
	}

	async getPraiseContiTag(
		request: GetPraiseContiTagRequest,
	): Promise<PraiseContiTag | null> {
		const docRef = doc(this.getTagsCollection(), request.tagId);
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			return null;
		}

		const data = docSnap.data() as PraiseContiTag;
		return data;
	}

	async getAllPraiseContiTags(): Promise<PraiseContiTag[]> {
		const querySnapshot = await getDocs(
			this.getTagsCollection().where('metadata.isDeleted', '!=', true),
		);
		const tags: PraiseContiTag[] = [];
		for (const doc of querySnapshot.docs) {
			const data = doc.data() as PraiseContiTag;
			tags.push(data);
		}
		return tags;
	}

	async createPraiseContiTag(
		request: CreatePraiseContiTagRequest,
	): Promise<PraiseContiTag> {
		const newId = uuidv4();
		const newTag: PraiseContiTag = {
			id: newId,
			...request,
			metadata: {
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				isDeleted: false,
			},
		};
		await setDoc(doc(this.getTagsCollection(), newId), newTag);
		return newTag;
	}

	async updatePraiseContiTag(
		request: UpdatePraiseContiTagRequest,
	): Promise<void> {
		const tagRef = doc(this.getTagsCollection(), request.id);
		await setDoc(
			tagRef,
			{
				...request,
				metadata: {
					...request.metadata,
					updatedAt: serverTimestamp(),
				},
			},
			{ merge: true },
		);
	}

	async deletePraiseContiTag(
		request: DeletePraiseContiTagRequest,
	): Promise<void> {
		const tagRef = doc(this.getTagsCollection(), request.tagId);
		await setDoc(
			tagRef,
			{
				metadata: {
					isDeleted: true,
					deletedAt: serverTimestamp(),
					updatedAt: serverTimestamp(),
				},
			},
			{ merge: true },
		);
	}
}

export const getPraiseContiTagService = (): PraiseContiTagService => {
	return PraiseContiTagService.getInstance();
};
