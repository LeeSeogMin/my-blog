/**
 * 인증 관련 유틸리티 함수들
 * 인증 오류 처리, 타입 정의 등을 포함
 */

// 인증 오류 타입 정의
export enum AuthErrorType {
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  RATE_LIMITED = 'RATE_LIMITED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  UNKNOWN = 'UNKNOWN'
}

// 인증 오류 인터페이스
export interface AuthError {
  type: AuthErrorType;
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
  canRetry: boolean;
  severity: 'info' | 'warning' | 'error';
  originalError?: Error;
}

/**
 * 일반적인 오류를 인증 오류로 파싱
 */
export function parseAuthError(error: unknown): AuthError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // 네트워크 오류
    if (message.includes('network') || message.includes('fetch')) {
      return {
        type: AuthErrorType.NETWORK_ERROR,
        title: '네트워크 연결 오류',
        message: '인터넷 연결을 확인하고 다시 시도해 주세요.',
        action: '다시 시도',
        canRetry: true,
        severity: 'error',
        originalError: error
      };
    }
    
    // 인증 오류
    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        type: AuthErrorType.UNAUTHORIZED,
        title: '로그인이 필요합니다',
        message: '이 기능을 사용하려면 먼저 로그인해 주세요.',
        action: '로그인하기',
        actionUrl: '/sign-in',
        canRetry: false,
        severity: 'info',
        originalError: error
      };
    }
    
    // 권한 오류
    if (message.includes('forbidden') || message.includes('403')) {
      return {
        type: AuthErrorType.PERMISSION_DENIED,
        title: '권한이 없습니다',
        message: '이 작업을 수행할 권한이 없습니다.',
        action: '홈으로 이동',
        actionUrl: '/',
        canRetry: false,
        severity: 'error',
        originalError: error
      };
    }
  }
  
  // 기본 오류
  return {
    type: AuthErrorType.UNKNOWN,
    title: '알 수 없는 오류',
    message: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    action: '다시 시도',
    canRetry: true,
    severity: 'error',
    originalError: error instanceof Error ? error : undefined
  };
}

/**
 * 인증 상태 확인
 */
export function isAuthenticated(): boolean {
  // 실제 구현에서는 Clerk의 인증 상태를 확인
  return false;
}

/**
 * 사용자 권한 확인
 */
export function hasPermission(permission: string): boolean {
  // 실제 구현에서는 사용자의 권한을 확인
  return false;
} 