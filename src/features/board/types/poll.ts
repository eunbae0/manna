/**
 * 투표 관련 타입 정의
 */
import type { BaseEntity } from './base';

// 투표 항목 타입
export interface PollOption {
	id: string;
	text: string;
	voteCount: number; // 투표 수 (성능을 위해 사전 집계)
	voterIds?: string[]; // 투표한 사용자 ID 목록 (Firestore 배열 제한 주의)
}

// 투표 타입
export interface Poll extends BaseEntity {
	question: string; // 투표 질문
	options: PollOption[]; // 투표 항목들
	multipleSelection: boolean; // 다중 선택 가능 여부
	endDate?: string; // 투표 종료 일시
	totalVotes: number; // 총 투표 수
	isAnonymous: boolean; // 익명 투표 여부
	allowAddOptions?: boolean; // 사용자가 항목 추가 가능 여부
}

// 투표 생성 요청 타입
export interface CreatePollRequest {
	question: string;
	options: { text: string }[];
	multipleSelection?: boolean;
	endDate?: string;
	isAnonymous?: boolean;
	allowAddOptions?: boolean;
}

// 투표 관련 요청 타입
export interface VotePollRequest {
	postId: string; // 게시글 ID
	elementId: string; // 투표 요소 ID
	optionIds: string[]; // 선택한 항목 ID 목록 (다중 선택 가능)
}

export interface AddPollOptionRequest {
	postId: string; // 게시글 ID
	elementId: string; // 투표 요소 ID
	text: string; // 추가할 항목 텍스트
}
