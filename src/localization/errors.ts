import { ErrorCode } from '@/api/errors/types';

export const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_UNKNOWN]: '인증 오류가 발생했습니다',
  [ErrorCode.AUTH_EMAIL_EXISTS]: '이미 등록된 이메일 주소입니다',
  [ErrorCode.AUTH_INVALID_EMAIL]: '유효하지 않은 이메일 주소입니다',
  [ErrorCode.AUTH_WEAK_PASSWORD]: '비밀번호는 최소 6자 이상이어야 합니다',
  [ErrorCode.AUTH_USER_NOT_FOUND]: '등록되지 않은 사용자입니다',
  [ErrorCode.AUTH_WRONG_PASSWORD]: '잘못된 비밀번호입니다',
  // 더 많은 메시지...
};