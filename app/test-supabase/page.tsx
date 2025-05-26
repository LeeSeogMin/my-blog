'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useClerkSupabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, AlertCircle, Loader2, Database, Shield, User, FileImage } from 'lucide-react'

// 테스트 결과 타입 정의
interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'loading'
  message: string
  details?: string
}

export default function TestSupabasePage() {
  const { isLoaded, isSignedIn, user } = useAuth()
  const { supabaseClient, isLoading: supabaseLoading, isAuthenticated } = useClerkSupabase()
  
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)

  // 환경 변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 환경 변수 마스킹 함수
  const maskValue = (value: string | undefined, showLength = 8) => {
    if (!value) return '❌ 설정되지 않음'
    if (value.length <= showLength) return value
    return `${value.substring(0, showLength)}${'*'.repeat(value.length - showLength)}`
  }

  // 상태 아이콘 컴포넌트
  const StatusIcon = ({ status }: { status: TestResult['status'] }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  // 기본 연결 테스트
  const testBasicConnection = async (): Promise<TestResult> => {
    try {
      if (!supabaseClient) {
        return {
          name: '기본 연결',
          status: 'error',
          message: 'Supabase 클라이언트가 초기화되지 않았습니다',
        }
      }

      // 간단한 쿼리로 연결 테스트
      const { data, error } = await supabaseClient
        .from('categories')
        .select('count')
        .limit(1)

      if (error) {
        return {
          name: '기본 연결',
          status: 'warning',
          message: '연결은 성공했지만 쿼리 실행 중 오류 발생',
          details: error.message,
        }
      }

      return {
        name: '기본 연결',
        status: 'success',
        message: 'Supabase 데이터베이스 연결 성공',
      }
    } catch (error) {
      return {
        name: '기본 연결',
        status: 'error',
        message: '연결 테스트 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      }
    }
  }

  // Clerk 인증 상태 테스트
  const testClerkAuth = async (): Promise<TestResult> => {
    if (!isLoaded) {
      return {
        name: 'Clerk 인증',
        status: 'loading',
        message: 'Clerk 인증 상태 로딩 중...',
      }
    }

    if (!isSignedIn) {
      return {
        name: 'Clerk 인증',
        status: 'warning',
        message: '사용자가 로그인하지 않음',
        details: '로그인 후 전체 기능 테스트 가능',
      }
    }

    return {
      name: 'Clerk 인증',
      status: 'success',
      message: `사용자 로그인 성공: ${user?.emailAddresses[0]?.emailAddress}`,
      details: `사용자 ID: ${user?.id}`,
    }
  }

  // JWT 토큰 테스트
  const testJWTToken = async (): Promise<TestResult> => {
    if (!isSignedIn) {
      return {
        name: 'JWT 토큰',
        status: 'warning',
        message: '로그인이 필요합니다',
      }
    }

    try {
      if (!supabaseClient) {
        return {
          name: 'JWT 토큰',
          status: 'error',
          message: 'Supabase 클라이언트가 없습니다',
        }
      }

      // 현재 사용자 정보 조회 (RLS 정책 테스트)
      const { data, error } = await supabaseClient
        .from('current_user_info')
        .select('*')
        .limit(1)

      if (error) {
        return {
          name: 'JWT 토큰',
          status: 'error',
          message: 'JWT 토큰 인증 실패',
          details: error.message,
        }
      }

      const userInfo = data?.[0]
      if (userInfo?.is_authenticated) {
        return {
          name: 'JWT 토큰',
          status: 'success',
          message: 'Clerk JWT 토큰 인증 성공',
          details: `인증된 사용자 ID: ${userInfo.user_id}`,
        }
      } else {
        return {
          name: 'JWT 토큰',
          status: 'warning',
          message: 'JWT 토큰이 전달되지 않음',
          details: 'Clerk JWT 템플릿 설정을 확인하세요',
        }
      }
    } catch (error) {
      return {
        name: 'JWT 토큰',
        status: 'error',
        message: 'JWT 토큰 테스트 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      }
    }
  }

  // RLS 정책 테스트
  const testRLSPolicies = async (): Promise<TestResult> => {
    if (!supabaseClient) {
      return {
        name: 'RLS 정책',
        status: 'error',
        message: 'Supabase 클라이언트가 없습니다',
      }
    }

    try {
      // 카테고리 읽기 테스트 (모든 사용자 가능)
      const { data: categories, error: categoriesError } = await supabaseClient
        .from('categories')
        .select('id, name')
        .limit(5)

      if (categoriesError) {
        return {
          name: 'RLS 정책',
          status: 'error',
          message: '카테고리 읽기 정책 테스트 실패',
          details: categoriesError.message,
        }
      }

      // 게시물 읽기 테스트
      const { data: posts, error: postsError } = await supabaseClient
        .from('posts')
        .select('id, title, status')
        .limit(5)

      if (postsError) {
        return {
          name: 'RLS 정책',
          status: 'warning',
          message: '게시물 읽기 정책 테스트 부분 실패',
          details: postsError.message,
        }
      }

      return {
        name: 'RLS 정책',
        status: 'success',
        message: 'RLS 정책 동작 확인',
        details: `카테고리 ${categories?.length || 0}개, 게시물 ${posts?.length || 0}개 조회 성공`,
      }
    } catch (error) {
      return {
        name: 'RLS 정책',
        status: 'error',
        message: 'RLS 정책 테스트 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      }
    }
  }

  // Storage 버킷 테스트
  const testStorageBucket = async (): Promise<TestResult> => {
    if (!supabaseClient) {
      return {
        name: 'Storage 버킷',
        status: 'error',
        message: 'Supabase 클라이언트가 없습니다',
      }
    }

    try {
      // blog-images 버킷 존재 확인
      const { data: buckets, error } = await supabaseClient.storage.listBuckets()

      if (error) {
        return {
          name: 'Storage 버킷',
          status: 'error',
          message: 'Storage 버킷 조회 실패',
          details: error.message,
        }
      }

      const blogImagesBucket = buckets?.find(bucket => bucket.id === 'blog-images')
      
      if (blogImagesBucket) {
        return {
          name: 'Storage 버킷',
          status: 'success',
          message: 'blog-images 버킷 확인 완료',
          details: `공개 접근: ${blogImagesBucket.public ? '가능' : '불가능'}`,
        }
      } else {
        return {
          name: 'Storage 버킷',
          status: 'warning',
          message: 'blog-images 버킷이 생성되지 않음',
          details: 'docs/rls-policies.sql을 실행하여 버킷을 생성하세요',
        }
      }
    } catch (error) {
      return {
        name: 'Storage 버킷',
        status: 'error',
        message: 'Storage 버킷 테스트 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      }
    }
  }

  // 모든 테스트 실행
  const runAllTests = async () => {
    setIsRunningTests(true)
    setTestResults([])

    const tests = [
      testBasicConnection,
      testClerkAuth,
      testJWTToken,
      testRLSPolicies,
      testStorageBucket,
    ]

    for (const test of tests) {
      const result = await test()
      setTestResults(prev => [...prev, result])
      // 각 테스트 사이에 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunningTests(false)
  }

  // 페이지 로드 시 자동 테스트 실행
  useEffect(() => {
    if (isLoaded && !supabaseLoading) {
      runAllTests()
    }
  }, [isLoaded, supabaseLoading])

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Supabase 연결 테스트</h1>
          <p className="text-muted-foreground">
            Clerk 인증과 Supabase 데이터베이스 통합 상태를 확인합니다
          </p>
        </div>

        {/* 환경 변수 상태 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              환경 변수 설정
            </CardTitle>
            <CardDescription>
              Supabase 연결에 필요한 환경 변수 상태
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">SUPABASE_URL</span>
                  <Badge variant={supabaseUrl ? "default" : "destructive"}>
                    {supabaseUrl ? "설정됨" : "미설정"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {maskValue(supabaseUrl)}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">SUPABASE_ANON_KEY</span>
                  <Badge variant={supabaseAnonKey ? "default" : "destructive"}>
                    {supabaseAnonKey ? "설정됨" : "미설정"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {maskValue(supabaseAnonKey)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 인증 상태 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Clerk 인증 상태
            </CardTitle>
            <CardDescription>
              현재 사용자의 로그인 및 인증 상태
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Clerk 로딩</span>
                  <Badge variant={isLoaded ? "default" : "secondary"}>
                    {isLoaded ? "완료" : "로딩 중"}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">로그인 상태</span>
                  <Badge variant={isSignedIn ? "default" : "outline"}>
                    {isSignedIn ? "로그인됨" : "로그아웃"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Supabase 연동</span>
                  <Badge variant={isAuthenticated ? "default" : "outline"}>
                    {isAuthenticated ? "연동됨" : "미연동"}
                  </Badge>
                </div>
              </div>
            </div>

            {user && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>사용자:</strong> {user.emailAddresses[0]?.emailAddress}
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  <strong>ID:</strong> {user.id}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 테스트 결과 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              통합 테스트 결과
            </CardTitle>
            <CardDescription>
              데이터베이스 연결, 인증, RLS 정책 동작 확인
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                총 {testResults.length}개 테스트 완료
              </p>
              <Button 
                onClick={runAllTests} 
                disabled={isRunningTests}
                size="sm"
              >
                {isRunningTests ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    테스트 중...
                  </>
                ) : (
                  '다시 테스트'
                )}
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <StatusIcon status={result.status} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{result.name}</h4>
                      <Badge 
                        variant={
                          result.status === 'success' ? 'default' :
                          result.status === 'error' ? 'destructive' :
                          result.status === 'warning' ? 'secondary' : 'outline'
                        }
                      >
                        {result.status === 'success' ? '성공' :
                         result.status === 'error' ? '실패' :
                         result.status === 'warning' ? '경고' : '진행 중'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {result.message}
                    </p>
                    {result.details && (
                      <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 다음 단계 안내 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              다음 단계
            </CardTitle>
            <CardDescription>
              Supabase 통합을 완료하기 위한 추가 작업
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Clerk JWT 템플릿 설정</h4>
                  <p className="text-sm text-muted-foreground">
                    Clerk 대시보드에서 'supabase' JWT 템플릿을 생성하고 설정하세요
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">데이터베이스 스키마 실행</h4>
                  <p className="text-sm text-muted-foreground">
                    <code>docs/database-schema.sql</code> 파일을 Supabase SQL Editor에서 실행하세요
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">RLS 정책 적용</h4>
                  <p className="text-sm text-muted-foreground">
                    <code>docs/rls-policies.sql</code> 파일을 Supabase SQL Editor에서 실행하세요
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Storage 정책 설정</h4>
                  <p className="text-sm text-muted-foreground">
                    <code>docs/storage-policies-guide.md</code> 가이드를 참고하여 Supabase 대시보드에서 Storage 정책을 설정하세요
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h4 className="font-medium">CRUD API 구현</h4>
                  <p className="text-sm text-muted-foreground">
                    게시물, 댓글, 좋아요 기능을 위한 API 라우트를 구현하세요
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 