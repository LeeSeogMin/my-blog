/**
 * Supabase 클라이언트 전용 코드
 * React Hook 및 클라이언트 컴포넌트에서 사용
 */

'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { 
  supabase, 
  createClerkSupabaseClient, 
  TypedSupabaseClient 
} from './supabase-shared'

// =====================================================
// React Hook: Clerk 통합 Supabase 클라이언트
// =====================================================

/**
 * Clerk 인증 상태와 통합된 Supabase 클라이언트를 제공하는 Hook
 * 
 * 사용법:
 * ```tsx
 * import { useClerkSupabase } from '@/lib/supabase-client'
 * 
 * function MyComponent() {
 *   const { supabaseClient, isLoading } = useClerkSupabase()
 *   
 *   if (isLoading) return <div>로딩 중...</div>
 *   if (!supabaseClient) return <div>인증이 필요합니다</div>
 *   
 *   // supabaseClient 사용하여 데이터 조회/수정
 * }
 * ```
 */
export function useClerkSupabase() {
  const { getToken, isLoaded, userId } = useAuth()
  const [supabaseClient, setSupabaseClient] = useState<TypedSupabaseClient | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const setupSupabaseClient = async () => {
      try {
        // Clerk 인증 로딩 완료 대기
        if (!isLoaded) {
          return
        }

        // 사용자가 로그인하지 않은 경우
        if (!userId) {
          setSupabaseClient(null)
          setIsLoading(false)
          return
        }

        // Clerk에서 Supabase JWT 토큰 가져오기
        const token = await getToken({ template: 'supabase' })
        
        if (token) {
          // JWT 토큰이 있으면 Clerk 통합 클라이언트 생성
          const client = createClerkSupabaseClient(token)
          setSupabaseClient(client)
        } else {
          // JWT 토큰이 없으면 기본 클라이언트 사용
          setSupabaseClient(supabase)
        }
      } catch (error) {
        console.error('Supabase 클라이언트 설정 오류:', error)
        // 오류 발생 시 기본 클라이언트 사용
        setSupabaseClient(supabase)
      } finally {
        setIsLoading(false)
      }
    }

    setupSupabaseClient()
  }, [getToken, isLoaded, userId])

  return {
    /** Clerk 인증이 통합된 Supabase 클라이언트 */
    supabaseClient,
    /** 클라이언트 설정 로딩 상태 */
    isLoading,
    /** 사용자 로그인 여부 */
    isAuthenticated: !!userId,
    /** 사용자 ID (Clerk) */
    userId,
  }
}

// =====================================================
// 타입 정의
// =====================================================

export type ClerkSupabaseHook = {
  supabaseClient: TypedSupabaseClient | null
  isLoading: boolean
  isAuthenticated: boolean
  userId: string | null
} 