import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 제목을 URL 친화적인 슬러그로 변환
 * @param title 원본 제목
 * @returns URL 슬러그
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // 한글, 영문, 숫자만 남기고 나머지는 공백으로 변환
    .replace(/[^\w\s가-힣]/g, ' ')
    // 연속된 공백을 하나로 합치기
    .replace(/\s+/g, ' ')
    // 공백을 하이픈으로 변환
    .replace(/\s/g, '-')
    // 연속된 하이픈 제거
    .replace(/-+/g, '-')
    // 앞뒤 하이픈 제거
    .replace(/^-|-$/g, '');
}

/**
 * 슬러그 유효성 검사
 * @param slug 검사할 슬러그
 * @returns 유효한지 여부
 */
export function isValidSlug(slug: string): boolean {
  // 슬러그는 영문, 숫자, 하이픈, 한글만 허용
  const slugRegex = /^[a-z0-9가-힣-]+$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
}

/**
 * 고유한 슬러그 생성 (중복 방지)
 * @param baseSlug 기본 슬러그
 * @param existingSlugs 기존 슬러그 목록
 * @returns 고유한 슬러그
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}
