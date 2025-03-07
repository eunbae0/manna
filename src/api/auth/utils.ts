/**
 * 인증 오류 클래스
 */
export class AuthError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}
