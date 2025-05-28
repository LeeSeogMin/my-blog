/**
 * Supabase 클라이언트 설정 (2025년 새로운 Clerk Third-Party Auth 방식)
 * 클라이언트 컴포넌트 전용
 * 
 * 🔥 주요 변경사항 (2025.04.01부터):
 * - JWT Template 방식 완전 deprecated
 * - Third-Party Auth 방식으로 전면 변경
 * - JWT Secret 공유 불필요 (보안 대폭 개선)
 * - 새로운 accessToken 설정 방식 필수
 * - 세션 기반 자동 토큰 관리
 */

'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';
import { useEffect, useState, useMemo } from 'react';
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

// 환경 변수 검증 및 저장
const config = validateEnvironmentVariables();

// ========================================
// 클라이언트 컴포넌트용 Supabase 클라이언트 (2025년 새로운 방식)
// ========================================

/**
 * ✅ 2025년 권장 방식: useSession 기반 클라이언트 생성
 * 
 * 특징:
 * - useSession 훅으로 자동 토큰 관리
 * - accessToken 옵션으로 JWT 자동 전달
 * - RLS 정책과 자동 연동 (auth.jwt()->>'sub' 사용)
 * - 세션 변경 시 자동 토큰 갱신
 */
export function useSupabaseClient(): SupabaseClient<Database> {
  const { session } = useSession();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (session) {
      session.getToken().then((t: string | null) => {
        if (isMounted) setToken(t);
      });
    } else {
      setToken(null);
    }
    return () => { isMounted = false; };
  }, [session]);

  const supabase = useMemo(() => {
    return createClient<Database>(
      config.url,
      config.anonKey,
      {
        global: {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }, [token]);

  return supabase;
}

/**
 * 현재 Clerk 사용자 ID 가져오기 (클라이언트용)
 * useSession 훅을 통해 사용자 ID 추출
 */
export function useCurrentUserId(): string | null {
  const { session } = useSession();
  return session?.user?.id || null;
}

/**
 * JWT 토큰에서 클레임 추출 (디버깅용)
 * 토큰이 올바르게 전달되는지 확인할 때 사용
 */
export async function extractJWTClaims(session: any): Promise<any> {
  if (!session) return null;

  try {
    const token = await session.getToken();
    if (!token) return null;

    // JWT 토큰을 디코딩하여 클레임 확인 (디버깅용)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('JWT 클레임 추출 오류:', error);
    return null;
  }
}

// 타입 정의
export type SupabaseClientType = SupabaseClient<Database>;

// ========================================
// 타입 내보내기
// ========================================

export type { Database } from '@/types/database.types'; 