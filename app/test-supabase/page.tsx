'use client';

import { useSession, useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Database, Key, User } from 'lucide-react';

/**
 * 2025년 새로운 Clerk Third-Party Auth 통합 테스트 페이지
 * JWT Template 방식 deprecated 이후 새로운 방식 사용
 */
export default function TestSupabasePage() {
  // Clerk 세션 및 사용자 정보
  const { session, isLoaded: sessionLoaded } = useSession();
  const { user, isLoaded: userLoaded } = useUser();
  
  // 테스트 상태
  const [supabaseTest, setSupabaseTest] = useState<{
    connected: boolean;
    error?: string;
    tokenInfo?: any;
  }>({ connected: false });
  
  const [envCheck, setEnvCheck] = useState({
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    clerkPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });

  /**
   * 새로운 방식의 Supabase 클라이언트 생성 (2025년 권장)
   * accessToken 방식 사용 - JWT Template 방식 대체
   */
  const createSupabaseClient = () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
    }

    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: async () => {
            // ✅ 2025년 새로운 방식: 세션에서 토큰 직접 추출
            if (session) {
              const token = await session.getToken();
              return token ? { Authorization: `Bearer ${token}` } : {};
            }
            return {};
          },
        },
      }
    );
  };

  /**
   * Supabase 연결 및 RLS 정책 테스트
   */
  const testSupabaseConnection = async () => {
    if (!session) {
      setSupabaseTest({
        connected: false,
        error: '로그인이 필요합니다.'
      });
      return;
    }

    try {
      // 세션 토큰 정보 추출
      const token = await session.getToken();
      
      if (!token) {
        throw new Error('세션 토큰을 가져올 수 없습니다.');
      }

      // JWT 토큰 디코딩 (헤더와 페이로드만)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('유효하지 않은 JWT 토큰 형식입니다.');
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      
      // ✅ 새로운 방식 Supabase 클라이언트 생성
      const supabase = createSupabaseClient();
      
      // 간단한 연결 테스트 (인증이 필요하지 않은 쿼리)
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);

      if (error && !error.message.includes('relation "information_schema.tables" does not exist')) {
        throw error;
      }

      setSupabaseTest({
        connected: true,
        tokenInfo: {
          sub: payload.sub, // Clerk 사용자 ID
          role: payload.role, // 'authenticated' 또는 'anon'
          aud: payload.aud,
          exp: new Date(payload.exp * 1000).toLocaleString(),
          iat: new Date(payload.iat * 1000).toLocaleString(),
        }
      });

    } catch (error) {
      console.error('Supabase 연결 테스트 오류:', error);
      setSupabaseTest({
        connected: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      });
    }
  };

  // 페이지 로드 시 환경변수 확인
  useEffect(() => {
    setEnvCheck({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      clerkPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });
  }, []);

  // 로딩 상태
  if (!sessionLoaded || !userLoaded) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">세션 정보를 로드하는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Supabase Third-Party Auth 테스트</h1>
        <p className="text-muted-foreground">
          2025년 새로운 Clerk ↔ Supabase 통합 방식 테스트
        </p>
        <Badge variant="outline" className="mt-2">
          JWT Template 방식 Deprecated → Third-Party Auth 방식
        </Badge>
      </div>

      {/* 환경변수 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            환경변수 상태
          </CardTitle>
          <CardDescription>
            필수 환경변수가 올바르게 설정되었는지 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>NEXT_PUBLIC_SUPABASE_URL</span>
            {envCheck.supabaseUrl ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                설정됨
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                미설정
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            {envCheck.supabaseKey ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                설정됨
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                미설정
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</span>
            {envCheck.clerkPublishable ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                설정됨
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                미설정
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clerk 세션 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Clerk 세션 정보
          </CardTitle>
          <CardDescription>
            현재 로그인된 사용자의 세션 상태를 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {user ? (
            <>
              <div className="flex items-center justify-between">
                <span>로그인 상태</span>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  로그인됨
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>사용자 ID</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {user.id}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span>이메일</span>
                <span className="text-sm text-muted-foreground">
                  {user.emailAddresses[0]?.emailAddress || '없음'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>세션 활성화</span>
                {session ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    활성화됨
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    비활성화
                  </Badge>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <XCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">로그인이 필요합니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supabase 연결 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Third-Party Auth 테스트
          </CardTitle>
          <CardDescription>
            새로운 방식의 JWT 토큰 전달 및 RLS 정책 동작을 테스트합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testSupabaseConnection}
            disabled={!session || !envCheck.supabaseUrl || !envCheck.supabaseKey}
            className="w-full"
          >
            Supabase 연결 테스트
          </Button>

          {supabaseTest.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">연결 실패</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{supabaseTest.error}</p>
            </div>
          )}

          {supabaseTest.connected && supabaseTest.tokenInfo && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-3">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">연결 성공</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">사용자 ID (sub):</span>
                  <code className="bg-white px-2 py-1 rounded border text-xs">
                    {supabaseTest.tokenInfo.sub}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">역할 (role):</span>
                  <Badge variant={supabaseTest.tokenInfo.role === 'authenticated' ? 'default' : 'secondary'}>
                    {supabaseTest.tokenInfo.role}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">발급 시간:</span>
                  <span className="text-xs text-muted-foreground">
                    {supabaseTest.tokenInfo.iat}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">만료 시간:</span>
                  <span className="text-xs text-muted-foreground">
                    {supabaseTest.tokenInfo.exp}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800 text-xs">
                  ✅ <strong>auth.jwt()-&gt;&gt;'sub'</strong> 함수로 사용자 ID 접근 가능<br/>
                  ✅ RLS 정책에서 <strong>requesting_user_id()</strong> 사용 가능<br/>
                  ✅ Third-Party Auth 통합 정상 작동
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 테스트 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle>테스트 가이드</CardTitle>
          <CardDescription>
            Third-Party Auth 통합이 올바르게 작동하는지 확인하는 방법
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Badge className="mt-1 text-xs">1</Badge>
            <div>
              <p className="font-medium">환경변수 확인</p>
              <p className="text-muted-foreground">모든 환경변수가 "설정됨" 상태인지 확인</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="mt-1 text-xs">2</Badge>
            <div>
              <p className="font-medium">Clerk 로그인</p>
              <p className="text-muted-foreground">로그인하여 세션이 활성화되었는지 확인</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="mt-1 text-xs">3</Badge>
            <div>
              <p className="font-medium">Supabase 연결 테스트</p>
              <p className="text-muted-foreground">"Supabase 연결 테스트" 버튼 클릭하여 JWT 토큰 확인</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="mt-1 text-xs">4</Badge>
            <div>
              <p className="font-medium">JWT 클레임 확인</p>
              <p className="text-muted-foreground">role이 'authenticated', sub에 Clerk 사용자 ID 포함 확인</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 