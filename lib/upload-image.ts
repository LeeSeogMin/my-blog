/**
 * Supabase Storage 이미지 업로드 유틸리티
 * 
 * 주요 기능:
 * - 이미지 파일 형식 검증
 * - 고유한 파일명 생성
 * - Supabase Storage에 업로드
 * - 공개 URL 반환
 * - 타입 안전성 확보
 */

import { v4 as uuidv4 } from 'uuid'
import { supabase } from './supabase-shared'

// =====================================================
// 타입 정의
// =====================================================

/**
 * 이미지 업로드 결과 타입
 */
export interface UploadImageResult {
  /** 업로드 성공 여부 */
  success: boolean
  /** 업로드된 이미지의 공개 URL (성공 시) */
  url?: string
  /** 오류 메시지 (실패 시) */
  error?: string
  /** 업로드된 파일의 경로 (성공 시) */
  path?: string
}

/**
 * 지원되는 이미지 파일 형식
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
] as const

/**
 * 지원되는 이미지 파일 확장자
 */
export const SUPPORTED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png', 
  'gif',
  'webp'
] as const

/**
 * Supabase Storage 버킷 이름
 */
export const BLOG_IMAGES_BUCKET = 'blog-images'

// =====================================================
// 유틸리티 함수
// =====================================================

/**
 * 파일 확장자 추출 함수
 * @param fileName - 파일명
 * @returns 파일 확장자 (소문자)
 */
function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  return fileName.slice(lastDotIndex + 1).toLowerCase()
}

/**
 * 고유한 파일명 생성 함수
 * @param originalFileName - 원본 파일명
 * @returns 고유한 파일명 (UUID + 타임스탬프 + 확장자)
 */
function generateUniqueFileName(originalFileName: string): string {
  const extension = getFileExtension(originalFileName)
  const timestamp = Date.now()
  const uuid = uuidv4().slice(0, 8) // UUID의 첫 8자리만 사용
  
  return `${timestamp}_${uuid}.${extension}`
}

/**
 * 파일 형식 검증 함수
 * @param file - 업로드할 파일 객체
 * @returns 검증 결과 { isValid: boolean, error?: string }
 */
function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // 파일 MIME 타입 검증
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: `지원하지 않는 파일 형식입니다. 지원 형식: ${SUPPORTED_IMAGE_TYPES.join(', ')}`
    }
  }

  // 파일 확장자 검증 (추가 보안)
  const extension = getFileExtension(file.name)
  if (!SUPPORTED_IMAGE_EXTENSIONS.includes(extension as any)) {
    return {
      isValid: false,
      error: `지원하지 않는 파일 확장자입니다. 지원 확장자: ${SUPPORTED_IMAGE_EXTENSIONS.join(', ')}`
    }
  }

  // 파일이 비어있는지 확인
  if (file.size === 0) {
    return {
      isValid: false,
      error: '파일이 비어있습니다.'
    }
  }

  return { isValid: true }
}

// =====================================================
// 메인 업로드 함수
// =====================================================

/**
 * 이미지를 Supabase Storage에 업로드하는 함수
 * 
 * @param file - 업로드할 이미지 파일 (File 객체)
 * @returns Promise<UploadImageResult> - 업로드 결과
 * 
 * 사용 예시:
 * ```typescript
 * const result = await uploadImage(file)
 * if (result.success) {
 *   console.log('업로드 성공:', result.url)
 * } else {
 *   console.error('업로드 실패:', result.error)
 * }
 * ```
 */
export async function uploadImage(file: File): Promise<UploadImageResult> {
  try {
    // 1단계: 파일 형식 검증
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      }
    }

    // 2단계: 고유한 파일명 생성
    const uniqueFileName = generateUniqueFileName(file.name)
    const filePath = `images/${uniqueFileName}`

    // 3단계: Supabase Storage에 파일 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BLOG_IMAGES_BUCKET)
      .upload(filePath, file, {
        // 파일이 이미 존재하면 덮어쓰기 (upsert)
        upsert: false,
        // 캐시 제어 헤더 설정
        cacheControl: '3600', // 1시간 캐시
        // Content-Type 자동 감지
        contentType: file.type
      })

    // 4단계: 업로드 오류 확인
    if (uploadError) {
      console.error('Supabase Storage 업로드 오류:', uploadError)
      return {
        success: false,
        error: `파일 업로드 실패: ${uploadError.message}`
      }
    }

    // 5단계: 업로드된 파일의 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from(BLOG_IMAGES_BUCKET)
      .getPublicUrl(filePath)

    // 6단계: 공개 URL 확인
    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: '파일 URL 생성에 실패했습니다.'
      }
    }

    // 7단계: 성공 결과 반환
    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    }

  } catch (error) {
    // 예상치 못한 오류 처리
    console.error('이미지 업로드 중 예상치 못한 오류:', error)
    
    return {
      success: false,
      error: error instanceof Error 
        ? `업로드 중 오류 발생: ${error.message}`
        : '알 수 없는 오류가 발생했습니다.'
    }
  }
}

// =====================================================
// 추가 유틸리티 함수들
// =====================================================

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 * @param bytes - 바이트 크기
 * @returns 포맷된 크기 문자열 (예: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 이미지 파일인지 확인하는 함수
 * @param file - 확인할 파일
 * @returns 이미지 파일 여부
 */
export function isImageFile(file: File): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(file.type as any)
}

/**
 * 파일명에서 안전하지 않은 문자 제거
 * @param fileName - 원본 파일명
 * @returns 안전한 파일명
 */
export function sanitizeFileName(fileName: string): string {
  // 특수문자 제거 및 공백을 언더스코어로 변경
  return fileName
    .replace(/[^a-zA-Z0-9가-힣.\-_]/g, '_')
    .replace(/\s+/g, '_')
    .toLowerCase()
}

// =====================================================
// 사용 예시 및 테스트 함수
// =====================================================

/**
 * 이미지 업로드 테스트 함수 (개발용)
 * @param file - 테스트할 파일
 */
export async function testImageUpload(file: File): Promise<void> {
  console.log('=== 이미지 업로드 테스트 시작 ===')
  console.log('파일명:', file.name)
  console.log('파일 크기:', formatFileSize(file.size))
  console.log('파일 타입:', file.type)
  
  const result = await uploadImage(file)
  
  if (result.success) {
    console.log('✅ 업로드 성공!')
    console.log('URL:', result.url)
    console.log('경로:', result.path)
  } else {
    console.log('❌ 업로드 실패!')
    console.log('오류:', result.error)
  }
  
  console.log('=== 테스트 완료 ===')
}

// =====================================================
// 타입 가드 함수
// =====================================================

/**
 * UploadImageResult가 성공 결과인지 확인하는 타입 가드
 * @param result - 업로드 결과
 * @returns 성공 여부와 함께 타입 좁히기
 */
export function isUploadSuccess(
  result: UploadImageResult
): result is UploadImageResult & { success: true; url: string; path: string } {
  return result.success === true && !!result.url && !!result.path
}

/**
 * UploadImageResult가 실패 결과인지 확인하는 타입 가드
 * @param result - 업로드 결과
 * @returns 실패 여부와 함께 타입 좁히기
 */
export function isUploadError(
  result: UploadImageResult
): result is UploadImageResult & { success: false; error: string } {
  return result.success === false && !!result.error
}

// =====================================================
// 설정 완료
// =====================================================

/**
 * 사용 가이드:
 * 
 * 1. 기본 사용법:
 *    const result = await uploadImage(file)
 *    if (result.success) {
 *      // result.url 사용
 *    }
 * 
 * 2. 타입 가드 사용:
 *    if (isUploadSuccess(result)) {
 *      // TypeScript가 result.url이 존재함을 보장
 *    }
 * 
 * 3. 파일 검증:
 *    if (isImageFile(file)) {
 *      // 이미지 파일인 경우에만 업로드
 *    }
 * 
 * 4. 개발 테스트:
 *    await testImageUpload(file)
 * 
 * 주의사항:
 * - blog-images 버킷이 Supabase에 생성되어 있어야 함
 * - 파일명은 자동으로 고유하게 생성됨
 * - 지원 형식: jpg, jpeg, png, gif, webp
 * - 파일 크기 제한 없음 (필요시 validateImageFile 함수에서 추가)
 */ 