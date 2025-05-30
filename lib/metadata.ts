import type { Metadata } from 'next';

interface MetaOptions {
  title: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  siteName?: string;
  jsonLd?: Record<string, any>;
}

/**
 * 동적 메타데이터 생성 유틸리티 함수
 * - 기본값, Open Graph, Twitter, JSON-LD 포함
 */
export function createMeta({
  title,
  description = '',
  url = '',
  image = '',
  type = 'article',
  publishedTime,
  modifiedTime,
  author = 'My Blog',
  siteName = 'My Blog',
  jsonLd,
}: MetaOptions): Metadata {
  const meta: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type,
      url,
      siteName,
      images: image ? [
        { url: image, width: 1200, height: 630, alt: title }
      ] : [],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(author ? { authors: [author] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : [],
    },
    // JSON-LD 구조화 데이터 (기본)
    ...(jsonLd ? {
      other: {
        'application/ld+json': JSON.stringify(jsonLd)
      }
    } : {})
  };
  return meta;
} 