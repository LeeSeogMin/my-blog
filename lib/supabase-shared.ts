/**
 * Supabase 공통 설정 및 유틸리티
 * 클라이언트/서버 양쪽에서 사용 가능한 코드만 포함
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// =====================================================
// 1. 환경 변수 타입 정의 및 검증
// =====================================================

/**
 * Supabase 환경 변수 타입
 */
interface SupabaseConfig {
  url: string
  anonKey: string
}

/**
 * 환경 변수 검증 및 추출
 * 필수 환경 변수가 없으면 오류 발생
 */
export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.')
  }

  if (!anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.')
  }

  return { url, anonKey }
}

// =====================================================
// 2. 기본 Supabase 클라이언트
// =====================================================

/**
 * 기본 Supabase 클라이언트 (인증 없음)
 * 공개 데이터 조회용
 */
const config = getSupabaseConfig()

export const supabase: SupabaseClient<Database> = createClient<Database>(
  config.url,
  config.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// =====================================================
// 3. Clerk JWT 통합 클라이언트 생성 함수
// =====================================================

/**
 * Clerk JWT 토큰이 통합된 Supabase 클라이언트 생성
 * @param supabaseAccessToken - Clerk에서 발급받은 Supabase JWT 토큰
 * @returns Clerk 인증 정보가 포함된 Supabase 클라이언트
 */
export function createClerkSupabaseClient(supabaseAccessToken: string): SupabaseClient<Database> {
  return createClient<Database>(
    config.url,
    config.anonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// =====================================================
// 4. 유틸리티 함수
// =====================================================

/**
 * Supabase 오류를 사용자 친화적인 메시지로 변환
 */
export function getSupabaseErrorMessage(error: any): string {
  if (!error) return '알 수 없는 오류가 발생했습니다.'

  const errorMessages: Record<string, string> = {
    '23505': '이미 존재하는 데이터입니다.',
    '23503': '참조된 데이터가 존재하지 않습니다.',
    '42P01': '테이블이 존재하지 않습니다.',
    '42703': '컬럼이 존재하지 않습니다.',
    'PGRST116': '요청한 데이터를 찾을 수 없습니다.',
    'PGRST301': '권한이 없습니다.',
  }

  if (error.code && errorMessages[error.code]) {
    return errorMessages[error.code]
  }

  return error.message || '데이터베이스 오류가 발생했습니다.'
}

/**
 * Supabase 응답이 성공인지 확인하는 타입 가드
 */
export function isSupabaseSuccess<T>(
  response: { data: T | null; error: any }
): response is { data: T; error: null } {
  return response.error === null && response.data !== null
}

// =====================================================
// 5. 타입 정의
// =====================================================

export type TypedSupabaseClient = SupabaseClient<Database> 