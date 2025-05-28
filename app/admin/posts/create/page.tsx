'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import ImageUpload from '@/components/image-upload';
import Link from 'next/link';

/**
 * 관리자용 게시물 작성 페이지 (2025년 새로운 Third-Party Auth 방식)
 * 
 * 특징:
 * - Clerk 인증 확인
 * - 실제 API 연동 (게시물 생성, 카테고리 조회)
 * - 이미지 업로드 통합
 * - TypeScript 타입 안전성
 */

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string;
  category_id: number | null;
  status: 'draft' | 'published';
}

export default function CreatePostPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  // 폼 상태
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image_url: '',
    category_id: null,
    status: 'published'
  });

  // UI 상태
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // 슬러그 자동 생성 함수
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9가-힣\s\-]/g, '') // 안전한 문자만 허용
      .replace(/\s+/g, '-') // 공백을 하이픈으로
      .replace(/-+/g, '-') // 연속 하이픈 제거
      .replace(/^-|-$/g, ''); // 앞뒤 하이픈 제거
  };

  // 카테고리 목록 조회
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data || []);
      } else {
        console.error('카테고리 조회 실패:', data.error);
      }
    } catch (error) {
      console.error('카테고리 조회 오류:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // 컴포넌트 마운트 시 카테고리 조회
  useEffect(() => {
    if (isSignedIn) {
      fetchCategories();
    }
  }, [isSignedIn]);

  // 제목 변경 시 슬러그 자동 생성
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  // 이미지 업로드 완료 핸들러
  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({
      ...prev,
      cover_image_url: url
    }));
    setSuccess('이미지가 성공적으로 업로드되었습니다!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // 카테고리 선택 핸들러
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category_id: value === 'none' ? null : parseInt(value)
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 기본 검증
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      // 요약이 없으면 내용의 첫 150자로 자동 생성
      const excerpt = formData.excerpt.trim() || 
        formData.content.trim().substring(0, 150) + '...';

      const postData = {
        ...formData,
        excerpt,
        // category_id가 null이면 undefined로 변환 (API에서 처리하기 위해)
        category_id: formData.category_id || undefined,
        featured_image: formData.cover_image_url
      };

      console.log('게시물 생성 요청:', postData);

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('게시물이 성공적으로 생성되었습니다!');
        console.log('생성된 게시물:', data.data);
        
        // 2초 후 게시물 상세 페이지로 이동
        setTimeout(() => {
          router.push(`/posts/${data.data.slug}`);
        }, 2000);
      } else {
        setError(data.error || '게시물 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시물 생성 오류:', error);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 로딩 중이거나 인증 정보가 없는 경우
  if (!isLoaded) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">로딩 중...</span>
        </div>
      </div>
    );
  }

  // 인증되지 않은 사용자
  if (!isSignedIn) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>접근 권한 없음</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              게시물을 작성하려면 먼저 로그인해주세요.
            </p>
            <Button asChild>
              <Link href="/sign-in">로그인</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">새 게시물 작성</h1>
            <p className="text-muted-foreground">
              작성자: {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* 성공/에러 메시지 */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 게시물 작성 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>게시물 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="게시물 제목을 입력하세요"
                required
              />
            </div>

            {/* 슬러그 */}
            <div className="space-y-2">
              <Label htmlFor="slug">슬러그 (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="URL에 사용될 슬러그 (자동 생성됨)"
              />
              <p className="text-sm text-muted-foreground">
                URL: /posts/{formData.slug || 'your-post-slug'}
              </p>
            </div>

            {/* 카테고리 선택 */}
            <div className="space-y-2">
              <Label>카테고리</Label>
              {categoriesLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">카테고리 로딩 중...</span>
                </div>
              ) : (
                <Select
                  value={formData.category_id?.toString() || 'none'}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">카테고리 없음</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* 커버 이미지 업로드 */}
            <div className="space-y-2">
              <Label>커버 이미지</Label>
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                initialImage={formData.cover_image_url}
                className="w-full"
              />
            </div>

            {/* 요약 */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">요약</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="게시물 요약 (비워두면 자동 생성됨)"
                rows={3}
              />
            </div>

            {/* 내용 */}
            <div className="space-y-2">
              <Label htmlFor="content">내용 *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="게시물 내용을 입력하세요"
                rows={12}
                required
              />
            </div>

            {/* 상태 선택 */}
            <div className="space-y-2">
              <Label>발행 상태</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'draft' | 'published') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">발행</SelectItem>
                  <SelectItem value="draft">임시저장</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 버튼 */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    저장 중...
                  </>
                ) : (
                  '게시물 저장'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 