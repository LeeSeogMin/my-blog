/**
 * Supabase Storage 이미지 업로드 유틸리티
 * 2025년 새로운 Clerk Third-Party Auth 방식 사용
 */

'use client';

import { useSupabaseClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// ========================================
// 타입 정의
// ========================================

/**
 * 이미지 업로드 결과 타입
 */
export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * 지원되는 이미지 파일 형식
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
] as const;

/**
 * 파일 확장자 매핑
 */
const FILE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp'
};

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 파일 형식 검증 함수
 * @param file - 업로드할 파일
 * @returns 유효한 이미지 파일인지 여부
 */
function validateImageFile(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type as any);
}

/**
 * 고유한 파일명 생성 함수
 * 형식: timestamp_uuid.확장자
 * @param originalFile - 원본 파일
 * @returns 고유한 파일명
 */
function generateUniqueFileName(originalFile: File): string {
  const timestamp = Date.now();
  const uniqueId = uuidv4().substring(0, 8); // UUID 앞 8자리만 사용
  const extension = FILE_EXTENSIONS[originalFile.type] || 'jpg';
  
  return `${timestamp}_${uniqueId}.${extension}`;
}

// ========================================
// 메인 업로드 함수
// ========================================

/**
 * 이미지를 Supabase Storage에 업로드하는 함수
 * 
 * @param file - 업로드할 이미지 파일
 * @returns Promise<UploadResult> - 업로드 결과
 * 
 * @example
 * ```typescript
 * const result = await uploadImage(selectedFile);
 * if (result.success) {
 *   console.log('업로드 성공:', result.url);
 * } else {
 *   console.error('업로드 실패:', result.error);
 * }
 * ```
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    // 1. 파일 형식 검증
    if (!validateImageFile(file)) {
      return {
        success: false,
        error: '지원되지 않는 파일 형식입니다. JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.'
      };
    }

    // 2. 파일 크기 확인 (선택적 - 현재는 제한 없음)
    // if (file.size > 10 * 1024 * 1024) { // 10MB 제한 예시
    //   return {
    //     success: false,
    //     error: '파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.'
    //   };
    // }

    // 3. 고유한 파일명 생성
    const fileName = generateUniqueFileName(file);

    // 4. Supabase 클라이언트 가져오기 (새로운 Third-Party Auth 방식)
    // 주의: 이 함수는 클라이언트 컴포넌트에서만 사용 가능
    const supabase = useSupabaseClient();

    // 5. Storage에 파일 업로드
    const { data, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file, {
        cacheControl: '3600', // 1시간 캐시
        upsert: false // 동일한 파일명이 있으면 오류 발생
      });

    // 6. 업로드 실패 처리
    if (uploadError) {
      console.error('Supabase 업로드 오류:', uploadError);
      return {
        success: false,
        error: `업로드 실패: ${uploadError.message}`
      };
    }

    // 7. 업로드 성공 시 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    // 8. URL 생성 확인
    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: '이미지 URL 생성에 실패했습니다.'
      };
    }

    // 9. 성공 결과 반환
    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    // 10. 예상치 못한 오류 처리
    console.error('이미지 업로드 중 오류 발생:', error);
    
    return {
      success: false,
      error: error instanceof Error 
        ? `업로드 오류: ${error.message}`
        : '알 수 없는 오류가 발생했습니다.'
    };
  }
}

// ========================================
// Hook 형태의 업로드 함수 (선택적)
// ========================================

/**
 * React Hook 형태의 이미지 업로드 함수
 * 컴포넌트에서 더 쉽게 사용할 수 있도록 제공
 * 
 * @returns 업로드 함수와 상태
 */
export function useImageUpload() {
  const supabase = useSupabaseClient();

  const uploadImageWithClient = async (file: File): Promise<UploadResult> => {
    try {
      // 파일 형식 검증
      if (!validateImageFile(file)) {
        return {
          success: false,
          error: '지원되지 않는 파일 형식입니다. JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.'
        };
      }

      // 고유한 파일명 생성
      const fileName = generateUniqueFileName(file);      // Storage에 파일 업로드
      const { data, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase 업로드 오류:', uploadError);
        return {
          success: false,
          error: `업로드 실패: ${uploadError.message}`
        };
      }

      // 공개 URL 생성
      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        return {
          success: false,
          error: '이미지 URL 생성에 실패했습니다.'
        };
      }

      return {
        success: true,
        url: urlData.publicUrl
      };

    } catch (error) {
      console.error('이미지 업로드 중 오류 발생:', error);
      
      return {
        success: false,
        error: error instanceof Error 
          ? `업로드 오류: ${error.message}`
          : '알 수 없는 오류가 발생했습니다.'
      };
    }
  };

  return {
    uploadImage: uploadImageWithClient
  };
}

// ========================================
// 추가 유틸리티 함수들
// ========================================

/**
 * 이미지 파일인지 확인하는 함수
 * @param file - 확인할 파일
 * @returns 이미지 파일 여부
 */
export function isImageFile(file: File): boolean {
  return validateImageFile(file);
}

/**
 * 지원되는 파일 형식 목록 반환
 * @returns 지원되는 MIME 타입 배열
 */
export function getSupportedImageTypes(): readonly string[] {
  return ALLOWED_IMAGE_TYPES;
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 * @param bytes - 바이트 크기
 * @returns 포맷된 크기 문자열
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 