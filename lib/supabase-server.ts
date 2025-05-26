/**
 * Supabase 서버 전용 코드
 * API 라우트 및 서버 컴포넌트에서 사용
 */

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { 
  createClerkSupabaseClient, 
  TypedSupabaseClient 
} from './supabase-shared'
import { Database } from '@/types/database.types'

// =====================================================
// 서버 사이드 Clerk JWT 검증 함수
// =====================================================

/**
 * 서버 사이드에서 Clerk JWT 토큰을 검증하고 Supabase 클라이언트 생성
 * 
 * @param request - Next.js Request 객체 (선택적)
 * @returns 검증된 JWT 토큰이 포함된 Supabase 클라이언트 또는 null
 * 
 * 사용 용도:
 * - API 라우트에서 인증된 사용자 확인
 * - 서버 액션에서 사용자 권한 검증
 * - 미들웨어에서 인증 상태 확인
 * 
 * 사용법:
 * ```tsx
 * // app/api/posts/route.ts
 * import { createClerkSupabaseServerClient } from '@/lib/supabase-server'
 * 
 * export async function POST(request: Request) {
 *   const supabaseClient = await createClerkSupabaseServerClient(request)
 *   
 *   if (!supabaseClient) {
 *     return Response.json({ error: '인증이 필요합니다' }, { status: 401 })
 *   }
 *   
 *   // 인증된 사용자로 데이터 조회/수정
 * }
 * ```
 */
export async function createClerkSupabaseServerClient(
  request?: Request
): Promise<TypedSupabaseClient | null> {
  try {
    // Clerk에서 현재 인증 상태 확인
    const { getToken, userId } = await auth()

    // 사용자가 로그인하지 않은 경우
    if (!userId) {
      return null
    }

    // Clerk에서 Supabase JWT 토큰 가져오기
    const token = await getToken({ template: 'supabase' })

    if (!token) {
      return null
    }

    // JWT 토큰이 포함된 Supabase 클라이언트 반환
    return createClerkSupabaseClient(token)
  } catch (error) {
    console.error('서버 사이드 Supabase 클라이언트 생성 오류:', error)
    return null
  }
} 

// =====================================================
// 서버 컴포넌트용 Supabase 클라이언트
// =====================================================

/**
 * 서버 컴포넌트에서 사용할 기본 Supabase 클라이언트
 * 공개 데이터 조회용 (인증 불필요)
 * 
 * 사용법:
 * ```tsx
 * // app/page.tsx (서버 컴포넌트)
 * import { createServerClient } from '@/lib/supabase-server'
 * 
 * export default async function HomePage() {
 *   const supabase = createServerClient()
 *   const { data: posts } = await supabase.from('posts').select('*')
 *   return <div>...</div>
 * }
 * ```
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}