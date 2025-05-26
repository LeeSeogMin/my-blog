/**
 * 블로그 홈페이지 컴포넌트
 * Hero 섹션, 최신 포스트, 카테고리 섹션으로 구성
 * 실제 Supabase 데이터베이스와 연동
 */

import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import PostCard from '@/components/blog/post-card';
import { Database } from '@/types/database.types';
import { BlogPost } from '@/types';

type Post = Database['public']['Tables']['posts']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'] | null;
};

type Category = Database['public']['Tables']['categories']['Row'] & {
  postCount: number;
};

/**
 * Supabase Post 데이터를 BlogPost 타입으로 변환
 */
function transformPostToBlogPost(post: Post): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    excerpt: post.content.substring(0, 200) + '...', // 임시로 content에서 excerpt 생성
    publishedAt: post.created_at,
    updatedAt: post.updated_at,
    author: {
      id: post.author_id,
      name: 'Admin', // 임시 작성자 정보
      email: 'admin@example.com'
    },
    category: post.categories ? {
      id: post.categories.id,
      name: post.categories.name,
      slug: post.categories.slug,
      description: post.categories.description || undefined,
      color: post.categories.color || '#6366f1'
    } : {
      id: 'uncategorized',
      name: '미분류',
      slug: 'uncategorized',
      description: '카테고리가 지정되지 않은 글',
      color: '#6b7280'
    },
    tags: [], // 임시로 빈 배열
    coverImage: post.cover_image_url || '/images/default-cover.jpg',
    images: [],
    readingTime: Math.ceil(post.content.length / 1000), // 대략적인 읽기 시간 계산
    viewCount: post.view_count,
    likeCount: 0, // 임시값
    featured: false, // 임시값
    comments: [],
    draft: post.status !== 'published'
  };
}

/**
 * 최신 게시물 조회 함수
 */
async function getLatestPosts(): Promise<Post[]> {
  try {
    const supabase = createServerClient();
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('최신 게시물 조회 오류:', error);
      return [];
    }

    return posts || [];
  } catch (error) {
    console.error('최신 게시물 조회 중 오류:', error);
    return [];
  }
}

/**
 * 카테고리별 게시물 개수 조회 함수
 */
async function getCategoriesWithCount(): Promise<Category[]> {
  try {
    const supabase = createServerClient();
    
    // 카테고리 목록 조회
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (categoriesError) {
      console.error('카테고리 조회 오류:', categoriesError);
      return [];
    }

    if (!categories || categories.length === 0) {
      return [];
    }

    // 각 카테고리별 게시물 개수 조회
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const { count, error: countError } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);

        if (countError) {
          console.error(`카테고리 ${category.name} 게시물 개수 조회 오류:`, countError);
          return { ...category, postCount: 0 };
        }

        return { ...category, postCount: count || 0 };
      })
    );

    return categoriesWithCount;
  } catch (error) {
    console.error('카테고리 조회 중 오류:', error);
    return [];
  }
}

export default async function Home() {
  // 최신 포스트 3개 가져오기
  const latestPosts = await getLatestPosts();
  
  // 카테고리별 포스트 개수 가져오기
  const categoriesWithCount = await getCategoriesWithCount();

  return (
    <div id="main-content" className="py-16">
      {/* Hero 섹션 */}
      <section className="text-center mb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to My Blog
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            웹 개발, JavaScript, React, Next.js에 관한 최신 기술과 실무 경험을 공유합니다. 
            함께 성장하는 개발자가 되어보세요.
          </p>
          
          {/* CTA 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/posts"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              📚 블로그 글 읽기
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-input bg-background px-8 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:shadow-md"
            >
              👋 소개 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 최신 포스트 섹션 */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">최신 글</h2>
            <p className="text-muted-foreground">가장 최근에 작성된 글들을 확인해보세요</p>
          </div>
          <Link
            href="/posts"
            className="group text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            모든 글 보기 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {latestPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <PostCard
              key={post.id}
              post={transformPostToBlogPost(post)}
              showTags={true}
              maxTags={2}
            />
          ))}
        </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-xl">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">아직 게시물이 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                첫 번째 게시물을 작성해서 블로그를 시작해보세요!
              </p>
              <Link
                href="/admin/post/new"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200"
              >
                ✍️ 첫 게시물 작성하기
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 카테고리 섹션 */}
      <section>
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">카테고리</h2>
          <p className="text-muted-foreground">관심 있는 주제별로 글을 찾아보세요</p>
        </div>

        {categoriesWithCount.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoriesWithCount.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative rounded-xl border bg-card p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* 카테고리 정보 */}
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              
                {category.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {category.description}
              </p>
                )}
              
              {/* 포스트 개수 */}
              <div className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground inline-block">
                {category.postCount}개의 글
              </div>

              {/* 호버 효과 */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary/20 transition-colors" />
            </Link>
          ))}
        </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl">
            <div className="max-w-md mx-auto">
              <div className="text-4xl mb-4">🏷️</div>
              <h3 className="text-lg font-semibold mb-2">카테고리가 없습니다</h3>
              <p className="text-muted-foreground text-sm">
                게시물을 작성할 때 카테고리를 추가할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* 전체 카테고리 보기 링크 */}
        {categoriesWithCount.length > 0 && (
        <div className="text-center mt-8">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            모든 카테고리 보기
            <span>→</span>
          </Link>
        </div>
        )}
      </section>
    </div>
  );
}
