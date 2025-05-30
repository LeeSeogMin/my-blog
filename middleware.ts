import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Clerk 미들웨어 설정 (2025년 새로운 방식)
 * 
 * 단순화된 접근:
 * - createRouteMatcher 사용하지 않음
 * - 수동 경로 확인으로 패턴 오류 방지
 */
export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()
  const { pathname } = request.nextUrl
  const method = request.method

  // 개발 환경에서 디버깅 정보 출력
  if (process.env.NODE_ENV === 'development') {
    console.log(`🛡️ Middleware: ${pathname} - User: ${userId ? 'Authenticated' : 'Anonymous'} - Method: ${method}`)
  }

  // 공개 접근 허용 경로들
  const publicPaths = [
    '/',
    '/sign-in',
    '/sign-up',
  ]

  // 공개 API 경로들 (GET 요청만)
  const publicApiPaths = [
    '/api/posts', // GET 요청만 공개
    '/api/categories', // GET 요청만 공개
  ]

  // 완전 공개 경로
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 블로그 콘텐츠 페이지 (공개)
  if (pathname.startsWith('/posts/') || 
      pathname.startsWith('/categories/')) {
    return NextResponse.next()
  }

  // 게시물 slug 조회 API (공개)
  if (pathname.startsWith('/api/posts/slug/') && method === 'GET') {
    return NextResponse.next()
  }

  // 카테고리별 게시물 조회 API (공개)
  if (pathname.match(/^\/api\/categories\/[^\/]+\/posts$/) && method === 'GET') {
    return NextResponse.next()
  }

  // 공개 API 경로 (GET 요청만)
  if (publicApiPaths.includes(pathname) && method === 'GET') {
    return NextResponse.next()
  }

  // 보호된 API 경로들
  const protectedApiPaths = [
    '/api/posts', // POST, PUT, DELETE
    '/api/categories', // POST, PUT, DELETE
    '/api/comments',
    '/api/admin',
  ]

  // 게시물 수정/삭제 API (보호됨)
  if (pathname.match(/^\/api\/posts\/[^\/]+$/) && (method === 'PUT' || method === 'DELETE' || method === 'GET')) {
    if (!userId) {
      return NextResponse.json(
        { 
          error: '인증이 필요합니다. 로그인해 주세요.',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // 보호된 API 경로 확인
  if (protectedApiPaths.some(path => pathname.startsWith(path)) && method !== 'GET') {
    if (!userId) {
      return NextResponse.json(
        { 
          error: '인증이 필요합니다. 로그인해 주세요.',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // 관리자 페이지 접근 제어
  if (pathname.startsWith('/admin/')) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', pathname)
      return NextResponse.redirect(signInUrl)
    }
    return NextResponse.next()
  }

  // 기타 모든 경로는 허용
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/api/(.*)',
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/',
    '/(trpc)(.*)',
  ],
} 