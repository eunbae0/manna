import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	updateDoc,
	deleteDoc,
	where,
	writeBatch,
	setDoc,
	type FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { database } from '@/firebase/config';
import type {
	WorshipType,
	ClientWorshipType,
	CreateWorshipTypeInput,
	UpdateWorshipTypeInput,
} from './types';
import { serverTimestamp } from '@/firebase/firestore';
import { FirestoreService } from '../services';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_WORSHIP_TYPES = ['주일예배', '수요예배', '새벽기도회'];

/**
 * Worship types service class for handling Firestore operations related to worship types
 */
export class FirestoreWorshipTypesService extends FirestoreService {
	// 싱글톤 인스턴스를 저장할 정적 변수 - 부모 클래스와 충돌하지 않는 이름 사용
	private static worshipTypesInstance: FirestoreWorshipTypesService | null =
		null;

	// 싱글톤 인스턴스를 반환하는 정적 메서드
	public static getInstance(): FirestoreWorshipTypesService {
		if (!FirestoreWorshipTypesService.worshipTypesInstance) {
			FirestoreWorshipTypesService.worshipTypesInstance =
				new FirestoreWorshipTypesService();
		}
		return FirestoreWorshipTypesService.worshipTypesInstance;
	}

	// 생성자를 protected로 설정하여 상속 클래스에서만 생성할 수 있도록 함
	protected constructor() {
		super();
	}
	/**
	 * Gets the reference to the worship types collection for the current user
	 * @returns Collection reference
	 */
	getWorshipTypesCollectionRef(): FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData> {
		this.updateUserId();
		return collection(database, 'users', this.userId, 'worshipTypes');
	}

	/**
	 * Converts a Firestore worship type to a client worship type
	 * @param id ID of the worship type
	 * @param data Firestore worship type data
	 * @returns Client worship type
	 */
	private convertToClientWorshipType(
		id: string,
		data: FirebaseFirestoreTypes.DocumentData,
	): ClientWorshipType {
		return {
			id,
			name: data.name || '',
		};
	}

	/**
	 * Fetches all worship types for the current user
	 * @returns Array of client worship types
	 */
	async getUserWorshipTypes(): Promise<ClientWorshipType[]> {
		const ref = this.getWorshipTypesCollectionRef();
		const querySnapshot = await getDocs(ref); // TODO: sort by createdAt
		const worshipTypes: ClientWorshipType[] = [];

		for (const docSnapshot of querySnapshot.docs) {
			const data = docSnapshot.data();
			worshipTypes.push(this.convertToClientWorshipType(docSnapshot.id, data));
		}

		return worshipTypes;
	}

	/**
	 * Creates a new worship type for the current user
	 * @param input Worship type input data
	 * @returns ID of the created worship type
	 */
	async createWorshipType(input: CreateWorshipTypeInput): Promise<string> {
		const ref = this.getWorshipTypesCollectionRef();
		// Check if worship type with the same ID already exists
		const q = query(ref, where('id', '==', input.id));
		const querySnapshot = await getDocs(q);

		if (!querySnapshot.empty) {
			// Return existing worship type ID if it already exists
			return querySnapshot.docs[0].id;
		}

		const worshipTypeId = input.id || uuidv4();
		const docRef = doc(ref, worshipTypeId);

		const worshipTypeData: WorshipType = {
			id: worshipTypeId,
			name: input.name,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};

		await setDoc(docRef, worshipTypeData);
		return worshipTypeId;
	}

	/**
	 * Updates an existing worship type
	 * @param worshipTypeId ID of the worship type to update
	 * @param input Updated worship type data
	 * @returns true if successful, false if worship type not found
	 */
	async updateWorshipType(
		worshipTypeId: string,
		input: UpdateWorshipTypeInput,
	): Promise<boolean> {
		const ref = doc(this.getWorshipTypesCollectionRef(), worshipTypeId);
		const docSnapshot = await getDoc(ref);

		if (!docSnapshot.exists) {
			return false;
		}

		await updateDoc(ref, {
			name: input.name,
		});

		return true;
	}

	/**
	 * Deletes a worship type
	 * @param worshipTypeId ID of the worship type to delete
	 * @returns true if successful, false if worship type not found
	 */
	async deleteWorshipType(worshipTypeId: string): Promise<boolean> {
		const ref = doc(this.getWorshipTypesCollectionRef(), worshipTypeId);
		const docSnapshot = await getDoc(ref);

		if (!docSnapshot.exists) {
			return false;
		}

		await deleteDoc(ref);
		return true;
	}
	/**
	 * Creates default worship types for the current user
	 * @returns Array of created worship type IDs
	 */
	async createDefaultWorshipTypes(): Promise<string[]> {
		const ref = this.getWorshipTypesCollectionRef();
		const querySnapshot = await getDocs(ref);
		// If user already has worship types, don't create defaults
		if (!querySnapshot.empty) {
			return [];
		}

		const batch = writeBatch(database);
		const createdIds: string[] = [];

		for (const typeName of DEFAULT_WORSHIP_TYPES) {
			const worshipTypeId = uuidv4();
			const docRef = doc(ref, worshipTypeId);

			batch.set(docRef, {
				id: worshipTypeId,
				name: typeName,
			});

			createdIds.push(worshipTypeId);
		}

		await batch.commit();
		return createdIds;
	}
}
