/**
 * 이미지 업로드 컴포넌트
 * 파일 선택, 미리보기, 업로드 기능을 제공
 */

'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadImage } from '@/lib/upload-image'

// =====================================================
// 타입 정의
// =====================================================

/**
 * ImageUpload 컴포넌트 Props 인터페이스
 */
interface ImageUploadProps {
  /** 업로드 완료 시 호출되는 콜백 함수 */
  onImageUploaded: (url: string) => void
  /** 초기 이미지 URL (수정 시 사용) */
  initialImage?: string
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * 업로드 상태 타입
 */
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

// =====================================================
// 메인 컴포넌트
// =====================================================

/**
 * 이미지 업로드 컴포넌트
 * 
 * 사용법:
 * ```tsx
 * <ImageUpload 
 *   onImageUploaded={(url) => console.log('업로드된 URL:', url)}
 *   initialImage="https://example.com/image.jpg"
 * />
 * ```
 */
export default function ImageUpload({ 
  onImageUploaded, 
  initialImage, 
  className = '' 
}: ImageUploadProps) {
  // =====================================================
  // 상태 관리
  // =====================================================
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(initialImage || '')
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  // 파일 입력 참조
  const fileInputRef = useRef<HTMLInputElement>(null)

  // =====================================================
  // 이벤트 핸들러
  // =====================================================

  /**
   * 파일 선택 버튼 클릭 핸들러
   */
  const handleSelectClick = () => {
    fileInputRef.current?.click()
  }

  /**
   * 파일 선택 변경 핸들러
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (!file) return

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('지원되는 이미지 형식: JPG, PNG, GIF, WebP')
      return
    }

    // 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setErrorMessage('파일 크기는 10MB 이하여야 합니다')
      return
    }

    // 상태 업데이트
    setSelectedFile(file)
    setErrorMessage('')
    setUploadStatus('idle')

    // 미리보기 URL 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  /**
   * 업로드 버튼 클릭 핸들러
   */
  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadStatus('uploading')
    setErrorMessage('')

    try {
      const result = await uploadImage(selectedFile)
      
      if (result.success && result.url) {
        setUploadStatus('success')
        onImageUploaded(result.url)
      } else {
        setUploadStatus('error')
        setErrorMessage(result.error || '업로드에 실패했습니다')
      }
    } catch (error) {
      setUploadStatus('error')
      setErrorMessage('업로드 중 오류가 발생했습니다')
      console.error('업로드 오류:', error)
    }
  }

  /**
   * 이미지 제거 핸들러
   */
  const handleRemove = () => {
    setSelectedFile(null)
    setPreviewUrl(initialImage || '')
    setUploadStatus('idle')
    setErrorMessage('')
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // =====================================================
  // 렌더링 도우미 함수
  // =====================================================

  /**
   * 업로드 상태에 따른 버튼 텍스트 반환
   */
  const getUploadButtonText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return '업로드 중...'
      case 'success':
        return '업로드 완료'
      default:
        return '업로드'
    }
  }

  /**
   * 업로드 상태에 따른 버튼 아이콘 반환
   */
  const getUploadButtonIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'success':
        return <Upload className="w-4 h-4" />
      default:
        return <Upload className="w-4 h-4" />
    }
  }

  // =====================================================
  // 메인 렌더링
  // =====================================================

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 파일 입력 (숨김) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 이미지 미리보기 영역 */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          {previewUrl ? (
            // 이미지가 있는 경우
            <div className="relative">
              <div className="aspect-video w-full max-w-md mx-auto bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 제거 버튼 */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            // 이미지가 없는 경우
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                커버 이미지를 선택해주세요
              </p>
              <p className="text-sm text-gray-500 mb-4">
                JPG, PNG, GIF, WebP 형식 지원 (최대 10MB)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 버튼 영역 */}
      <div className="flex gap-2 flex-wrap">
        {/* 파일 선택 버튼 */}
        <Button
          variant="outline"
          onClick={handleSelectClick}
          disabled={uploadStatus === 'uploading'}
          className="flex-1 sm:flex-none"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          {selectedFile ? '다른 이미지 선택' : '이미지 선택'}
        </Button>

        {/* 업로드 버튼 */}
        {selectedFile && (
          <Button
            onClick={handleUpload}
            disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
            className="flex-1 sm:flex-none"
          >
            {getUploadButtonIcon()}
            <span className="ml-2">{getUploadButtonText()}</span>
          </Button>
        )}
      </div>

      {/* 에러 메시지 */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* 성공 메시지 */}
      {uploadStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            이미지가 성공적으로 업로드되었습니다!
          </AlertDescription>
        </Alert>
      )}

      {/* 선택된 파일 정보 */}
      {selectedFile && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p><strong>파일명:</strong> {selectedFile.name}</p>
          <p><strong>크기:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          <p><strong>형식:</strong> {selectedFile.type}</p>
        </div>
      )}
    </div>
  )
} 