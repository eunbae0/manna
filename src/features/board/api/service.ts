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
	limit,
	startAfter,
	endBefore,
	increment,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { database } from '@/firebase/config';
import type {
	CreateBoardPostInput,
	UpdateBoardPostInput,
	CreateCommentInput,
	UpdateCommentInput,
	BoardPostQueryOptions,
} from './types';
import {
	type BoardPost,
	type Comment,
	BaseEntity,
	UserRole,
	type ReactionType,
	type UpdateBoardPostRequest,
	type UpdateCommentRequest,
	type PaginatedResponse,
	type PostCategory,
	ContentElementUnion,
	type FirestoreAuthor,
	type Author,
	type ReactionMetadata,
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
	ClientGroupMember,
	ServerGroupMember,
} from '@/api/prayer-request/types';
import type { GroupMember } from '@/api/group/types';
import { DELETED_MEMBER_DISPLAY_NAME } from '@/shared/constants';

// Firestore 타입 정의
interface FirestoreBoardPost
	extends Omit<BoardPost, 'createdAt' | 'updatedAt' | 'author'> {
	author: FirestoreAuthor;
	createdAt: FirebaseFirestoreTypes.Timestamp;
	updatedAt?: FirebaseFirestoreTypes.Timestamp;
}

interface FirestoreComment
	extends Omit<Comment, 'createdAt' | 'updatedAt' | 'author'> {
	author: FirestoreAuthor;
	createdAt: FirebaseFirestoreTypes.Timestamp;
	updatedAt?: FirebaseFirestoreTypes.Timestamp;
}

export interface FirestoreReaction {
	id: string;
	targetId: string;
	targetType: 'post' | 'comment';
	type: ReactionType;
	userId: string;
	createdAt: FirebaseFirestoreTypes.Timestamp;
}
export interface ClientReaction {
	id: string;
	targetId: string;
	targetType: 'post' | 'comment';
	type: ReactionType;
	userId: string;
	createdAt: FirebaseFirestoreTypes.Timestamp;
	member: Author;
}

/**
 * Firestore 게시판 서비스
 */
export class FirestoreBoardService {
	// 싱글톤 인스턴스를 저장할 정적 변수
	private static instance: FirestoreBoardService | null = null;

	// 싱글톤 인스턴스를 반환하는 정적 메서드
	public static getInstance(): FirestoreBoardService {
		if (!FirestoreBoardService.instance) {
			FirestoreBoardService.instance = new FirestoreBoardService();
		}
		return FirestoreBoardService.instance;
	}

	// 생성자를 private으로 설정하여 외부에서 인스턴스 생성을 방지
	private constructor() {}

	// 컬렉션 경로
	private readonly groupsCollectionPath = 'groups';
	private readonly postsCollectionPath = 'posts';
	private readonly commentsCollectionPath = 'comments';
	private readonly elementsCollectionPath = 'elements';
	private readonly reactionsCollectionPath = 'reactions';

	// 그룹 내 게시글 컬렉션 경로 생성
	private getPostsCollectionPath(groupId: string): string {
		return `${this.groupsCollectionPath}/${groupId}/${this.postsCollectionPath}`;
	}

	// 그룹 내 댓글 컬렉션 경로 생성
	private getCommentsCollectionPath(groupId: string, postId: string): string {
		return `${this.groupsCollectionPath}/${groupId}/${this.postsCollectionPath}/${postId}/${this.commentsCollectionPath}`;
	}

	/**
	 * Firestore 게시글을 클라이언트 게시글로 변환
	 */
	public async convertToClientBoardPost(
		post: FirestoreBoardPost,
	): Promise<BoardPost> {
		const memberRef = doc(
			collection(database, `groups/${post.groupId}/members`),
			post.author.id,
		);
		const memberDoc = await getDoc(memberRef);

		let author: Author = {
			id: post.author.id,
			displayName: DELETED_MEMBER_DISPLAY_NAME,
		};

		if (memberDoc.exists()) {
			const memberData = memberDoc.data() as GroupMember;
			author = {
				id: post.author.id,
				displayName: memberData.displayName || DELETED_MEMBER_DISPLAY_NAME,
				photoUrl: memberData.photoUrl || undefined,
				role: memberData.role as UserRole,
			};
		}
		return {
			id: post.id,
			title: post.title,
			content: post.content,
			category: post.category as PostCategory,
			viewCount: post.viewCount,
			commentCount: post.commentCount,
			isPinned: post.isPinned,
			isDeleted: post.isDeleted,
			tags: post.tags,
			author,
			groupId: post.groupId,
			reactionSummary: post.reactionSummary as {
				[key in ReactionType]?: number;
			},
			createdAt: post.createdAt.toDate(),
			updatedAt: post.updatedAt?.toDate(),
		};
	}

	/**
	 * Firestore 댓글을 클라이언트 댓글로 변환
	 */
	public async convertToClientComment(
		comment: FirestoreComment,
	): Promise<Comment> {
		const memberRef = doc(
			collection(database, `groups/${comment.groupId}/members`),
			comment.author.id,
		);
		const memberDoc = await getDoc(memberRef);

		let author: Author = {
			id: comment.author.id,
			displayName: DELETED_MEMBER_DISPLAY_NAME,
		};

		if (memberDoc.exists()) {
			const memberData = memberDoc.data() as GroupMember;
			author = {
				id: comment.author.id,
				displayName: memberData.displayName || DELETED_MEMBER_DISPLAY_NAME,
				photoUrl: memberData.photoUrl || undefined,
				role: memberData.role as UserRole,
			};
		}

		return {
			id: comment.id,
			postId: comment.postId,
			content: comment.content,
			groupId: comment.groupId,
			author,
			parentId: comment.parentId,
			depth: comment.depth,
			isEdited: comment.isEdited,
			isDeleted: comment.isDeleted,
			likeCount: comment.likeCount,
			reactionSummary: comment.reactionSummary as {
				[key in ReactionType]?: number;
			},
			createdAt: comment.createdAt.toDate(),
			updatedAt: comment.updatedAt?.toDate(),
		};
	}
	/**
	 * Firestore 댓글을 클라이언트 댓글로 변환
	 */
	public async convertToMember(metadata: {
		groupId: string;
		userId: string;
	}): Promise<Author> {
		const memberRef = doc(
			collection(database, `groups/${metadata.groupId}/members`),
			metadata.userId,
		);
		const memberDoc = await getDoc(memberRef);

		if (memberDoc.exists()) {
			const memberData = memberDoc.data() as GroupMember;
			return {
				id: metadata.userId,
				displayName: memberData.displayName || DELETED_MEMBER_DISPLAY_NAME,
				photoUrl: memberData.photoUrl || undefined,
				role: memberData.role as UserRole,
			};
		}

		return {
			id: metadata.userId,
			displayName: DELETED_MEMBER_DISPLAY_NAME,
			photoUrl: undefined,
			role: UserRole.MEMBER,
		};
	}

	/**
	 * 게시글 가져오기
	 */
	async getBoardPostById({
		groupId,
		postId,
	}: { groupId: string; postId: string }): Promise<BoardPost | null> {
		try {
			const postRef = doc(
				collection(database, this.getPostsCollectionPath(groupId)),
				postId,
			);
			const postDoc = await getDoc(postRef);

			if (!postDoc.exists()) {
				return null;
			}

			return this.convertToClientBoardPost(
				postDoc.data() as FirestoreBoardPost,
			);
		} catch (error) {
			console.error('Error getting board post:', error);
			throw error;
		}
	}

	/**
	 * 그룹의 게시글 목록 가져오기
	 */
	async getBoardPostsByGroupId(
		options: BoardPostQueryOptions,
	): Promise<PaginatedResponse<BoardPost>> {
		try {
			const {
				groupId,
				category,
				authorId,
				tags,
				isPinned,
				searchText,
				page = 1,
				limit: limitCount = 10,
				sort = 'createdAt',
				order = 'desc',
				startAfter: startAfterId,
				endBefore: endBeforeId,
			} = options;

			const postsRef = collection(
				database,
				this.getPostsCollectionPath(groupId),
			);
			let queryRef = query(postsRef);

			// 필터 적용
			if (category) {
				queryRef = query(queryRef, where('category', '==', category));
			}

			if (authorId) {
				queryRef = query(queryRef, where('author.id', '==', authorId));
			}

			if (isPinned !== undefined) {
				queryRef = query(queryRef, where('isPinned', '==', isPinned));
			}

			// 삭제되지 않은 게시글만 가져오기
			queryRef = query(queryRef, where('isDeleted', '==', false));

			// 정렬 적용
			queryRef = query(queryRef, orderBy(sort, order as 'asc' | 'desc'));

			// 페이지네이션 적용
			if (startAfterId) {
				const startAfterDocRef = doc(
					collection(database, this.postsCollectionPath),
					startAfterId,
				);
				const startAfterDoc = await getDoc(startAfterDocRef);
				if (startAfterDoc.exists()) {
					queryRef = query(queryRef, startAfter(startAfterDoc));
				}
			}

			if (endBeforeId) {
				const endBeforeDocRef = doc(
					collection(database, this.postsCollectionPath),
					endBeforeId,
				);
				const endBeforeDoc = await getDoc(endBeforeDocRef);
				if (endBeforeDoc.exists()) {
					// @ts-ignore - endBefore는 DocumentSnapshot을 받을 수 있지만 타입 오류가 발생함
					queryRef = query(queryRef, endBefore(endBeforeDoc));
				}
			}

			queryRef = query(queryRef, limit(limitCount));

			const querySnapshot = await getDocs(queryRef);
			const posts: BoardPost[] = [];

			for (const docSnapshot of querySnapshot.docs) {
				const post = docSnapshot.data() as FirestoreBoardPost;
				posts.push(await this.convertToClientBoardPost(post));
			}

			// 태그 필터링 (부분 일치 검색)
			let filteredPosts = posts;
			if (tags && tags.length > 0) {
				filteredPosts = posts.filter((post) => {
					if (!post.tags) return false;
					return tags.some((tag) => post.tags?.includes(tag) ?? false);
				});
			}

			// 검색어 필터링
			if (searchText) {
				const searchLower = searchText.toLowerCase();
				filteredPosts = filteredPosts.filter((post) => {
					return (
						post.title.toLowerCase().includes(searchLower) ||
						(post.content?.toLowerCase().includes(searchLower) ?? false)
					);
				});
			}

			// 총 개수 가져오기 (실제로는 더 효율적인 방법 사용 필요)
			const countQueryRef = query(
				collection(database, this.getPostsCollectionPath(groupId)),
				where('isDeleted', '==', false),
			);
			const countSnapshot = await getDocs(countQueryRef);

			return {
				items: filteredPosts,
				total: countSnapshot.size,
				page,
				limit: limitCount,
				hasMore: filteredPosts.length === limitCount,
			};
		} catch (error) {
			console.error('Error getting board posts:', error);
			throw error;
		}
	}

	/**
	 * 게시글 생성
	 */
	async createBoardPost(postData: CreateBoardPostInput): Promise<BoardPost> {
		try {
			const postId = uuidv4();
			const postRef = doc(
				collection(database, this.getPostsCollectionPath(postData.groupId)),
				postId,
			);

			// 기본 게시글 데이터 생성
			const postToCreate: Partial<FirestoreBoardPost> = {
				id: postId,
				title: postData.title,
				content: postData.content || '',
				category: postData.category,
				groupId: postData.groupId,
				viewCount: 0,
				commentCount: 0,
				isPinned: postData.isPinned || false,
				isDeleted: false,
				// attachments: postData.attachments
				// 	? postData.attachments.map((url) => ({ url }))
				// 	: [],
				tags: postData.tags || [],
				author: {
					id: postData.userId,
				},
				reactionSummary: {},
				createdAt: serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
			};

			// 게시글 저장
			await setDoc(postRef, postToCreate);

			// 콘텐츠 요소가 있는 경우 처리
			if (postData.elements && postData.elements.length > 0) {
				const elementsCollectionRef = collection(
					postRef,
					this.elementsCollectionPath,
				);

				// 각 콘텐츠 요소 저장
				for (const element of postData.elements) {
					const elementId = uuidv4();
					const elementRef = doc(elementsCollectionRef, elementId);
					const elementData = {
						...element,
						id: elementId,
						createdAt: serverTimestamp(),
					};

					await setDoc(elementRef, elementData);
				}
			}

			// 생성된 게시글 조회
			const createdPostDoc = await getDoc(postRef);
			if (!createdPostDoc.exists()) {
				throw new Error('Failed to create post');
			}

			// 생성된 게시글 반환
			return await this.convertToClientBoardPost(
				createdPostDoc.data() as FirestoreBoardPost,
			);
		} catch (error) {
			console.error('Error creating board post:', error);
			throw error;
		}
	}

	/**
	 * 게시글 업데이트
	 */
	async updateBoardPost(
		metadata: { postId: string; groupId: string },
		postData: UpdateBoardPostRequest,
	): Promise<void> {
		try {
			const postRef = doc(
				collection(database, this.getPostsCollectionPath(metadata.groupId)),
				metadata.postId,
			);
			const postDoc = await getDoc(postRef);

			if (!postDoc.exists()) {
				throw new Error('Post not found');
			}

			// 업데이트할 필드 준비
			const updateData: Partial<FirestoreBoardPost> = {
				updatedAt: serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
			};

			// 제목 업데이트
			if (postData.title !== undefined) {
				updateData.title = postData.title;
			}

			// 내용 업데이트
			if (postData.content !== undefined) {
				updateData.content = postData.content;
			}

			// 카테고리 업데이트
			if (postData.category !== undefined) {
				updateData.category = postData.category;
			}

			// 고정 여부 업데이트
			if (postData.isPinned !== undefined) {
				updateData.isPinned = postData.isPinned;
			}

			// 첨부파일 업데이트
			// if (postData.attachments !== undefined) {
			// 	updateData.attachments = postData.attachments.map((url) => ({ url }));
			// }

			// 태그 업데이트
			if (postData.tags !== undefined) {
				updateData.tags = postData.tags;
			}

			// 게시글 업데이트
			await updateDoc(postRef, updateData);

			// 콘텐츠 요소 업데이트
			if (postData.elements !== undefined) {
				const elementsCollectionRef = collection(
					postRef,
					this.elementsCollectionPath,
				);
				const existingElementsQuery = query(elementsCollectionRef);
				const existingElementsSnapshot = await getDocs(existingElementsQuery);

				// 기존 콘텐츠 요소 삭제
				for (const doc of existingElementsSnapshot.docs) {
					await deleteDoc(doc.ref);
				}

				for (const element of postData.elements) {
					const elementId = uuidv4();
					const elementRef = doc(elementsCollectionRef, elementId);
					const elementData = {
						...element,
						id: elementId,
						createdAt: serverTimestamp(),
					};

					await setDoc(elementRef, elementData);
				}
			}
		} catch (error) {
			console.error('Error updating board post:', error);
			throw error;
		}
	}

	/**
	 * 게시글 삭제 (소프트 삭제)
	 */
	async deleteBoardPost({
		postId,
		groupId,
	}: { postId: string; groupId: string }): Promise<void> {
		try {
			const postRef = doc(
				collection(database, this.getPostsCollectionPath(groupId)),
				postId,
			);
			const postDoc = await getDoc(postRef);

			if (!postDoc.exists()) {
				throw new Error('Post not found');
			}

			// 소프트 삭제 (실제로 삭제하지 않고 isDeleted 플래그만 설정)
			await updateDoc(postRef, {
				isDeleted: true,
				updatedAt: serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
			});
		} catch (error) {
			console.error('Error deleting board post:', error);
			throw error;
		}
	}

	/**
	 * 조회수 증가
	 */
	async incrementViewCount({
		postId,
		groupId,
	}: { postId: string; groupId: string }): Promise<void> {
		try {
			const postRef = doc(
				collection(database, this.getPostsCollectionPath(groupId)),
				postId,
			);
			const postDoc = await getDoc(postRef);

			if (!postDoc.exists()) {
				throw new Error('Post not found');
			}

			// 조회수 증가
			await updateDoc(postRef, {
				viewCount: increment(1),
			});
		} catch (error) {
			console.error('Error incrementing view count:', error);
			throw error;
		}
	}

	/**
	 * 댓글 목록 가져오기
	 */
	async getCommentsByPostId({
		postId,
		groupId,
	}: { postId: string; groupId: string }): Promise<Comment[]> {
		try {
			const postRef = doc(
				collection(database, this.getPostsCollectionPath(groupId)),
				postId,
			);
			const commentsRef = collection(postRef, this.commentsCollectionPath);
			const commentsQuery = query(
				commentsRef,
				where('isDeleted', '==', false),
				orderBy('createdAt', 'asc'),
			);

			const commentsSnapshot = await getDocs(commentsQuery);
			const comments: Comment[] = [];

			for (const docSnapshot of commentsSnapshot.docs) {
				const commentData = docSnapshot.data() as FirestoreComment;
				comments.push(await this.convertToClientComment(commentData));
			}

			return comments;
		} catch (error) {
			console.error('Error getting comments:', error);
			throw error;
		}
	}

	/**
	 * 댓글 생성
	 */
	async createComment(
		metadata: { groupId: string },
		commentData: CreateCommentInput,
	): Promise<Comment> {
		try {
			const postRef = doc(
				collection(database, this.getPostsCollectionPath(metadata.groupId)),
				commentData.postId,
			);

			const commentId = uuidv4();
			const commentsRef = collection(postRef, this.commentsCollectionPath);
			const commentRef = doc(commentsRef, commentId);

			// 대댓글 처리
			let depth = 0;
			if (commentData.parentId) {
				const parentCommentRef = doc(commentsRef, commentData.parentId);
				const parentCommentDoc = await getDoc(parentCommentRef);

				if (!parentCommentDoc.exists()) {
					throw new Error('Parent comment not found');
				}

				const parentComment = parentCommentDoc.data() as FirestoreComment;
				depth = (parentComment.depth || 0) + 1;

				// 대댓글 깊이 제한 (최대 2단계)
				if (depth > 2) {
					depth = 2;
				}
			}

			// 댓글 데이터 생성
			const commentToCreate: Partial<FirestoreComment> = Object.assign(
				{
					id: commentId,
					postId: commentData.postId,
					groupId: metadata.groupId,
					content: commentData.content,
					author: {
						id: commentData.userId,
					},
					depth,
					isEdited: false,
					isDeleted: false,
					likeCount: 0,
					reactionSummary: {},
					createdAt: serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
				},
				commentData.parentId ? { parentId: commentData.parentId } : {},
			);

			// 댓글 저장
			await setDoc(commentRef, commentToCreate);

			// 게시글의 댓글 수 증가
			await updateDoc(postRef, {
				commentCount: increment(1),
			});

			// 생성된 댓글 조회
			const createdCommentDoc = await getDoc(commentRef);
			if (!createdCommentDoc.exists()) {
				throw new Error('Failed to create comment');
			}

			// 생성된 댓글 반환
			return await this.convertToClientComment(
				createdCommentDoc.data() as FirestoreComment,
			);
		} catch (error) {
			console.error('Error creating comment:', error);
			throw error;
		}
	}

	/**
	 * 댓글 업데이트
	 */
	async updateComment(
		metadata: { postId: string; groupId: string; commentId: string },
		commentData: UpdateCommentRequest,
	): Promise<void> {
		try {
			const commentsRef = collection(
				database,
				this.getCommentsCollectionPath(metadata.groupId, metadata.postId),
			);
			const commentRef = doc(commentsRef, metadata.commentId);
			const commentDoc = await getDoc(commentRef);

			if (!commentDoc.exists()) {
				throw new Error('Comment not found');
			}

			// 업데이트할 필드 준비
			const updateData: Partial<FirestoreComment> = {
				isEdited: true,
				updatedAt: serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
			};

			// 내용 업데이트
			if (commentData.content !== undefined) {
				updateData.content = commentData.content;
			}

			// 댓글 업데이트
			await updateDoc(commentRef, updateData);
		} catch (error) {
			console.error('Error updating comment:', error);
			throw error;
		}
	}

	/**
	 * 댓글 삭제 (소프트 삭제)
	 */
	async deleteComment(metadata: {
		postId: string;
		groupId: string;
		commentId: string;
	}): Promise<void> {
		try {
			const commentsRef = collection(
				database,
				this.getCommentsCollectionPath(metadata.groupId, metadata.postId),
			);
			const commentRef = doc(commentsRef, metadata.commentId);
			const commentDoc = await getDoc(commentRef);

			if (!commentDoc.exists()) {
				throw new Error('Comment not found');
			}

			// 소프트 삭제 (실제로 삭제하지 않고 isDeleted 플래그만 설정)
			await updateDoc(commentRef, {
				isDeleted: true,
				updatedAt: serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
			});

			// 게시글의 댓글 수 감소
			// 소프트 삭제이기 때문에 실제로는 수를 감소시키지 않을 수도 있음
			// 필요에 따라 이 부분을 주석 처리하거나 삭제할 수 있음
			await updateDoc(
				doc(
					database,
					this.getPostsCollectionPath(metadata.groupId),
					metadata.postId,
				),
				{
					commentCount: increment(-1),
				},
			);
		} catch (error) {
			console.error('Error deleting comment:', error);
			throw error;
		}
	}

	/**
	 * 게시글이나 댓글에 반응 추가
	 * @param targetId 게시글 또는 댓글 ID
	 * @param targetType 대상 타입 ('post' 또는 'comment')
	 * @param groupId 그룹 ID
	 * @param userId 사용자 ID
	 * @param reactionType 반응 타입
	 * @returns Promise<void>
	 */
	async addReaction(
		metadata: ReactionMetadata,
		userId: string,
		reactionType: ReactionType,
	): Promise<void> {
		try {
			// 대상 문서 참조 가져오기
			let targetRef: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>;
			if (metadata.targetType === 'post') {
				targetRef = doc(
					database,
					this.getPostsCollectionPath(metadata.groupId),
					metadata.postId,
				);
			} else {
				targetRef = doc(
					database,
					this.getPostsCollectionPath(metadata.groupId),
					metadata.postId,
					this.commentsCollectionPath,
					metadata.commentId,
				);
			}
			const targetDoc = await getDoc(targetRef);

			if (!targetDoc.exists()) {
				throw new Error(
					`${metadata.targetType} with ID ${metadata.postId} not found`,
				);
			}

			// 반응 콜렉션 참조 가져오기
			const reactionsCollectionRef = collection(targetRef, 'reactions');

			// 사용자가 이미 동일한 반응을 등록했는지 확인
			const existingReactionQuery = query(
				reactionsCollectionRef,
				where('userId', '==', userId),
				where('type', '==', reactionType),
			);
			const existingReactionSnapshot = await getDocs(existingReactionQuery);

			// 이미 동일한 반응이 있으면 추가하지 않음
			if (!existingReactionSnapshot.empty) {
				return;
			}

			// 새 반응 추가
			const reactionId = uuidv4();
			const reactionRef = doc(reactionsCollectionRef, reactionId);

			const newReaction: FirestoreReaction = {
				id: reactionId,
				targetId: metadata.postId,
				targetType: metadata.targetType,
				type: reactionType,
				userId,
				createdAt: serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
			};

			// 반응 문서 저장
			await setDoc(reactionRef, newReaction);

			// 반응 집계 업데이트
			await updateDoc(targetRef, {
				[`reactionSummary.${reactionType}`]: increment(1),
			});
		} catch (error) {
			console.error('Error adding reaction:', error);
			throw error;
		}
	}

	/**
	 * 게시글이나 댓글에서 반응 제거
	 * @param targetId 게시글 또는 댓글 ID
	 * @param targetType 대상 타입 ('post' 또는 'comment')
	 * @param groupId 그룹 ID
	 * @param userId 사용자 ID
	 * @param reactionType 반응 타입
	 * @returns Promise<void>
	 */
	async removeReaction(
		metadata: ReactionMetadata,
		userId: string,
		reactionType: ReactionType,
	): Promise<void> {
		try {
			// 대상 문서 참조 가져오기
			let targetRef: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>;
			if (metadata.targetType === 'post') {
				targetRef = doc(
					database,
					this.getPostsCollectionPath(metadata.groupId),
					metadata.postId,
				);
			} else {
				targetRef = doc(
					database,
					this.getPostsCollectionPath(metadata.groupId),
					metadata.postId,
					this.commentsCollectionPath,
					metadata.commentId,
				);
			}
			const targetDoc = await getDoc(targetRef);

			if (!targetDoc.exists()) {
				throw new Error(
					`${metadata.targetType} with ID ${metadata.postId} not found`,
				);
			}

			// 반응 콜렉션 참조 가져오기
			const reactionsCollectionRef = collection(targetRef, 'reactions');

			// 사용자가 등록한 반응을 찾기
			const reactionQuery = query(
				reactionsCollectionRef,
				where('userId', '==', userId),
				where('type', '==', reactionType),
			);
			const reactionSnapshot = await getDocs(reactionQuery);

			// 반응이 없으면 종료
			if (reactionSnapshot.empty) {
				return;
			}

			// 반응 문서 삭제
			const reactionDoc = reactionSnapshot.docs[0];
			await deleteDoc(reactionDoc.ref);

			// 반응 집계 업데이트
			await updateDoc(targetRef, {
				[`reactionSummary.${reactionType}`]: increment(-1),
			});
		} catch (error) {
			console.error('Error removing reaction:', error);
			throw error;
		}
	}

	/**
	 * 게시글이나 댓글의 반응 목록 가져오기
	 * @param targetId 게시글 또는 댓글 ID
	 * @param targetType 대상 타입 ('post' 또는 'comment')
	 * @param groupId 그룹 ID
	 * @returns Promise<{ [key in ReactionType]?: number }> 반응 집계 정보
	 */
	async getReactions(
		metadata: ReactionMetadata,
	): Promise<{ [key in ReactionType]?: ClientReaction[] }> {
		try {
			// 대상 문서 참조 가져오기
			let targetRef: FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData>;
			if (metadata.targetType === 'post') {
				targetRef = collection(
					database,
					this.getPostsCollectionPath(metadata.groupId),
					metadata.postId,
					this.reactionsCollectionPath,
				);
			} else {
				targetRef = collection(
					database,
					this.getPostsCollectionPath(metadata.groupId),
					metadata.postId,
					this.commentsCollectionPath,
					metadata.commentId,
					this.reactionsCollectionPath,
				);
			}
			const targetDoc = await getDocs(targetRef);

			if (targetDoc.empty) {
				return {};
			}

			// 먼저 모든 반응을 수집
			const reactionsByType: { [key in ReactionType]?: ClientReaction[] } = {};

			// 반응 타입별로 그룹화
			for (const doc of targetDoc.docs) {
				const reaction = doc.data() as FirestoreReaction;
				if (!reactionsByType[reaction.type]) {
					reactionsByType[reaction.type] = [];
				}
				reactionsByType[reaction.type]?.push({
					...reaction,
					member: await this.convertToMember({
						groupId: metadata.groupId,
						userId: reaction.userId,
					}),
				});
			}

			// 반환할 결과 객체
			return reactionsByType;
		} catch (error) {
			console.error('Error getting reactions:', error);
			throw error;
		}
	}
}

/**
 * 게시판 서비스 인스턴스를 반환하는 함수
 * @returns FirestoreBoardService 인스턴스
 */
export function getBoardService(): FirestoreBoardService {
	return FirestoreBoardService.getInstance();
}
