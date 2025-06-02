/**
 * 카테고리 상세 페이지 (2025년 새로운 Third-Party Auth 방식)
 * 특정 카테고리에 속한 포스트들을 표시합니다.
 * 실제 Supabase 데이터베이스와 연동
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PostCard from '@/components/blog/post-card';
import type { Metadata } from 'next';
import { Database } from '@/types/database.types';

// 타입 정의
type Category = Database['public']['Tables']['categories']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];

type PostWithCategory = Post & {
  categories?: Category | null;
};

// 페이지 props 타입 정의
type PageProps = {
  params: Promise<{ slug: string }>;
};

// 정적 경로 생성 함수
export async function generateStaticParams() {
  try {
    console.log('=== 카테고리 정적 경로 생성 시작 ===');
    
    // 빌드 타임에는 인증 없이 공개 데이터만 조회
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('slug');

    if (error) {
      console.error('정적 경로 생성 오류:', error);
      return [];
    }

    console.log(`✅ 카테고리 정적 경로 ${categories?.length || 0}개 생성`);
    return (categories || []).map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('정적 경로 생성 중 오류 발생:', error);
    return [];
  }
}

// 동적 메타데이터 생성 함수
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    console.log('=== 카테고리 메타데이터 생성 시작 ===', slug);
    
    // 빌드 타임에는 인증 없이 공개 데이터만 조회
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // 카테고리 정보 조회
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
  
    if (categoryError || !category) {
      console.log('❌ 카테고리 메타데이터 생성 실패: 카테고리 없음');
      return {
        title: '카테고리를 찾을 수 없습니다 | My Blog',
      };
    }

    // 해당 카테고리의 게시물 수 조회
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .eq('category_id', category.id);

    const description = category.description || `${category.name} 관련 글들을 모아놓은 카테고리입니다.`;

    console.log('✅ 카테고리 메타데이터 생성 완료:', category.name);
    return {
      title: `${category.name} | My Blog`,
      description: `${description} - ${count || 0}개의 글이 있습니다.`,
      openGraph: {
        title: `${category.name} | My Blog`,
        description: `${description} - ${count || 0}개의 글이 있습니다.`,
      },
    };
  } catch (error) {
    console.error('메타데이터 생성 중 오류 발생:', error);
    return {
      title: '카테고리를 찾을 수 없습니다 | My Blog',
    };
  }
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  try {
    console.log('=== 카테고리 상세 페이지: 데이터 조회 시작 ===', slug);
    
    // 2025년 새로운 Third-Party Auth 방식 Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient();
    
    // 카테고리 정보 조회
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
  
    // 카테고리가 존재하지 않으면 404 반환
    if (categoryError || !category) {
      console.log('❌ 카테고리 없음:', categoryError?.message || 'Not found');
      notFound();
    }

    console.log('✅ 카테고리 조회 성공:', category.name);

    // 해당 카테고리의 게시물들 조회
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        slug,
        excerpt,
        cover_image_url,
        view_count,
        created_at,
        author_id,
        categories (
          id,
          name,
          slug,
          color
        )
      `)
      .eq('status', 'published')
      .eq('category_id', category.id)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('게시물 조회 오류:', postsError);
      throw postsError;
    }

    console.log(`✅ 카테고리 게시물 ${posts?.length || 0}개 조회 성공`);

    // Category 타입의 빈 객체
    const EMPTY_CATEGORY = {
      id: '',
      name: '',
      slug: '',
      description: '',
      icon: undefined,
      parentId: undefined,
      color: '#3b82f6',
    };

    // PostCard 컴포넌트에 맞는 데이터 형식으로 변환
    const transformedPosts = (posts || []).map(post => ({
      id: post.id,
      title: post.title,
      content: post.content || '',
      slug: post.slug,
      excerpt: post.excerpt || post.content?.substring(0, 200) + '...' || '',
      coverImage: post.cover_image_url,
      images: [],
      author: {
        id: post.author_id,
        name: '작성자', // Clerk에서 가져올 예정
        bio: undefined,
        profileImage: '/default-avatar.png',
        role: undefined,
        email: undefined,
        socialLinks: undefined,
      },
      category: Array.isArray(post.categories)
        ? ((post.categories[0] as any)
            ? {
                id: (post.categories[0] as any).id,
                name: (post.categories[0] as any).name,
                slug: (post.categories[0] as any).slug,
                description: (post.categories[0] as any).description ?? '',
                icon: undefined,
                parentId: undefined,
                color: (post.categories[0] as any).color ?? '#3b82f6',
              }
            : EMPTY_CATEGORY)
        : post.categories
        ? {
            id: (post.categories as any).id,
            name: (post.categories as any).name,
            slug: (post.categories as any).slug,
            description: (post.categories as any).description ?? '',
            icon: undefined,
            parentId: undefined,
            color: (post.categories as any).color ?? '#3b82f6',
          }
        : EMPTY_CATEGORY,
      publishedAt: post.created_at,
      updatedAt: undefined,
      readingTime: Math.ceil((post.content?.length || 0) / 200),
      likeCount: 0,
      featured: false,
      tags: [],
      comments: [],
      viewCount: post.view_count || 0
    }));

    // 카테고리 정보 변환
    const transformedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || `${category.name} 관련 글들을 모아놓은 카테고리입니다.`
    };

    console.log('✅ 카테고리 상세 페이지 데이터 준비 완료');

    return (
      <div className="py-16">
        {/* 카테고리 헤더 */}
        <section className="mb-16">
          <div className="text-center">
            {/* 뒤로 가기 링크 */}
            <div className="mb-6">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                ← 모든 카테고리
              </Link>
            </div>

            {/* 카테고리 정보 */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                {transformedCategory.name}
              </h1>
            </div>

            {/* 카테고리 설명 */}
            {transformedCategory.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                {transformedCategory.description}
              </p>
            )}

            {/* 포스트 개수 */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm">
              <span>📝</span>
              <span>{transformedPosts.length}개의 글</span>
            </div>
          </div>
        </section>

        {/* 포스트 목록 */}
        <section>
          {transformedPosts.length > 0 ? (
            <>
              {/* 정렬 및 필터 정보 */}
              <div className="mb-8">
                <p className="text-sm text-muted-foreground">
                  최신 글부터 {transformedPosts.length}개의 글을 보여드립니다.
                </p>
              </div>

              {/* 포스트 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {transformedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    showCategory={false}
                    showTags={true}
                    maxTags={3}
                  />
                ))}
              </div>

              {/* 더 많은 글 안내 */}
              <div className="text-center mt-12">
                <div className="max-w-md mx-auto">
                  <p className="text-muted-foreground mb-4">
                    더 많은 {transformedCategory.name} 관련 글들이 곧 업데이트됩니다.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link
                      href="/categories"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      다른 카테고리 둘러보기 →
                    </Link>
                    <Link
                      href="/posts"
                      className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      모든 글 보기 →
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* 포스트가 없는 경우 */
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-2xl font-bold mb-4">아직 글이 없습니다</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {transformedCategory.name} 카테고리에는 아직 작성된 글이 없습니다. 
                곧 고품질의 콘텐츠들이 업데이트될 예정입니다.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/categories"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  다른 카테고리 보기
                </Link>
                <Link
                  href="/posts"
                  className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  모든 글 보기
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  홈으로 돌아가기
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  } catch (error) {
    console.error('카테고리 페이지 데이터 조회 중 오류 발생:', error);
    notFound();
  }
} 