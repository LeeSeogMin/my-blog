'use client';

import { useState } from 'react';
import { useUser, useSession } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * 게시물 및 카테고리 CRUD API 테스트 페이지
 * 2025년 새로운 Third-Party Auth 방식 테스트
 */
export default function TestAPIPage() {
  const { user, isSignedIn } = useUser();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // 테스트용 게시물 데이터
  const [testPost, setTestPost] = useState({
    title: '테스트 게시물',
    content: '이것은 API 테스트용 게시물입니다.',
    slug: 'test-post-' + Date.now(),
    excerpt: '테스트 게시물 요약',
    status: 'published' as const,
    cover_image_url: '',
    category_id: null
  });

  // 테스트용 카테고리 데이터
  const [testCategory, setTestCategory] = useState({
    name: '테스트 카테고리',
    slug: 'test-category-' + Date.now(),
    description: '이것은 API 테스트용 카테고리입니다.',
    color: '#6366f1'
  });

  const [postId, setPostId] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [categorySlug, setCategorySlug] = useState('');

  // API 호출 헬퍼 함수 (2025년 새로운 Third-Party Auth 방식)
  const callAPI = async (url: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 2025년 새로운 방식: session?.getToken() 사용 (JWT Template 방식 deprecated)
      const token = await session?.getToken();
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      console.log(`🔄 API 호출: ${method} ${url}`);
      console.log(`🔑 토큰 존재: ${token ? '✅' : '❌'}`);
      console.log(`👤 Clerk 사용자 ID: ${user?.id || 'undefined'}`);

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setResult(data);
      
      // ID나 슬러그 자동 저장
      if (data.data?.id) {
        if (url.includes('/posts')) {
          setPostId(data.data.id.toString());
        } else if (url.includes('/categories')) {
          setCategorySlug(data.data.slug || '');
        }
      }
      
    } catch (err: any) {
      console.error('❌ API 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 게시물 테스트 함수들
  const testGetPosts = () => callAPI('/api/posts');
  const testCreatePost = () => callAPI('/api/posts', 'POST', testPost);
  const testGetPost = () => {
    if (!postId) {
      setError('먼저 게시물을 생성하거나 ID를 입력하세요');
      return;
    }
    callAPI(`/api/posts/${postId}`);
  };
  const testGetPostBySlug = () => {
    if (!postSlug) {
      setError('먼저 게시물을 생성하거나 slug를 입력하세요');
      return;
    }
    callAPI(`/api/posts/slug/${postSlug}`);
  };
  const testUpdatePost = () => {
    if (!postId) {
      setError('먼저 게시물을 생성하거나 ID를 입력하세요');
      return;
    }
    callAPI(`/api/posts/${postId}`, 'PUT', {
      title: testPost.title + ' (수정됨)',
      content: testPost.content + '\n\n수정된 내용입니다.'
    });
  };
  const testDeletePost = () => {
    if (!postId) {
      setError('먼저 게시물을 생성하거나 ID를 입력하세요');
      return;
    }
    callAPI(`/api/posts/${postId}`, 'DELETE');
  };

  // 카테고리 테스트 함수들
  const testGetCategories = () => callAPI('/api/categories');
  const testGetCategoriesWithCount = () => callAPI('/api/categories?includePostCount=true');
  const testCreateCategory = () => callAPI('/api/categories', 'POST', testCategory);
  const testGetCategoryPosts = () => {
    if (!categorySlug) {
      setError('먼저 카테고리를 생성하거나 슬러그를 입력하세요');
      return;
    }
    callAPI(`/api/categories/${categorySlug}/posts`);
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>API 테스트</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              API 테스트를 위해 먼저 로그인해주세요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CRUD API 테스트</CardTitle>
          <p className="text-sm text-muted-foreground">
            사용자: {user?.firstName} {user?.lastName} ({user?.id})
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts">게시물 API</TabsTrigger>
              <TabsTrigger value="categories">카테고리 API</TabsTrigger>
            </TabsList>

            {/* 게시물 API 테스트 */}
            <TabsContent value="posts" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">제목</label>
                  <Input
                    value={testPost.title}
                    onChange={(e) => setTestPost(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">슬러그</label>
                  <Input
                    value={testPost.slug}
                    onChange={(e) => setTestPost(prev => ({ ...prev, slug: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">내용</label>
                <Textarea
                  value={testPost.content}
                  onChange={(e) => setTestPost(prev => ({ ...prev, content: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">게시물 ID (수정/삭제용)</label>
                  <Input
                    value={postId}
                    onChange={(e) => setPostId(e.target.value)}
                    placeholder="게시물 생성 후 자동 입력됨"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">게시물 Slug (조회용)</label>
                  <Input
                    value={postSlug}
                    onChange={(e) => setPostSlug(e.target.value)}
                    placeholder="게시물 생성 후 자동 입력됨"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <Button onClick={testGetPosts} disabled={loading} variant="outline">
                  목록 조회
                </Button>
                <Button onClick={testCreatePost} disabled={loading}>
                  게시물 생성
                </Button>
                <Button onClick={testGetPost} disabled={loading} variant="outline">
                  ID로 조회
                </Button>
                <Button onClick={testGetPostBySlug} disabled={loading} variant="outline">
                  Slug로 조회
                </Button>
                <Button onClick={testUpdatePost} disabled={loading} variant="secondary">
                  게시물 수정
                </Button>
                <Button onClick={testDeletePost} disabled={loading} variant="destructive">
                  게시물 삭제
                </Button>
              </div>
            </TabsContent>

            {/* 카테고리 API 테스트 */}
            <TabsContent value="categories" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">카테고리 이름</label>
                  <Input
                    value={testCategory.name}
                    onChange={(e) => setTestCategory(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">슬러그</label>
                  <Input
                    value={testCategory.slug}
                    onChange={(e) => setTestCategory(prev => ({ ...prev, slug: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">설명</label>
                  <Textarea
                    value={testCategory.description}
                    onChange={(e) => setTestCategory(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">색상</label>
                  <Input
                    type="color"
                    value={testCategory.color}
                    onChange={(e) => setTestCategory(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">카테고리 슬러그 (게시물 조회용)</label>
                <Input
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  placeholder="카테고리 생성 후 자동 입력됨"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button onClick={testGetCategories} disabled={loading} variant="outline">
                  카테고리 목록
                </Button>
                <Button onClick={testGetCategoriesWithCount} disabled={loading} variant="outline">
                  목록 (게시물 수)
                </Button>
                <Button onClick={testCreateCategory} disabled={loading}>
                  카테고리 생성
                </Button>
                <Button onClick={testGetCategoryPosts} disabled={loading} variant="secondary">
                  카테고리 게시물
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-4 mt-4">
              <p className="text-muted-foreground">API 호출 중...</p>
            </div>
          )}

          {/* 에러 표시 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
              <p className="text-red-800 font-medium">오류 발생:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* 결과 표시 */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
              <p className="text-green-800 font-medium mb-2">API 응답:</p>
              <pre className="text-sm text-green-700 overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 사용법 안내 */}
      <Card>
        <CardHeader>
          <CardTitle>테스트 순서</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">게시물 API 테스트</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>목록 조회: 현재 게시물 목록 확인</li>
                <li>게시물 생성: 새 게시물 생성 및 ID/Slug 저장</li>
                <li>ID로 조회: 생성된 게시물 ID로 상세 정보 조회</li>
                <li>Slug로 조회: 생성된 게시물 Slug로 상세 정보 조회 (SEO 친화적)</li>
                <li>게시물 수정: 게시물 내용 수정</li>
                <li>게시물 삭제: 게시물 삭제</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">카테고리 API 테스트</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>카테고리 목록: 모든 카테고리 조회</li>
                <li>목록 (게시물 수): 게시물 수 포함 조회</li>
                <li>카테고리 생성: 새 카테고리 생성 및 슬러그 저장</li>
                <li>카테고리 게시물: 특정 카테고리의 게시물 조회</li>
              </ol>
            </div>
          </div>
          <p className="text-muted-foreground mt-4">
            ⚠️ 수정/삭제는 본인이 작성한 게시물만 가능합니다.
          </p>
          <p className="text-muted-foreground mt-2">
            🔍 Slug 조회는 조회수도 자동으로 증가시킵니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 