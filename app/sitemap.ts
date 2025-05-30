import { createClient } from '@supabase/supabase-js';
import type { MetadataRoute } from 'next';
import type { Database } from '@/types/database.types';

/**
 * 동적 사이트맵 생성 함수
 * - 홈페이지, 게시물, 카테고리 등 모든 주요 페이지 포함
 * - lastModified, changeFrequency, priority 정보 포함
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Supabase 공개 클라이언트 생성
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000';

  // 게시물 목록 조회
  let posts: any[] = [];
  let categories: any[] = [];
  try {
    const { data: postData } = await supabase
      .from('posts')
      .select('slug, updated_at')
      .eq('status', 'published');
    posts = postData || [];
  } catch (e) {
    posts = [];
  }
  try {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('slug, updated_at');
    categories = categoryData || [];
  } catch (e) {
    categories = [];
  }

  // 사이트맵 엔트리 생성
  const sitemap: MetadataRoute.Sitemap = [
    // 홈페이지
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // 게시물 목록 페이지
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // 카테고리 목록 페이지
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // 게시물 상세 페이지
    ...posts.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: post.updated_at || new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    // 카테고리 상세 페이지
    ...categories.map((cat) => ({
      url: `${baseUrl}/categories/${cat.slug}`,
      lastModified: cat.updated_at || new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.6,
    })),
  ];
  return sitemap;
} 