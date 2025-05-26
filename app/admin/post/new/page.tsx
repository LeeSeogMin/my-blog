/**
 * 새 게시물 작성 페이지
 * PostForm 컴포넌트를 사용하여 게시물 작성 기능 제공
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import PostForm from '@/components/admin/post-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Lock } from 'lucide-react'

/**
 * 게시물 폼 데이터 타입 (PostForm과 동일)
 */
interface PostFormData {
  title: string
  content: string
  slug: string
  coverImageUrl: string
  categoryId: string
}

export default function NewPostPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // 인증 로딩 중
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">인증 상태를 확인하는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 미인증 사용자 접근 차단
  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              접근 권한이 없습니다
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-700">
            <p className="mb-4">게시물을 작성하려면 로그인이 필요합니다.</p>
            <Button 
              onClick={() => router.push('/sign-in')}
              className="w-full"
            >
              로그인하기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (data: PostFormData) => {
    setIsLoading(true)
    
    try {
      console.log('=== 새 게시물 생성 요청 ===')
      console.log('API 엔드포인트: POST /api/posts')
      console.log('요청 데이터:', data)
      
      // 실제 API 호출
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          slug: data.slug,
          cover_image_url: data.coverImageUrl || null,
          category_id: data.categoryId === 'none' ? null : data.categoryId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '게시물 생성에 실패했습니다')
      }

      const result = await response.json()
      console.log('✅ 게시물 생성 성공:', result)
      
      // 성공 시 게시물 상세 페이지로 이동
      router.push(`/posts/${data.slug}`)
      
    } catch (error) {
      console.error('❌ 게시물 생성 실패:', error)
      alert(error instanceof Error ? error.message : '게시물 생성에 실패했습니다')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 취소 핸들러
   */
  const handleCancel = () => {
    if (confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
      router.back()
    }
  }

  /**
   * 뒤로 가기 핸들러
   */
  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              새 게시물 작성
            </h1>
            <p className="text-gray-600 mt-1">
              블로그에 새로운 게시물을 작성해보세요.
            </p>
          </div>
        </div>
      </div>

      {/* 안내 카드 */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 text-lg">
            📝 게시물 작성 가이드
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="space-y-2 text-sm">
            <li>• <strong>제목</strong>: 독자의 관심을 끌 수 있는 명확한 제목을 작성하세요</li>
            <li>• <strong>URL 슬러그</strong>: 제목을 입력하면 자동으로 생성됩니다</li>
            <li>• <strong>커버 이미지</strong>: 게시물을 대표하는 이미지를 업로드하세요 (선택사항)</li>
            <li>• <strong>카테고리</strong>: 게시물의 주제에 맞는 카테고리를 선택하세요</li>
            <li>• <strong>내용</strong>: 최소 10글자 이상의 의미 있는 내용을 작성하세요</li>
          </ul>
        </CardContent>
      </Card>

      {/* 게시물 작성 폼 */}
      <PostForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        className="mb-8"
      />

      {/* 개발자 정보 */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 text-sm">
            ✅ 실제 데이터베이스 연동 완료
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-green-700">
          <div className="space-y-2">
            <p><strong>현재 상태:</strong> 실제 Supabase 데이터베이스 연동</p>
            <p><strong>기능:</strong> 게시물 작성, 이미지 업로드, 카테고리 선택</p>
            <p><strong>저장 위치:</strong> Supabase posts 테이블</p>
            <p><strong>성공 시:</strong> 게시물 상세 페이지로 자동 이동</p>
            <p><strong>확인 방법:</strong> 저장 후 홈페이지나 게시물 목록에서 새 게시물 확인</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 