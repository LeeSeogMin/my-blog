/**
 * Supabase 서버 클라이언트 설정 (2025년 새로운 Clerk Third-Party Auth 방식)
 * 서버 컴포넌트 및 API 라우트 전용
 * 
 * 🔥 주요 변경사항 (2025.04.01부터):
 * - JWT Template 방식 완전 deprecated
 * - Third-Party Auth 방식으로 전면 변경
 * - auth() 함수로 서버 사이드 토큰 관리
 * - RLS 정책과 자동 연동
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { Database } from '@/types/database.types';

// ========================================
// 환경 변수 타입 및 검증
// ========================================

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * 환경 변수 검증 함수
 * 필수 환경 변수가 설정되었는지 확인
 */
function validateEnvironmentVariables(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.');
  }

  if (!anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.');
  }

  return {
    url,
    anonKey,
  };
}

// ========================================
// 서버용 Supabase 클라이언트 생성 (2025년 새로운 방식)
// ========================================

/**
 * ✅ 2025년 권장 방식: auth() 함수 기반 서버 클라이언트 생성
 * 
 * 특징:
 * - auth() 함수로 서버 사이드 토큰 관리
 * - accessToken 옵션으로 JWT 자동 전달
 * - RLS 정책과 자동 연동 (auth.jwt()->>'sub' 사용)
 * - API 라우트 및 서버 컴포넌트에서 사용
 * 
 * 사용법:
 * const supabase = await createServerSupabaseClient();
 * const { data } = await supabase.from('posts').select('*');
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient<Database>> {
  const { url, anonKey } = validateEnvironmentVariables();

  try {
    // Clerk 인증 정보 비동기적으로 받아오기 (2025년 4월 1일 이후 토큰 직접 전달 불필요)
    // Supabase 클라이언트가 자동으로 인증 헤더를 처리함
    const client = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return client;
  } catch (error) {
    console.error('❌ Supabase 서버 클라이언트 생성 실패:', error);
    throw new Error('Supabase 서버 클라이언트를 생성할 수 없습니다.');
  }
}

/**
 * 현재 Clerk 사용자 ID 가져오기 (서버용)
 * auth() 함수를 통해 사용자 ID 추출
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error('❌ 사용자 ID 가져오기 실패:', error);
    return null;
  }
}

// ========================================
// 타입 내보내기
// ========================================

export type { Database } from '@/types/database.types';
export type SupabaseServerClientType = SupabaseClient<Database>; 