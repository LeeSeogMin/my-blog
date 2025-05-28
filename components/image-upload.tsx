/**
 * 이미지 업로드 컴포넌트
 * 블로그 게시물의 커버 이미지 업로드를 위한 UI 제공
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useImageUpload, formatFileSize, isImageFile } from '@/lib/upload-image';

// ========================================
// 타입 정의
// ========================================

/**
 * 업로드 상태 타입
 */
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/**
 * ImageUpload 컴포넌트 Props
 */
interface ImageUploadProps {
  /** 업로드 완료 시 호출되는 콜백 함수 */
  onImageUploaded: (url: string) => void;
  /** 초기 이미지 URL (수정 시 사용) */
  initialImage?: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

// ========================================
// 메인 컴포넌트
// ========================================

/**
 * 이미지 업로드 컴포넌트
 * 
 * @param props - ImageUploadProps
 * @returns JSX.Element
 */
export default function ImageUpload({
  onImageUploaded,
  initialImage,
  className = ''
}: ImageUploadProps) {
  // ========================================
  // 상태 관리
  // ========================================
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // ========================================
  // Refs 및 Hooks
  // ========================================
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage } = useImageUpload();

  // ========================================
  // 초기 이미지 설정
  // ========================================
  
  useEffect(() => {
    if (initialImage && !previewUrl) {
      setPreviewUrl(initialImage);
    }
  }, [initialImage, previewUrl]);

  // ========================================
  // 이벤트 핸들러
  // ========================================

  /**
   * 파일 선택 버튼 클릭 핸들러
   */
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * 파일 선택 변경 핸들러
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // 파일 형식 검증
    if (!isImageFile(file)) {
      setErrorMessage('지원되지 않는 파일 형식입니다. JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.');
      setUploadStatus('error');
      return;
    }

    // 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrorMessage(`파일 크기가 너무 큽니다. ${formatFileSize(maxSize)} 이하의 파일을 선택해주세요.`);
      setUploadStatus('error');
      return;
    }

    // 상태 초기화
    setErrorMessage('');
    setUploadStatus('idle');
    setSelectedFile(file);

    // 미리보기 URL 생성
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  /**
   * 업로드 버튼 클릭 핸들러
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);
      setErrorMessage('');

      // 진행률 시뮬레이션 (실제 진행률은 Supabase에서 제공하지 않음)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // 이미지 업로드 실행
      const result = await uploadImage(selectedFile);

      // 진행률 완료
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.url) {
        setUploadStatus('success');
        onImageUploaded(result.url);
        
        // 성공 메시지 표시 후 상태 초기화
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadProgress(0);
        }, 2000);
      } else {
        setUploadStatus('error');
        setErrorMessage(result.error || '업로드에 실패했습니다.');
        setUploadProgress(0);
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('업로드 중 오류가 발생했습니다.');
      setUploadProgress(0);
      console.error('업로드 오류:', error);
    }
  };

  /**
   * 이미지 제거 핸들러
   */
  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(initialImage || null);
    setUploadStatus('idle');
    setErrorMessage('');
    setUploadProgress(0);
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ========================================
  // 렌더링 헬퍼 함수
  // ========================================

  /**
   * 업로드 상태에 따른 버튼 텍스트 반환
   */
  const getUploadButtonText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return '업로드 중...';
      case 'success':
        return '업로드 완료!';
      case 'error':
        return '다시 시도';
      default:
        return '업로드';
    }
  };

  /**
   * 업로드 상태에 따른 버튼 아이콘 반환
   */
  const getUploadButtonIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Upload className="w-4 h-4" />;
    }
  };

  // ========================================
  // 메인 렌더링
  // ========================================

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 미리보기 영역 */}
      <div className="relative">
        {previewUrl ? (
          <div className="relative group">
            {/* 이미지 미리보기 */}
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
              <img
                src={previewUrl}
                alt="미리보기"
                className="w-full h-full object-cover"
              />
              
              {/* 오버레이 (호버 시 표시) */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button
                  onClick={handleRemove}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200"
                  title="이미지 제거"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 파일 정보 */}
            {selectedFile && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            )}
          </div>
        ) : (
          /* 파일 선택 영역 */
          <div
            onClick={handleSelectClick}
            className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors duration-200"
          >
            <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium mb-2">이미지를 선택하세요</p>
            <p className="text-gray-500 text-sm text-center px-4">
              JPG, PNG, GIF, WebP 파일을 지원합니다<br />
              최대 10MB까지 업로드 가능합니다
            </p>
          </div>
        )}
      </div>

      {/* 업로드 진행률 바 */}
      {uploadStatus === 'uploading' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* 에러 메시지 */}
      {uploadStatus === 'error' && errorMessage && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* 성공 메시지 */}
      {uploadStatus === 'success' && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <Check className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">이미지가 성공적으로 업로드되었습니다!</p>
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="flex space-x-3">
        {/* 파일 선택 버튼 */}
        <button
          onClick={handleSelectClick}
          disabled={uploadStatus === 'uploading'}
          className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <ImageIcon className="w-4 h-4" />
          <span>{previewUrl ? '다른 이미지 선택' : '이미지 선택'}</span>
        </button>

        {/* 업로드 버튼 */}
        {selectedFile && (
          <button
            onClick={handleUpload}
            disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
            className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
              uploadStatus === 'success'
                ? 'bg-green-500 text-white'
                : uploadStatus === 'error'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white'
            }`}
          >
            {getUploadButtonIcon()}
            <span>{getUploadButtonText()}</span>
          </button>
        )}
      </div>
    </div>
  );
} 