/**
 * 일정 관련 타입 정의
 */
import type { BaseEntity } from './base';

// 일정 타입
export interface Schedule extends BaseEntity {
	title: string; // 일정 제목
	startDate: string; // 시작 일시
	endDate?: string; // 종료 일시 (종일 일정은 생략 가능)
	location?: string; // 장소
	description?: string; // 일정 설명
	isAllDay: boolean; // 종일 일정 여부
	recurrence?: {
		frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; // 반복 주기
		interval: number; // 반복 간격
		endDate?: string; // 반복 종료 일시
	}; // 반복 일정 정보
	participants?: {
		userId: string;
		displayName: string;
		photoUrl?: string;
		status: 'attending' | 'declined' | 'tentative' | 'invited'; // 참석 상태
	}[]; // 참석자 목록
	notifications?: {
		type: 'email' | 'push';
		time: number; // 일정 시작 전 알림 시간(분)
	}[]; // 알림 설정
}

// 일정 생성 요청 타입
export interface CreateScheduleRequest {
	title: string;
	startDate: string;
	endDate?: string;
	location?: string;
	description?: string;
	isAllDay?: boolean;
	recurrence?: {
		frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
		interval: number;
		endDate?: string;
	};
	notifications?: {
		type: 'email' | 'push';
		time: number;
	}[];
}

// 일정 참여 관련 요청 타입
export interface UpdateScheduleParticipationRequest {
	postId: string; // 게시글 ID
	elementId: string; // 일정 요소 ID
	status: 'attending' | 'declined' | 'tentative'; // 참여 상태
}
