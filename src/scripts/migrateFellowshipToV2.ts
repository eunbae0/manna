import type {
	ServerFellowship,
	ServerFellowshipV2,
	ServerFellowshipParticipantV2,
	FellowshipCategoryV2,
	FellowshipContentItemV2,
} from '@/features/fellowship/api/types';
import { database } from '@/firebase/config';
import {
	collection,
	getDocs,
	writeBatch,
	doc,
	query,
	where,
	serverTimestamp,
} from '@react-native-firebase/firestore';

/**
 * 단일 Fellowship 문서를 V2 스키마로 변환
 */
function convertFellowshipToV2(
	oldFellowship: ServerFellowship,
): ServerFellowshipV2 {
	// 리더 ID 확인
	let leaderId = oldFellowship.info.leaderId;

	// leaderId가 없는 경우 isLeader가 true인 멤버에서 찾기
	if (!leaderId) {
		const leaderMember = oldFellowship.info.members.find(
			(member) => member.isLeader,
		);
		if (leaderMember) {
			leaderId = leaderMember.id;
		}
	}

	// 참가자 변환
	const participants: ServerFellowshipParticipantV2[] =
		oldFellowship.info.members.map((member) => ({
			id: member.id,
			displayName: member.displayName || '',
		}));

	// 카테고리 초기화 및 기존 콘텐츠 변환
	const categories: Record<string, FellowshipCategoryV2> = {};

	// 1. 기도제목 카테고리 생성 및 변환
	if (oldFellowship.content?.prayerRequest) {
		const prayerRequestItems: Record<string, FellowshipContentItemV2> = {};

		// 기도제목은 단일 항목이므로 하나의 아이템으로 변환
		if (
			oldFellowship.content.prayerRequest.isActive &&
			oldFellowship.content.prayerRequest.answers &&
			Array.isArray(oldFellowship.content.prayerRequest.answers)
		) {
			// 각 멤버의 기도제목 답변을 변환
			const prayerAnswers: Record<string, string> = {};

			for (const answer of oldFellowship.content.prayerRequest.answers) {
				if (answer.member?.id && answer.value) {
					prayerAnswers[answer.member.id] = answer.value;
				}
			}

			// 기도제목 아이템 생성
			prayerRequestItems.prayerRequest = {
				id: 'prayerRequest',
				title: '기도 제목',
				order: 0,
				answers: prayerAnswers,
			};
		}

		// 기도제목 카테고리 추가
		categories.prayerRequest = {
			id: 'prayerRequest',
			title: '기도 제목',
			order: 2,
			type: 'prayerRequests',
			isActive: oldFellowship.content.prayerRequest.isActive,
			items: prayerRequestItems,
		};
	} else {
		// 기도제목 데이터가 없는 경우 기본값 생성
		categories.prayerRequest = {
			id: 'prayerRequest',
			title: '기도 제목',
			order: 2,
			type: 'prayerRequests',
			isActive: false,
			items: {},
		};
	}

	// 2. 나눔(설교 주제) 카테고리 생성 및 변환
	if (
		oldFellowship.content?.sermonTopic &&
		Array.isArray(oldFellowship.content.sermonTopic)
	) {
		const sermonTopicItems: Record<string, FellowshipContentItemV2> = {};

		// 각 설교 주제 항목을 변환
		for (let i = 0; i < oldFellowship.content.sermonTopic.length; i++) {
			const topic = oldFellowship.content.sermonTopic[i];
			if (topic.id && topic.question) {
				// 답변 변환
				const topicAnswers: Record<string, string> = {};

				if (topic.answers && Array.isArray(topic.answers)) {
					for (const answer of topic.answers) {
						if (answer.member?.id && answer.value) {
							topicAnswers[answer.member.id] = answer.value;
						}
					}
				}

				// 설교 주제 아이템 생성
				sermonTopicItems[topic.id] = {
					id: topic.id,
					title: topic.question,
					order: i,
					answers: topicAnswers,
				};
			}
		}

		// 설교 주제 카테고리 추가
		categories.sermonTopic = {
			id: 'sermonTopic',
			title: '설교 나눔',
			order: 1,
			type: 'sermonTopic',
			isActive: true,
			items: sermonTopicItems,
		};
	} else {
		// 설교 주제 데이터가 없는 경우 기본값 생성
		categories.sermonTopic = {
			id: 'sermonTopic',
			title: '설교 나눔',
			order: 1,
			type: 'sermonTopic',
			isActive: false,
			items: {},
		};
	}

	// 3. 아이스브레이킹 카테고리 생성 및 변환
	if (
		oldFellowship.content?.iceBreaking &&
		Array.isArray(oldFellowship.content.iceBreaking)
	) {
		const iceBreakingItems: Record<string, FellowshipContentItemV2> = {};

		// 각 아이스브레이킹 항목을 변환
		for (let i = 0; i < oldFellowship.content.iceBreaking.length; i++) {
			const item = oldFellowship.content.iceBreaking[i];
			if (item.id && item.question) {
				// 답변 변환
				const itemAnswers: Record<string, string> = {};

				if (item.answers && Array.isArray(item.answers)) {
					for (const answer of item.answers) {
						if (answer.member?.id && answer.value) {
							itemAnswers[answer.member.id] = answer.value;
						}
					}
				}

				// 아이스브레이킹 아이템 생성
				iceBreakingItems[item.id] = {
					id: item.id,
					title: item.question,
					order: i,
					answers: itemAnswers,
				};
			}
		}

		// 아이스브레이킹 카테고리가 있는 경우에만 추가
		if (Object.keys(iceBreakingItems).length > 0) {
			categories.iceBreaking = {
				id: 'iceBreaking',
				title: '아이스브레이킹',
				order: 0,
				type: 'iceBreaking',
				isActive: true,
				items: iceBreakingItems,
			};
		} else {
			categories.iceBreaking = {
				id: 'iceBreaking',
				title: '아이스브레이킹',
				order: 0,
				type: 'iceBreaking',
				isActive: false,
				items: {},
			};
		}
	}

	const now = serverTimestamp();

	return {
		categories,
		identifiers: {
			id: oldFellowship.id,
			groupId: oldFellowship.groupId,
		},
		roles: {
			leaderId: leaderId || '',
		},
		info: {
			title: oldFellowship.info.preachTitle,
			preacher: oldFellowship.info.preacher?.value || '',
			preachText: oldFellowship.info.preachText?.value || '',
			date: oldFellowship.info.date,
			participants,
		},
		content: {
			categories,
		},
		// @ts-ignore
		metadata: {
			schemaVersion: '2',
			// createdAt: now,
			// updatedAt: now,
		},
		options: {
			enableMemberReply: true,
		},
		extensions: {
			// 문서 아카이빙
			schemaV1Archive: {
				oldFellowship,
			},
		},
	};
}

/**
 * 특정 그룹의 모든 Fellowship을 V2 스키마로 마이그레이션하는 함수
 * @param groupId 소그룹 ID
 * @returns 처리된 문서와 업데이트된 문서 수
 */
export async function migrateFellowshipsForGroup(
	groupId: string,
): Promise<{ processed: number; migrated: number }> {
	try {
		// Fellowship 컬렉션 참조
		const fellowshipsCollectionRef = collection(
			database,
			'groups',
			groupId,
			'fellowship',
		);

		// V1 문서만 가져오기 (preachTitle 필드가 있는 문서)
		// 참고: preachTitle 필드가 있으면 V1, 없으면 V2
		const v1Query = query(
			fellowshipsCollectionRef,
			where('content', '!=', null),
		);
		const fellowshipsSnapshot = await getDocs(v1Query);

		// 문서가 없는 경우 건너뛰기
		if (fellowshipsSnapshot.empty) {
			console.log(
				`${groupId} 그룹에 마이그레이션할 V1 Fellowship 문서가 없습니다.`,
			);
			return { processed: 0, migrated: 0 };
		}

		console.log(
			`${groupId} 그룹의 ${fellowshipsSnapshot.size}개 V1 Fellowship 마이그레이션 시작`,
		);

		// 배치 처리를 위한 설정
		let batch = writeBatch(database);
		let batchCount = 0;
		let migratedCount = 0;
		const BATCH_LIMIT = 450; // Firestore 배치는 500개 제한이 있음

		// 각 V1 Fellowship 문서를 V2로 변환하여 같은 컬렉션에 업데이트
		for (const fellowshipDoc of fellowshipsSnapshot.docs) {
			const data = fellowshipDoc.data() as ServerFellowship;
			data.id = fellowshipDoc.id;
			data.groupId = groupId;

			// 데이터 구조 검증
			if (
				!data.info ||
				!data.info.members ||
				!Array.isArray(data.info.members)
			) {
				console.warn(
					`경고: ${fellowshipDoc.id} Fellowship의 데이터 구조가 올바르지 않습니다.`,
				);
				continue;
			}

			// 기존 문서 참조 사용
			const docRef = fellowshipDoc.ref;

			// 배치에 업데이트 추가
			batch.update(docRef, convertFellowshipToV2(data));

			batchCount++;
			migratedCount++;

			// 배치 사이즈 제한에 도달하면 커밋하고 새 배치 시작
			if (batchCount >= BATCH_LIMIT) {
				await batch.commit();
				console.log(
					`${groupId} 그룹: ${batchCount}개 Fellowship 마이그레이션 완료`,
				);
				batch = writeBatch(database);
				batchCount = 0;
			}
		}

		// 남은 배치 커밋
		if (batchCount > 0) {
			await batch.commit();
			console.log(
				`${groupId} 그룹: 남은 ${batchCount}개 Fellowship 마이그레이션 완료`,
			);
		}

		console.log(
			`${groupId} 그룹의 모든 Fellowship 마이그레이션 완료 (총 ${fellowshipsSnapshot.size}개)`,
		);
		return { processed: fellowshipsSnapshot.size, migrated: migratedCount };
	} catch (error) {
		console.error(`${groupId} 그룹 마이그레이션 중 오류:`, error);
		return { processed: 0, migrated: 0 };
	}
}

/**
 * 모든 그룹의 Fellowship을 V2 스키마로 마이그레이션
 */
export async function migrateFellowshipToV2(): Promise<void> {
	try {
		// 모든 그룹 가져오기
		const groupsCollectionRef = collection(database, 'groups');
		const groupsSnapshot = await getDocs(groupsCollectionRef);

		console.log(`총 ${groupsSnapshot.size}개의 그룹을 마이그레이션합니다.`);

		// 그룹이 없는 경우 오류 반환
		if (groupsSnapshot.empty) {
			console.log('그룹이 없습니다.');
			return;
		}

		// 배치 처리를 위한 설정
		let totalProcessed = 0;
		let totalMigrated = 0;

		// 각 그룹의 fellowship 마이그레이션
		for (const groupDoc of groupsSnapshot.docs) {
			const groupId = groupDoc.id;
			const groupName = groupDoc.data().groupName || '이름 없음';
			console.log(`[${groupName}] 그룹(${groupId}) 마이그레이션 시작`);

			const result = await migrateFellowshipsForGroup(groupId);
			totalProcessed += result.processed;
			totalMigrated += result.migrated;
		}

		console.log(
			`마이그레이션 완료: 총 ${totalProcessed}개 중 ${totalMigrated}개 마이그레이션됨`,
		);
	} catch (error) {
		console.error('마이그레이션 중 오류 발생:', error);
		throw new Error('Fellowship 마이그레이션 중 오류가 발생했습니다.');
	}
}

/**
 * 특정 그룹의 Fellowship을 V2 스키마로 마이그레이션
 * @param groupId 마이그레이션할 그룹 ID
 */
export async function migrateGroupFellowshipToV2(
	groupId: string,
): Promise<void> {
	try {
		console.log(`그룹 ${groupId}의 Fellowship 마이그레이션 시작`);

		// 그룹 정보 가져오기
		const groupDocRef = doc(database, 'groups', groupId);
		const groupDoc = await groupDocRef.get();

		if (!groupDoc.exists) {
			console.error(`그룹 ${groupId}가 존재하지 않습니다.`);
			return;
		}

		const groupName = groupDoc.data()?.groupName || '이름 없음';
		console.log(`[${groupName}] 그룹(${groupId}) 마이그레이션 시작`);

		const result = await migrateFellowshipsForGroup(groupId);

		console.log(
			`그룹 ${groupId} 마이그레이션 완료: 총 ${result.processed}개 중 ${result.migrated}개 마이그레이션됨`,
		);
	} catch (error) {
		console.error(`그룹 ${groupId} 마이그레이션 중 오류 발생:`, error);
		throw new Error(
			`그룹 ${groupId}의 Fellowship 마이그레이션 중 오류가 발생했습니다.`,
		);
	}
}

/**
 * 마이그레이션 진행 상황을 확인하는 함수
 */
export async function verifyFellowshipMigration(): Promise<void> {
	try {
		// 모든 그룹 가져오기
		const groupsCollectionRef = collection(database, 'groups');
		const groupsSnapshot = await getDocs(groupsCollectionRef);

		let totalV1 = 0;
		let totalV2 = 0;

		// 각 그룹 검사
		for (const groupDoc of groupsSnapshot.docs) {
			const groupId = groupDoc.id;
			const groupName = groupDoc.data().groupName || '이름 없음';

			// Fellowship 컬렉션 참조
			const fellowshipsCollectionRef = collection(
				database,
				'groups',
				groupId,
				'fellowship',
			);

			// V1 문서 쿼리 (preachTitle 필드가 있는 문서)
			const v1Query = query(
				fellowshipsCollectionRef,
				where('info.preachTitle', '!=', null),
			);
			const v1Snapshot = await getDocs(v1Query);

			// V2 문서 쿼리 (schemaVersion 필드가 있는 문서)
			const v2Query = query(
				fellowshipsCollectionRef,
				where('metadata.schemaVersion', '==', '2.0'),
			);
			const v2Snapshot = await getDocs(v2Query);

			const v1Count = v1Snapshot.size;
			const v2Count = v2Snapshot.size;
			const totalCount = v1Count + v2Count;

			totalV1 += v1Count;
			totalV2 += v2Count;

			const percentage =
				totalCount > 0 ? Math.round((v2Count / totalCount) * 100) : 0;

			console.log(
				`[${groupName}] 그룹(${groupId}): V1=${v1Count}, V2=${v2Count}, 마이그레이션 완료율=${percentage}%`,
			);
		}

		const totalCount = totalV1 + totalV2;
		const totalPercentage =
			totalCount > 0 ? Math.round((totalV2 / totalCount) * 100) : 0;

		console.log(
			`전체 마이그레이션 상태: V1=${totalV1}, V2=${totalV2}, 완료율=${totalPercentage}%`,
		);
	} catch (error) {
		console.error('마이그레이션 상태 확인 중 오류 발생:', error);
		throw new Error(
			'Fellowship 마이그레이션 상태 확인 중 오류가 발생했습니다.',
		);
	}
}

/**
 * 특정 그룹의 마이그레이션 상태 확인
 * @param groupId 확인할 그룹 ID
 */
export async function verifyGroupFellowshipMigration(
	groupId: string,
): Promise<void> {
	try {
		// 그룹 정보 가져오기
		const groupDocRef = doc(database, 'groups', groupId);
		const groupDoc = await groupDocRef.get();

		if (!groupDoc.exists) {
			console.error(`그룹 ${groupId}가 존재하지 않습니다.`);
			return;
		}

		const groupName = groupDoc.data()?.groupName || '이름 없음';

		// Fellowship 컬렉션 참조
		const fellowshipsCollectionRef = collection(
			database,
			'groups',
			groupId,
			'fellowship',
		);

		// V1 문서 쿼리 (preachTitle 필드가 있는 문서)
		const v1Query = query(
			fellowshipsCollectionRef,
			where('info.preachTitle', '!=', null),
		);
		const v1Snapshot = await getDocs(v1Query);

		// V2 문서 쿼리 (schemaVersion 필드가 있는 문서)
		const v2Query = query(
			fellowshipsCollectionRef,
			where('metadata.schemaVersion', '==', '2.0'),
		);
		const v2Snapshot = await getDocs(v2Query);

		const v1Count = v1Snapshot.size;
		const v2Count = v2Snapshot.size;
		const totalCount = v1Count + v2Count;

		const percentage =
			totalCount > 0 ? Math.round((v2Count / totalCount) * 100) : 0;

		console.log(
			`[${groupName}] 그룹(${groupId}): V1=${v1Count}, V2=${v2Count}, 마이그레이션 완료율=${percentage}%`,
		);

		// 상세 검증
		console.log('\n상세 검증 시작...');

		// V1 문서 ID 목록
		const v1Ids = new Set(v1Snapshot.docs.map((doc) => doc.id));

		// V2 문서 ID 목록
		const v2Ids = new Set(v2Snapshot.docs.map((doc) => doc.id));

		// 아직 마이그레이션되지 않은 문서 찾기
		const notMigratedIds = [...v1Ids].filter((id) => !v2Ids.has(id));

		if (notMigratedIds.length > 0) {
			console.log(`마이그레이션되지 않은 문서 ${notMigratedIds.length}개:`);
			notMigratedIds.slice(0, 5).forEach((id) => console.log(`- ${id}`)); // 처음 5개만 표시
			if (notMigratedIds.length > 5) {
				console.log(`... 외 ${notMigratedIds.length - 5}개`);
			}
		} else {
			console.log('모든 문서가 마이그레이션되었습니다.');
		}

		// 추가 검증: 몇 개의 문서를 샘플로 비교
		const sampleSize = Math.min(5, v2Count);
		if (sampleSize > 0) {
			console.log(`\n${sampleSize}개 V2 문서 샘플 검증:`);

			let sampleCount = 0;
			for (const fellowshipDoc of v2Snapshot.docs) {
				if (sampleCount >= sampleSize) break;

				const id = fellowshipDoc.id;
				const v2Data = fellowshipDoc.data() as ServerFellowshipV2;

				console.log(`문서 ID: ${id}`);
				console.log(`- 제목: ${v2Data.info.title}`);
				console.log(`- 설교자: ${v2Data.info.preacher}`);
				console.log(`- 설교 본문: ${v2Data.info.preachText}`);
				console.log(`- 참가자 수: ${v2Data.info.participants.length}`);
				console.log(`- 카테고리 수: ${Object.keys(v2Data.categories).length}`);
				console.log(`- 스키마 버전: ${v2Data.metadata.schemaVersion}`);
				console.log('---');

				sampleCount++;
			}
		}
	} catch (error) {
		console.error(
			`그룹 ${groupId} 마이그레이션 상태 확인 중 오류 발생:`,
			error,
		);
		throw new Error(
			`그룹 ${groupId}의 Fellowship 마이그레이션 상태 확인 중 오류가 발생했습니다.`,
		);
	}
}

/**
 * 메인 함수: 명령줄 인자에 따라 마이그레이션 실행
 */
async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const command = args[0] || 'help';
	const groupId = args[1];

	try {
		switch (command) {
			case 'migrate':
				if (groupId) {
					console.log(`그룹 ${groupId}의 Fellowship 마이그레이션 시작...`);
					await migrateGroupFellowshipToV2(groupId);
				} else {
					console.log('모든 그룹의 Fellowship 마이그레이션 시작...');
					await migrateFellowshipToV2();
				}
				break;

			case 'verify':
				if (groupId) {
					console.log(`그룹 ${groupId}의 Fellowship 마이그레이션 상태 확인...`);
					await verifyGroupFellowshipMigration(groupId);
				} else {
					console.log('모든 그룹의 Fellowship 마이그레이션 상태 확인...');
					await verifyFellowshipMigration();
				}
				break;

			case 'help':
			default:
				console.log(`
Fellowship 마이그레이션 스크립트 사용법:

npx ts-node src/scripts/migrateFellowshipToV2.ts [명령] [그룹ID]

명령:
  migrate  - Fellowship을 V2 스키마로 마이그레이션
  verify   - 마이그레이션 상태 확인
  help     - 도움말 표시

그룹ID:
  선택 사항. 특정 그룹만 처리하려면 그룹 ID를 입력하세요.
  입력하지 않으면 모든 그룹을 처리합니다.

예시:
  npx ts-node src/scripts/migrateFellowshipToV2.ts migrate
  npx ts-node src/scripts/migrateFellowshipToV2.ts migrate group123
  npx ts-node src/scripts/migrateFellowshipToV2.ts verify
  npx ts-node src/scripts/migrateFellowshipToV2.ts verify group123
        `);
				break;
		}
	} catch (error) {
		console.error('스크립트 실행 중 오류 발생:', error);
		process.exit(1);
	}
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
	main().catch((error) => {
		console.error('스크립트 실행 중 오류 발생:', error);
		process.exit(1);
	});
}
