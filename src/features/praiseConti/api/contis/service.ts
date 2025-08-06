import {
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	query,
	orderBy,
	limit as firestoreLimit,
	startAfter,
	serverTimestamp,
	where,
} from '@react-native-firebase/firestore';

import type {
	ClientPraiseConti,
	ServerPraiseConti,
} from '@/features/praiseConti/types';
import { database } from '@/firebase/config';
import { v4 as uuidv4 } from 'uuid';
import type {
	CreatePraiseContiRequest,
	DeletePraiseContiRequest,
	GetPraiseContiListRequest,
	GetPraiseContiListResponse,
	UpdatePraiseContiRequest,
	GetPraiseContiRequest,
} from './types';

class FirestorePraiseContiService {
	private static instance: FirestorePraiseContiService | null = null;

	public static getInstance(): FirestorePraiseContiService {
		if (!FirestorePraiseContiService.instance) {
			FirestorePraiseContiService.instance = new FirestorePraiseContiService();
		}
		return FirestorePraiseContiService.instance;
	}

	private getPraiseContisCollection(groupId: string) {
		return collection(database, 'groups', groupId, 'praise_contis');
	}

	// convert songs type
	private convertSongsToServer(
		songs: ClientPraiseConti['songs'],
	): ServerPraiseConti['songs'] {
		return songs.reduce(
			(acc, song) => {
				acc[song.id] = song;
				return acc;
			},
			{} as ServerPraiseConti['songs'],
		);
	}
	private convertSongsToClient(
		songs: ServerPraiseConti['songs'],
	): ClientPraiseConti['songs'] {
		return Object.values(songs).sort((a, b) => a.order - b.order);
	}

	// convert tags type
	private convertTagsToServer(
		tags: ClientPraiseConti['tags'],
	): ServerPraiseConti['tags'] {
		return tags.reduce(
			(acc, tag) => {
				acc[tag.id] = tag;
				return acc;
			},
			{} as ServerPraiseConti['tags'],
		);
	}
	private convertTagsToClient(
		tags: ServerPraiseConti['tags'],
	): ClientPraiseConti['tags'] {
		return Object.values(tags).sort((a, b) => a.name.localeCompare(b.name));
	}

	async getPraiseConti(
		props: GetPraiseContiRequest,
	): Promise<ClientPraiseConti | null> {
		const { groupId, praiseContiId } = props;
		const praiseContiRef = doc(
			this.getPraiseContisCollection(groupId),
			praiseContiId,
		);
		const docSnap = await getDoc(praiseContiRef);

		if (!docSnap.exists) {
			return null;
		}

		const serverPraiseConti = docSnap.data() as ServerPraiseConti;
		return {
			...serverPraiseConti,
			metadata: {
				...serverPraiseConti.metadata,
				createdAt: serverPraiseConti.metadata.createdAt.toDate() as Date,
				updatedAt: serverPraiseConti.metadata.updatedAt.toDate() as Date,
			},
			tags: this.convertTagsToClient(serverPraiseConti.tags),
			songs: this.convertSongsToClient(serverPraiseConti.songs),
		};
	}

	async getPraiseContiList(
		props: GetPraiseContiListRequest,
	): Promise<GetPraiseContiListResponse> {
		const { groupId, lastVisible, limit = 10 } = props;
		const praiseContisCollection = this.getPraiseContisCollection(groupId);

		const queries = [where('metadata.isDeleted', '!=', true)];
		if (lastVisible) {
			queries.push(startAfter(lastVisible));
		}
		if (limit) {
			queries.push(firestoreLimit(limit));
		}

		const q = query(
			praiseContisCollection,
			orderBy('metadata.createdAt', 'desc'),
			...queries,
		);

		const querySnapshot = await getDocs(q);
		const praiseContis: ClientPraiseConti[] = [];

		for (const doc of querySnapshot.docs) {
			const praiseConti = doc.data() as ServerPraiseConti;
			const formattedPraiseConti = {
				...praiseConti,
				metadata: {
					...praiseConti.metadata,
					createdAt: praiseConti.metadata.createdAt.toDate() as Date,
					updatedAt: praiseConti.metadata.updatedAt.toDate() as Date,
				},
				tags: this.convertTagsToClient(praiseConti.tags),
				songs: this.convertSongsToClient(praiseConti.songs),
			} satisfies ClientPraiseConti;
			praiseContis.push(formattedPraiseConti);
		}

		const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

		return {
			data: praiseContis,
			lastVisible: lastDoc ? lastDoc.id : null,
			hasMore: querySnapshot.docs.length === limit,
		};
	}

	async createPraiseConti(props: CreatePraiseContiRequest): Promise<void> {
		const { groupId, authorId, ...praiseContiData } = props;
		const praiseContisCollection = this.getPraiseContisCollection(groupId);

		const id = uuidv4();

		const firestoreData = {
			...praiseContiData,
			identifier: {
				id,
				authorId,
			},
			metadata: {
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				isDeleted: false,
			},
			tags: this.convertTagsToServer(praiseContiData.tags),
			songs: this.convertSongsToServer(praiseContiData.songs),
		} satisfies ServerPraiseConti;

		await setDoc(doc(praiseContisCollection, id), firestoreData);
	}

	async updatePraiseConti(props: UpdatePraiseContiRequest): Promise<void> {
		const { groupId, praiseConti } = props;
		const praiseContiRef = doc(
			this.getPraiseContisCollection(groupId),
			praiseConti.identifier.id,
		);

		const firestoreData = {
			...praiseConti,
			metadata: {
				...praiseConti.metadata,
				updatedAt: serverTimestamp(),
			},
		};

		await setDoc(praiseContiRef, firestoreData, { merge: true });
	}

	async deletePraiseConti(props: DeletePraiseContiRequest): Promise<void> {
		const { groupId, praiseContiId } = props;
		const praiseContiRef = doc(
			this.getPraiseContisCollection(groupId),
			praiseContiId,
		);

		await setDoc(
			praiseContiRef,
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

export const getPraiseContiService = (): FirestorePraiseContiService => {
	return FirestorePraiseContiService.getInstance();
};
