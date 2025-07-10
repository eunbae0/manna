import * as admin from 'firebase-admin';
import {
	onCall,
	HttpsError,
	type CallableRequest,
} from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import type {
	RequestData,
	ResponseData,
	Feed,
	Member,
	FeedTypeCollectionName,
} from './types';
import { feedTypes } from './feedTypes';

const CREATED_AT_IDENTIFIER = 'createdAt';
const CREATED_AT_IDENTIFIER_SCHEMA_V2 = 'metadata.createdAt';
const GROUP_ID_IDENTIFIER = 'groupId';
const GROUP_ID_IDENTIFIER_SCHEMA_V2 = 'identifiers.groupId';

const MAX_LIMIT = 10;

export function getUserFeeds() {
	return onCall<RequestData>(
		async (request: CallableRequest<RequestData>): Promise<ResponseData> => {
			if (!request.auth) {
				throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
			}

			const { lastVisible = null, limit = 10, groupIds = [] } = request.data;

			try {
				const fetchLimit = Math.max(limit, MAX_LIMIT);

				const memberPromises = groupIds.map((groupId) =>
					admin
						.firestore()
						.collection('groups')
						.doc(groupId)
						.collection('members')
						.get(),
				);

				const feedPromises = feedTypes.map((type) => {
					const isSchemaV2 = type === 'fellowship';
					const createdAtIdentifier = isSchemaV2
						? CREATED_AT_IDENTIFIER_SCHEMA_V2
						: CREATED_AT_IDENTIFIER;

					const groupIdIdentifier = isSchemaV2
						? GROUP_ID_IDENTIFIER_SCHEMA_V2
						: GROUP_ID_IDENTIFIER;

					let query = admin
						.firestore()
						.collectionGroup(type)
						.where(groupIdIdentifier, 'in', groupIds);

					if (type === 'posts') {
						query = query.where('isDeleted', '==', false);
					}

					query = query.orderBy(createdAtIdentifier, 'desc');

					if (lastVisible) {
						const lastVisibleTimestamp =
							admin.firestore.Timestamp.fromMillis(lastVisible);
						query = query.where(createdAtIdentifier, '<', lastVisibleTimestamp);
					}

					return query.limit(fetchLimit).get();
				});

				const fetchFeedsStartTime = Date.now();

				const [memberSnapshots, feedSnapshots] = await Promise.all([
					Promise.all(memberPromises),
					Promise.all(feedPromises),
				]);
				const membersMap = generateMembersMap(memberSnapshots);
				const fetchFeedsEndTime = Date.now();
				logger.info(
					`::Fetched all feeds with collectionGroup in ${fetchFeedsEndTime - fetchFeedsStartTime}ms`,
				);

				const allFeeds: Feed[] = [];

				for (const snapshot of feedSnapshots) {
					for (const doc of snapshot.docs) {
						const data = doc.data();
						const type = doc.ref.parent.id as FeedTypeCollectionName;
						const isSchemaV2 = type === 'fellowship';

						const groupId = isSchemaV2
							? data.identifiers.groupId
							: data.groupId;

						allFeeds.push({
							identifier: { id: doc.id, groupId },
							metadata: {
								type,
								timestamp: isSchemaV2
									? data.metadata.createdAt?.toMillis() || 0
									: data.createdAt?.toMillis() || 0,
							},
							members: membersMap.get(groupId) || [],
							data,
						});
					}
				}

				allFeeds.sort((a, b) => b.metadata.timestamp - a.metadata.timestamp);

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
				logger.error('Error in getUserFeeds:', error);
				throw new HttpsError(
					'internal',
					'데이터를 가져오는 중 오류가 발생했습니다.',
				);
			}
		},
	);
}

function generateMembersMap(
	memberSnapshots: admin.firestore.QuerySnapshot<admin.firestore.DocumentData>[],
) {
	const membersMap = new Map<string, Member[]>();
	for (const snapshot of memberSnapshots) {
		const groupId = snapshot.docs[0].ref.parent.parent?.id;
		if (!groupId) {
			continue;
		}
		const members = snapshot.docs.map((doc) => doc.data() as Member);
		membersMap.set(groupId, members);
	}
	return membersMap;
}
