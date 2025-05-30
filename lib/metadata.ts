import type { Metadata } from 'next';

// 기본 사이트 정보
const SITE_CONFIG = {
  name: 'My Blog',
  description: '개발, 기술, 그리고 일상을 공유하는 블로그',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
  author: {
    name: '블로그 작성자',
    email: 'admin@myblog.com',
  },
  social: {
    twitter: '@myblog',
  },
} as const;

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

// 메타데이터 생성을 위한 확장된 타입 정의
export interface PostMetadataProps {
  title: string;
  content: string;
  slug: string;
  coverImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  authorName?: string;
  excerpt?: string;
}

/**
 * 텍스트에서 HTML 태그와 마크다운 문법을 제거하고 요약 생성
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  const cleanText = content
    .replace(/[#*`]/g, '') // 마크다운 문법 제거
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/\n+/g, ' ') // 줄바꿈을 공백으로 변환
    .trim();
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  // 단어 단위로 자르기
  const truncated = cleanText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  return lastSpaceIndex > 0 
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...';
}

/**
 * 페이지 제목 생성 (SEO 최적화)
 */
export function generatePageTitle(title: string, includePrefix: boolean = true): string {
  const maxLength = 60; // Google의 권장 길이
  
  if (!includePrefix) {
    return title.length > maxLength ? title.substring(0, maxLength - 3) + '...' : title;
  }
  
  const suffix = ` | ${SITE_CONFIG.name}`;
  const maxTitleLength = maxLength - suffix.length;
  
  const truncatedTitle = title.length > maxTitleLength 
    ? title.substring(0, maxTitleLength - 3) + '...'
    : title;
  
  return truncatedTitle + suffix;
}

/**
 * Open Graph 이미지 URL 생성
 */
export function getOpenGraphImageUrl(coverImageUrl?: string | null): string {
  if (coverImageUrl) {
    // 상대 경로인 경우 절대 URL로 변환
    if (coverImageUrl.startsWith('/')) {
      return `${SITE_CONFIG.url}${coverImageUrl}`;
    }
    return coverImageUrl;
  }
  
  // 기본 이미지 반환
  return `${SITE_CONFIG.url}/images/og-default.jpg`;
}

/**
 * 정규 URL 생성
 */
export function getCanonicalUrl(path: string): string {
  return `${SITE_CONFIG.url}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * JSON-LD 구조화 데이터 생성
 */
export function generateJsonLd(props: PostMetadataProps) {
  const {
    title,
    content,
    slug,
    coverImageUrl,
    createdAt,
    updatedAt,
    categoryName,
    authorName = SITE_CONFIG.author.name,
    excerpt,
  } = props;

  const articleUrl = getCanonicalUrl(`/posts/${slug}`);
  const imageUrl = getOpenGraphImageUrl(coverImageUrl);
  const description = excerpt || generateExcerpt(content);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: imageUrl,
    url: articleUrl,
    datePublished: createdAt,
    dateModified: updatedAt,
    author: {
      '@type': 'Person',
      name: authorName,
      url: SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    ...(categoryName && {
      articleSection: categoryName,
      about: {
        '@type': 'Thing',
        name: categoryName,
      },
    }),
  };
}

/**
 * 게시물 메타데이터 생성 (메인 함수)
 */
export function generatePostMetadata(props: PostMetadataProps): Metadata {
  const {
    title,
    content,
    slug,
    coverImageUrl,
    createdAt,
    updatedAt,
    categoryName,
    authorName = SITE_CONFIG.author.name,
    excerpt,
  } = props;

  const description = excerpt || generateExcerpt(content);
  const pageTitle = generatePageTitle(title);
  const canonicalUrl = getCanonicalUrl(`/posts/${slug}`);
  const imageUrl = getOpenGraphImageUrl(coverImageUrl);
  const jsonLdData = generateJsonLd(props);

  return {
    title: pageTitle,
    description: description,
    authors: [{ name: authorName }],
    creator: authorName,
    publisher: SITE_CONFIG.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: title, // Open Graph에서는 사이트명 제외한 제목 사용
      description: description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'ko_KR',
      type: 'article' as const,
      publishedTime: createdAt,
      modifiedTime: updatedAt,
      authors: [authorName],
      section: categoryName || '블로그',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/jpeg',
        },
        // 다양한 크기의 이미지 제공
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: title,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [imageUrl],
      creator: SITE_CONFIG.social.twitter,
      site: SITE_CONFIG.social.twitter,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'application/ld+json': JSON.stringify(jsonLdData),
    },
  };
}

/**
 * 동적 메타데이터 생성 유틸리티 함수 (기존 함수 개선)
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
      type: type as any,
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

/**
 * 기본 사이트 메타데이터 생성
 */
export function generateSiteMetadata(): Metadata {
  return {
    title: {
      default: SITE_CONFIG.name,
      template: `%s | ${SITE_CONFIG.name}`,
    },
    description: SITE_CONFIG.description,
    keywords: ['블로그', '개발', '기술', 'Next.js', 'React', 'TypeScript'],
    authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.url }],
    creator: SITE_CONFIG.author.name,
    publisher: SITE_CONFIG.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(SITE_CONFIG.url),
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      url: SITE_CONFIG.url,
      siteName: SITE_CONFIG.name,
      title: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      images: [
        {
          url: '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      images: ['/images/og-default.jpg'],
      creator: SITE_CONFIG.social.twitter,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// 상수 내보내기
export { SITE_CONFIG };