/**
 * 관리자용 게시물 작성/수정 폼 컴포넌트
 * ImageUpload 컴포넌트를 통합하여 커버 이미지 업로드 기능 제공
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Save, X, AlertCircle } from 'lucide-react'
import ImageUpload from '@/components/image-upload'

// =====================================================
// 타입 정의
// =====================================================

/**
 * 게시물 폼 데이터 타입
 */
interface PostFormData {
  title: string
  content: string
  slug: string
  coverImageUrl: string
  categoryId: string
}

/**
 * 카테고리 타입 (임시 - 실제로는 데이터베이스에서 가져올 예정)
 */
interface Category {
  id: string
  name: string
  slug: string
}

/**
 * PostForm 컴포넌트 Props
 */
interface PostFormProps {
  /** 초기 데이터 (수정 시 사용) */
  initialData?: Partial<PostFormData>
  /** 폼 제출 핸들러 */
  onSubmit?: (data: PostFormData) => void
  /** 취소 핸들러 */
  onCancel?: () => void
  /** 로딩 상태 */
  isLoading?: boolean
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * 폼 검증 오류 타입
 */
interface FormErrors {
  title?: string
  content?: string
  slug?: string
}

// =====================================================
// 카테고리 데이터 (실제 API에서 가져옴)
// =====================================================

// =====================================================
// 유틸리티 함수
// =====================================================

/**
 * 제목을 URL 친화적인 slug로 변환
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 특수문자 제거
    .replace(/[\s_-]+/g, '-') // 공백을 하이픈으로
    .replace(/^-+|-+$/g, '') // 앞뒤 하이픈 제거
}

/**
 * 폼 데이터 검증
 */
function validateForm(data: PostFormData): FormErrors {
  const errors: FormErrors = {}

  if (!data.title.trim()) {
    errors.title = '제목을 입력해주세요'
  } else if (data.title.length < 2) {
    errors.title = '제목은 2글자 이상이어야 합니다'
  } else if (data.title.length > 100) {
    errors.title = '제목은 100글자 이하여야 합니다'
  }

  if (!data.content.trim()) {
    errors.content = '내용을 입력해주세요'
  } else if (data.content.length < 10) {
    errors.content = '내용은 10글자 이상이어야 합니다'
  }

  if (!data.slug.trim()) {
    errors.slug = 'URL 슬러그가 생성되지 않았습니다'
  }

  return errors
}

// =====================================================
// 메인 컴포넌트
// =====================================================

/**
 * 게시물 작성/수정 폼 컴포넌트
 * 
 * 사용법:
 * ```tsx
 * <PostForm 
 *   onSubmit={(data) => console.log('제출된 데이터:', data)}
 *   onCancel={() => router.back()}
 * />
 * ```
 */
export default function PostForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className = ''
}: PostFormProps) {
  // =====================================================
  // 상태 관리
  // =====================================================

  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    slug: initialData?.slug || '',
    coverImageUrl: initialData?.coverImageUrl || '',
    categoryId: initialData?.categoryId || 'none'
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'available' | 'taken' | 'checking' | null>(null)

  // =====================================================
  // 이펙트
  // =====================================================

  /**
   * 컴포넌트 마운트 시 카테고리 목록 로드
   */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        } else {
          console.error('카테고리 로드 실패:', response.statusText)
        }
      } catch (error) {
        console.error('카테고리 로드 중 오류:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  /**
   * 제목 변경 시 자동으로 slug 생성 (서버 API 사용)
   */
  useEffect(() => {
    const generateSlugFromTitle = async () => {
      if (formData.title.trim()) {
        try {
          const response = await fetch('/api/posts/generate-slug', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: formData.title }),
          });

          if (response.ok) {
            const data = await response.json();
            setFormData(prev => ({ ...prev, slug: data.slug }));
          } else {
            // 서버 API 실패 시 클라이언트 사이드 생성으로 폴백
            const newSlug = generateSlug(formData.title);
            setFormData(prev => ({ ...prev, slug: newSlug }));
          }
        } catch (error) {
          console.error('슬러그 생성 오류:', error);
          // 오류 시 클라이언트 사이드 생성으로 폴백
          const newSlug = generateSlug(formData.title);
          setFormData(prev => ({ ...prev, slug: newSlug }));
        }
      }
    };

    const timeoutId = setTimeout(generateSlugFromTitle, 500); // 디바운싱
    return () => clearTimeout(timeoutId);
  }, [formData.title])

  // =====================================================
  // 유틸리티 함수
  // =====================================================

  /**
   * 슬러그 중복 확인
   */
  const checkSlugAvailability = async (slug: string) => {
    if (!slug.trim()) return;
    
    setIsCheckingSlug(true);
    setSlugStatus('checking');
    
    try {
      const response = await fetch('/api/posts');
      if (response.ok) {
        const data = await response.json();
        const existingSlugs = data.posts.map((post: any) => post.slug);
        const isAvailable = !existingSlugs.includes(slug);
        setSlugStatus(isAvailable ? 'available' : 'taken');
      }
    } catch (error) {
      console.error('슬러그 중복 확인 오류:', error);
      setSlugStatus(null);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  /**
   * 슬러그 수동 재생성
   */
  const regenerateSlug = async () => {
    if (!formData.title.trim()) return;
    
    try {
      const response = await fetch('/api/posts/generate-slug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: formData.title }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, slug: data.slug }));
        setSlugStatus('available');
      }
    } catch (error) {
      console.error('슬러그 재생성 오류:', error);
    }
  };

  // =====================================================
  // 이벤트 핸들러
  // =====================================================

  /**
   * 입력 필드 변경 핸들러
   */
  const handleInputChange = (field: keyof PostFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 해당 필드의 에러 제거
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  /**
   * 이미지 업로드 완료 핸들러
   */
  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, coverImageUrl: url }))
  }

  /**
   * 카테고리 선택 핸들러
   */
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, categoryId: value }))
  }

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 검증
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    try {
      // 카테고리 "none" 값을 빈 문자열로 변환
      const submitData: PostFormData = {
        ...formData,
        categoryId: formData.categoryId === 'none' ? '' : formData.categoryId
      }

      // 콘솔에 데이터 출력 (실제 저장은 다음 단계)
      console.log('=== 게시물 폼 제출 데이터 ===')
      console.log('제목:', submitData.title)
      console.log('슬러그:', submitData.slug)
      console.log('내용 길이:', submitData.content.length, '글자')
      console.log('커버 이미지:', submitData.coverImageUrl || '없음')
      console.log('카테고리 ID:', submitData.categoryId || '없음')
      console.log('전체 데이터:', submitData)

      // 부모 컴포넌트의 onSubmit 호출
      if (onSubmit) {
        await onSubmit(submitData)
      }

      // 성공 알림 (임시)
      alert('게시물 데이터가 콘솔에 출력되었습니다!')

    } catch (error) {
      console.error('폼 제출 오류:', error)
      alert('폼 제출 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * 취소 핸들러
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      // 기본 동작: 폼 초기화
      setFormData({
        title: '',
        content: '',
        slug: '',
        coverImageUrl: '',
        categoryId: 'none'
      })
      setErrors({})
    }
  }

  // =====================================================
  // 렌더링 도우미
  // =====================================================

  /**
   * 에러가 있는지 확인
   */
  const hasErrors = Object.keys(errors).length > 0

  /**
   * 제출 가능한지 확인
   */
  const canSubmit = formData.title.trim() && formData.content.trim() && !hasErrors

  // =====================================================
  // 메인 렌더링
  // =====================================================

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 폼 헤더 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              {initialData ? '게시물 수정' : '새 게시물 작성'}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                type="text"
                placeholder="게시물 제목을 입력하세요"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
                disabled={isLoading || isSubmitting}
              />
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* URL 슬러그 */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL 슬러그</Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  type="text"
                  placeholder="url-slug"
                  value={formData.slug}
                  onChange={(e) => {
                    handleInputChange('slug', e.target.value);
                    setSlugStatus(null);
                  }}
                  onBlur={() => checkSlugAvailability(formData.slug)}
                  className={errors.slug ? 'border-red-500' : ''}
                  disabled={isLoading || isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={regenerateSlug}
                  disabled={!formData.title.trim() || isLoading || isSubmitting}
                  className="whitespace-nowrap"
                >
                  재생성
                </Button>
              </div>
              
              {/* 슬러그 상태 표시 */}
              {slugStatus === 'checking' && (
                <p className="text-sm text-blue-600 flex items-center gap-1">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  중복 확인 중...
                </p>
              )}
              {slugStatus === 'available' && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  ✅ 사용 가능한 슬러그입니다
                </p>
              )}
              {slugStatus === 'taken' && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  ❌ 이미 사용 중인 슬러그입니다
                </p>
              )}
              
              {formData.slug && (
                <p className="text-sm text-gray-500">
                  URL: /posts/{formData.slug}
                </p>
              )}
              {errors.slug && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.slug}
                </p>
              )}
            </div>

            {/* 카테고리 선택 */}
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select
                value={formData.categoryId}
                onValueChange={handleCategoryChange}
                disabled={isLoading || isSubmitting || isLoadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoadingCategories ? "카테고리 로딩 중..." : "카테고리를 선택하세요"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">카테고리 없음</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingCategories && (
                <p className="text-sm text-gray-500">카테고리 목록을 불러오는 중...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 커버 이미지 */}
        <Card>
          <CardHeader>
            <CardTitle>커버 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              initialImage={formData.coverImageUrl}
              className="w-full"
            />
            {formData.coverImageUrl && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ 커버 이미지가 설정되었습니다
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 게시물 내용 */}
        <Card>
          <CardHeader>
            <CardTitle>게시물 내용</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">내용 *</Label>
              <Textarea
                id="content"
                placeholder="게시물 내용을 입력하세요..."
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className={`min-h-[300px] ${errors.content ? 'border-red-500' : ''}`}
                disabled={isLoading || isSubmitting}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{formData.content.length} 글자</span>
                <span>최소 10글자 이상</span>
              </div>
              {errors.content && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.content}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 전체 에러 메시지 */}
        {hasErrors && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              입력 정보를 확인해주세요. 필수 항목을 모두 올바르게 입력해야 합니다.
            </AlertDescription>
          </Alert>
        )}

        {/* 액션 버튼 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading || isSubmitting}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                취소
              </Button>
              
              <Button
                type="submit"
                disabled={!canSubmit || isLoading || isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? '저장 중...' : (initialData ? '수정하기' : '저장하기')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 폼 데이터 미리보기 (개발용) */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">폼 데이터 미리보기 (개발용)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </form>
    </div>
  )
} 