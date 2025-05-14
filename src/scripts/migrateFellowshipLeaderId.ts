// src/scripts/migrateFellowshipLeaderId.ts

import { database } from '@/firebase/config';
import {
	collection,
	getDocs,
	writeBatch,
	doc,
	query,
	limit,
} from '@react-native-firebase/firestore';
import type { ServerFellowship } from '@/features/fellowship/api/types';

/**
 * 마이그레이션 함수
 * 모든 소그룹의 모든 Fellowship 데이터에 leaderId 필드를 추가
 */
export async function migrateFellowshipLeaderId(): Promise<void> {
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
		let totalUpdated = 0;

		// 각 그룹의 fellowship 마이그레이션
		for (const groupDoc of groupsSnapshot.docs) {
			const groupId = groupDoc.id;
			const groupName = groupDoc.data().groupName || '이름 없음';
			console.log(`[${groupName}] 그룹(${groupId}) 처리 시작`);

			const result = await processFellowshipsForGroup(groupId);
			totalProcessed += result.processed;
			totalUpdated += result.updated;
		}

		console.log(
			`마이그레이션 완료: 총 ${totalProcessed}개 중 ${totalUpdated}개 업데이트됨`,
		);
	} catch (error) {
		console.error('마이그레이션 중 오류 발생:', error);
		throw new Error('Fellowship 마이그레이션 중 오류가 발생했습니다.');
	}
}

/**
 * 특정 그룹의 모든 Fellowship에 leaderId 필드를 추가하는 함수
 * @param groupId 소그룹 ID
 * @returns 처리된 문서와 업데이트된 문서 수
 */
async function processFellowshipsForGroup(
	groupId: string,
): Promise<{ processed: number; updated: number }> {
	try {
		const fellowshipsCollectionRef = collection(
			database,
			'groups',
			groupId,
			'fellowship',
		);
		const fellowshipsSnapshot = await getDocs(fellowshipsCollectionRef);

		// 문서가 없는 경우 건너뛰기
		if (fellowshipsSnapshot.empty) {
			console.log(`${groupId} 그룹에 Fellowship 문서가 없습니다.`);
			return { processed: 0, updated: 0 };
		}

		console.log(
			`${groupId} 그룹의 ${fellowshipsSnapshot.size}개 Fellowship 처리 시작`,
		);

		// 배치 처리를 위한 설정
		let batch = writeBatch(database);
		let batchCount = 0;
		let updatedCount = 0;
		const BATCH_LIMIT = 450; // Firestore 배치는 500개 제한이 있음

		// 각 Fellowship 문서에 leaderId 추가
		for (const fellowshipDoc of fellowshipsSnapshot.docs) {
			const data = fellowshipDoc.data() as ServerFellowship;

			// info와 members가 있는지 확인
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

			// 리더 ID 찾기 (isLeader가 true인 멤버의 ID)
			const leaderId =
				data.info.members.find((member) => member.isLeader)?.id || '';

			if (!leaderId) {
				console.warn(
					`경고: ${fellowshipDoc.id} Fellowship에서 리더를 찾을 수 없습니다.`,
				);
			}

			// leaderId가 이미 있는지 확인
			if (data.info.leaderId) {
				// 이미 leaderId가 있는 경우, 기존 값과 비교
				if (data.info.leaderId === leaderId) {
					// 같은 값이면 업데이트 안 함
					continue;
				}
			}

			// Fellowship 문서 업데이트
			const docRef = fellowshipDoc.ref;
			batch.update(docRef, {
				'info.leaderId': leaderId,
			});

			batchCount++;
			updatedCount++;

			// 배치 사이즈 제한에 도달하면 커밋하고 새 배치 시작
			if (batchCount >= BATCH_LIMIT) {
				await batch.commit();
				console.log(
					`${groupId} 그룹: ${batchCount}개 Fellowship 처리 완료 (업데이트: ${updatedCount}개)`,
				);
				batch = writeBatch(database);
				batchCount = 0;
			}
		}

		// 남은 배치 커밋
		if (batchCount > 0) {
			await batch.commit();
			console.log(
				`${groupId} 그룹: 남은 ${batchCount}개 Fellowship 처리 완료 (업데이트: ${updatedCount}개)`,
			);
		}

		console.log(
			`${groupId} 그룹의 모든 Fellowship 처리 완료 (총 ${fellowshipsSnapshot.size}개 중 ${updatedCount}개 업데이트)`,
		);
		return { processed: fellowshipsSnapshot.size, updated: updatedCount };
	} catch (error) {
		console.error(`${groupId} 그룹 처리 중 오류:`, error);
		return { processed: 0, updated: 0 };
	}
}

/**
 * 마이그레이션 진행 상황을 모니터링하는 함수
 * 대규모 마이그레이션에서 사용할 수 있는 함수
 */
export async function checkMigrationProgress(): Promise<void> {
	try {
		// 모든 그룹 가져오기
		const groupsCollectionRef = collection(database, 'groups');
		const groupsSnapshot = await getDocs(groupsCollectionRef);

		let totalFellowships = 0;
		let migratedFellowships = 0;

		// 각 그룹 검사
		for (const groupDoc of groupsSnapshot.docs) {
			const groupId = groupDoc.id;
			const fellowshipsCollectionRef = collection(
				database,
				'groups',
				groupId,
				'fellowships',
			);
			const fellowshipsSnapshot = await getDocs(fellowshipsCollectionRef);

			totalFellowships += fellowshipsSnapshot.size;

			// leaderId 필드가 있는 fellowship 수 계산
			const migratedCount = fellowshipsSnapshot.docs.filter((doc) => {
				const data = doc.data() as any;
				return data.info && data.info.leaderId !== undefined;
			}).length;

			migratedFellowships += migratedCount;

			console.log(
				`${groupId} 그룹: ${migratedCount}/${fellowshipsSnapshot.size} 마이그레이션 완료`,
			);
		}

		const percentage =
			totalFellowships > 0 ? (migratedFellowships / totalFellowships) * 100 : 0;
		console.log(
			`전체 진행률: ${migratedFellowships}/${totalFellowships} (${percentage.toFixed(2)}%)`,
		);
	} catch (error) {
		console.error('진행 상황 확인 중 오류 발생:', error);
	}
}
