import { createClient } from '@supabase/supabase-js';
import type { MetadataRoute } from 'next';
import type { Database } from '@/types/database.types';

// 사이트맵 설정
const SITE_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
  defaultChangeFrequency: 'weekly' as const,
} as const;

// 페이지 타입별 설정
const PAGE_SETTINGS = {
  home: {
    changeFrequency: 'daily' as const,
    priority: 1.0,
  },
  postsList: {
    changeFrequency: 'daily' as const,
    priority: 0.9,
  },
  categoriesList: {
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  },
  postDetail: {
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  },
  categoryDetail: {
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  },
  auth: {
    changeFrequency: 'monthly' as const,
    priority: 0.3,
  },
} as const;

// 타입 정의
type PostSitemapData = {
  slug: string;
  updated_at: string;
  created_at: string;
};

type CategorySitemapData = {
  slug: string;
  updated_at: string;
  created_at: string;
};

/**
 * 동적 사이트맵 생성 함수
 * - 홈페이지, 게시물, 카테고리 등 모든 주요 페이지 포함
 * - lastModified, changeFrequency, priority 정보 포함
 * - 에러 처리 및 타입 안정성 보장
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  console.log('=== 사이트맵 생성 시작 ===');
  
  // Supabase 공개 클라이언트 생성 (인증 없이 공개 데이터만 조회)
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let posts: PostSitemapData[] = [];
  let categories: CategorySitemapData[] = [];
  let latestPostUpdate: string = new Date().toISOString();
  let latestCategoryUpdate: string = new Date().toISOString();

  try {
    // 게시물 목록 조회 (공개된 게시물만)
    console.log('📝 게시물 데이터 조회 중...');
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (postError) {
      console.error('게시물 조회 오류:', postError);
    } else {
      posts = postData || [];
      // 가장 최근 업데이트된 게시물의 시간을 게시물 목록 페이지의 lastModified로 사용
      if (posts.length > 0) {
        latestPostUpdate = posts[0].updated_at;
      }
      console.log(`✅ 게시물 ${posts.length}개 조회 완료`);
    }

    // 카테고리 목록 조회
    console.log('📁 카테고리 데이터 조회 중...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('slug, updated_at, created_at')
      .order('updated_at', { ascending: false });

    if (categoryError) {
      console.error('카테고리 조회 오류:', categoryError);
    } else {
      categories = categoryData || [];
      // 가장 최근 업데이트된 카테고리의 시간을 카테고리 목록 페이지의 lastModified로 사용
      if (categories.length > 0) {
        latestCategoryUpdate = categories[0].updated_at;
      }
      console.log(`✅ 카테고리 ${categories.length}개 조회 완료`);
    }
  } catch (error) {
    console.error('사이트맵 데이터 조회 중 오류 발생:', error);
    // 에러가 발생해도 기본 페이지들은 포함하도록 계속 진행
  }

  // 사이트맵 엔트리 생성
  const sitemap: MetadataRoute.Sitemap = [
    // 1. 홈페이지 (최우선)
    {
      url: `${SITE_CONFIG.baseUrl}`,
      lastModified: latestPostUpdate, // 최신 게시물 업데이트 시간 사용
      changeFrequency: PAGE_SETTINGS.home.changeFrequency,
      priority: PAGE_SETTINGS.home.priority,
    },

    // 2. 게시물 목록 페이지
    {
      url: `${SITE_CONFIG.baseUrl}/posts`,
      lastModified: latestPostUpdate,
      changeFrequency: PAGE_SETTINGS.postsList.changeFrequency,
      priority: PAGE_SETTINGS.postsList.priority,
    },

    // 3. 카테고리 목록 페이지
    {
      url: `${SITE_CONFIG.baseUrl}/categories`,
      lastModified: latestCategoryUpdate,
      changeFrequency: PAGE_SETTINGS.categoriesList.changeFrequency,
      priority: PAGE_SETTINGS.categoriesList.priority,
    },

    // 4. 인증 관련 페이지 (공개 페이지)
    {
      url: `${SITE_CONFIG.baseUrl}/auth/sign-in`,
      lastModified: new Date('2025-01-01').toISOString(), // 고정된 날짜
      changeFrequency: PAGE_SETTINGS.auth.changeFrequency,
      priority: PAGE_SETTINGS.auth.priority,
    },
    {
      url: `${SITE_CONFIG.baseUrl}/auth/sign-up`,
      lastModified: new Date('2025-01-01').toISOString(), // 고정된 날짜
      changeFrequency: PAGE_SETTINGS.auth.changeFrequency,
      priority: PAGE_SETTINGS.auth.priority,
    },

    // 5. 게시물 상세 페이지들
    ...posts.map((post) => ({
      url: `${SITE_CONFIG.baseUrl}/posts/${post.slug}`,
      lastModified: post.updated_at,
      changeFrequency: PAGE_SETTINGS.postDetail.changeFrequency,
      priority: PAGE_SETTINGS.postDetail.priority,
    })),

    // 6. 카테고리 상세 페이지들
    ...categories.map((category) => ({
      url: `${SITE_CONFIG.baseUrl}/categories/${category.slug}`,
      lastModified: category.updated_at,
      changeFrequency: PAGE_SETTINGS.categoryDetail.changeFrequency,
      priority: PAGE_SETTINGS.categoryDetail.priority,
    })),
  ];

  console.log(`✅ 사이트맵 생성 완료: 총 ${sitemap.length}개 페이지`);
  console.log('📊 페이지 구성:');
  console.log(`   - 정적 페이지: 5개 (홈, 게시물목록, 카테고리목록, 로그인, 회원가입)`);
  console.log(`   - 게시물 페이지: ${posts.length}개`);
  console.log(`   - 카테고리 페이지: ${categories.length}개`);

  return sitemap;
}