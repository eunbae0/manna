import * as admin from 'firebase-admin';
import {
	onCall,
	HttpsError,
	type CallableRequest,
} from 'firebase-functions/v2/https';
import type {
	RequestData,
	ResponseData,
	Feed,
	FeedTypeCollectionName,
	Member,
} from './types';

const MAX_LIMIT = 10;
const CREATED_AT_IDENTIFIER = 'createdAt';
const CREATED_AT_IDENTIFIER_SCHEMA_V2 = 'metadata.createdAt';

export function getUserFeeds() {
	return onCall(
		async (request: CallableRequest<RequestData>): Promise<ResponseData> => {
			if (!request.auth) {
				throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
			}

			const userId = request.auth.uid;
			const { lastVisible = null, limit = 10 } = request.data;

			try {
				// 1. 사용자의 그룹 목록 가져오기
				const groupsSnapshot = await admin
					.firestore()
					.collection('users')
					.doc(userId)
					.collection('groups')
					.get();

				if (groupsSnapshot.empty) {
					return { feeds: [], lastVisible: null, hasMore: false };
				}

				const groupIds = groupsSnapshot.docs.map((doc) => doc.data().groupId);

				// 2. 각 그룹별로 제한된 개수의 최신 데이터만 가져오기
				const fetchLimit = Math.max(limit, MAX_LIMIT);

				const buildCollectionGroupQuery = (
					groupId: string,
					collectionName: FeedTypeCollectionName,
				) => {
					const isSchemaV2 = collectionName === 'fellowship';
					const createdAtIdentifier = isSchemaV2
						? CREATED_AT_IDENTIFIER_SCHEMA_V2
						: CREATED_AT_IDENTIFIER;

					let query = admin
						.firestore()
						.collection('groups')
						.doc(groupId)
						.collection(collectionName)
						.orderBy(createdAtIdentifier, 'desc');

					if (lastVisible) {
						const lastVisibleTimestamp =
							admin.firestore.Timestamp.fromMillis(lastVisible);
						query = query.where(createdAtIdentifier, '<', lastVisibleTimestamp);
					}

					return query.limit(fetchLimit);
				};

				const allFeedsPromises = groupIds.map(async (groupId) => {
					const [fellowshipSnap, postsSnap, prayerRequestsSnap] =
						await Promise.all([
							buildCollectionGroupQuery(groupId, 'fellowship').get(),
							buildCollectionGroupQuery(groupId, 'posts').get(),
							buildCollectionGroupQuery(groupId, 'prayer-requests').get(),
						]);

					const feeds: Feed[] = [];

					const memberSnapshot = await admin
						.firestore()
						.collection('groups')
						.doc(groupId)
						.collection('members')
						.get();

					const members = memberSnapshot.docs.map(
						(doc) => doc.data() as Member,
					);

					// 각 컬렉션의 데이터를 활동 배열에 추가
					const addFeeds = (
						snapshot: FirebaseFirestore.QuerySnapshot,
						type: FeedTypeCollectionName,
					) => {
						const isSchemaV2 = type === 'fellowship';
						for (const doc of snapshot.docs) {
							const data = doc.data();
							feeds.push({
								identifier: {
									id: doc.id,
									groupId,
								},
								metadata: {
									type,
									timestamp: isSchemaV2
										? data.metadata.createdAt?.toMillis() || 0
										: data.createdAt?.toMillis() || 0,
								},
								members,
								data,
							});
						}
					};

					addFeeds(fellowshipSnap, 'fellowship');
					addFeeds(postsSnap, 'posts');
					addFeeds(prayerRequestsSnap, 'prayer-requests');

					return feeds;
				});

				// 3. 모든 데이터 합치고 정렬
				const allFeedsArrays = await Promise.all(allFeedsPromises);
				let allFeeds = allFeedsArrays.flat();

				// 시간순 정렬 (최신순)
				allFeeds.sort((a, b) => b.metadata.timestamp - a.metadata.timestamp);

				// 4. lastVisible 이후의 데이터만 필터링
				if (lastVisible) {
					allFeeds = allFeeds.filter(
						(feed) => feed.metadata.timestamp < lastVisible,
					);
				}

				// 5. 요청된 개수만큼 자르기
				const paginatedFeeds = allFeeds.slice(0, limit);
				const newLastVisible =
					paginatedFeeds.length > 0
						? paginatedFeeds[paginatedFeeds.length - 1].metadata.timestamp
						: null;
				const hasMore = allFeeds.length > limit;

				return {
					feeds: paginatedFeeds,
					lastVisible: newLastVisible,
					hasMore,
				};
			} catch (error) {
				console.error('getUserFeeds 오류:', error);
				throw new HttpsError(
					'internal',
					'데이터를 가져오는 중 오류가 발생했습니다.',
				);
			}
		},
	);
}
