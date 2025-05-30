/**
 * 블로그 포스트 상세 페이지 (2025년 새로운 Third-Party Auth 방식)
 * 동적 라우팅을 통해 개별 포스트의 상세 내용을 표시
 * 실제 Supabase 데이터베이스와 연동
 */

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generatePostMetadata } from '@/lib/metadata';
import MarkdownContent from '@/components/blog/markdown-content';
import RelatedPosts from '@/components/blog/related-posts';
import LikeButton from '@/components/blog/like-button';
import PostAdminActions from '@/components/blog/post-admin-actions';
import CommentSection from '@/components/blog/comment-section';
import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { Database } from '@/types/database.types';
import { getRelativeTime } from '@/lib/utils';

// 타입 정의
type Post = Database['public']['Tables']['posts']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

type PostWithCategory = Post & {
  categories?: Category | null;
};

// 페이지 props 타입 정의
type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// 정적 경로 생성 함수
export async function generateStaticParams() {
  try {
    console.log('=== 정적 경로 생성 시작 ===');
    
    // 빌드 타임에는 인증 없이 공개 데이터만 조회
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug')
      .eq('status', 'published');

    if (error) {
      console.error('정적 경로 생성 오류:', error);
      return [];
    }

    console.log(`✅ 정적 경로 ${posts?.length || 0}개 생성`);
    return (posts || []).map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('정적 경로 생성 중 오류 발생:', error);
    return [];
  }
}

// 동적 메타데이터 생성 함수
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  // URL 디코딩 처리
  const slug = decodeURIComponent(rawSlug);
  
  try {
    console.log('=== 메타데이터 생성 시작 ===', slug);
    
    // 빌드 타임에는 인증 없이 공개 데이터만 조회
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        excerpt,
        slug,
        cover_image_url,
        created_at,
        updated_at,
        author_id,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
  
    if (error || !post) {
      console.log('❌ 메타데이터 생성 실패: 게시물 없음');
      return {
        title: '포스트를 찾을 수 없습니다 | My Blog',
        description: '요청하신 포스트를 찾을 수 없습니다.',
      };
    }

    // 카테고리 정보 추출
    const categoryData = Array.isArray(post.categories) && post.categories.length > 0 
      ? post.categories[0] 
      : null;

    // 새로운 메타데이터 유틸리티 함수 사용
    const metadata = generatePostMetadata({
      title: post.title,
      content: post.content || '',
      excerpt: post.excerpt || undefined,
      slug: post.slug,
      coverImageUrl: post.cover_image_url,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      categoryName: categoryData?.name,
      authorName: '작성자', // 추후 Clerk에서 실제 작성자 정보 가져올 예정
    });

    console.log('✅ 고급 메타데이터 생성 완료:', post.title);
    return metadata;

  } catch (error) {
    console.error('메타데이터 생성 중 오류 발생:', error);
    return {
      title: '포스트를 찾을 수 없습니다 | My Blog',
      description: '포스트를 불러오는 중 오류가 발생했습니다.',
    };
  }
}

// 포스트 헤더 컴포넌트
function PostHeader({ post, isAuthor, likeCount }: { post: PostWithCategory; isAuthor: boolean; likeCount: number }) {
  return (
    <header className="mb-8">
      {/* 제목 */}
      <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
        {post.title}
      </h1>

      {/* 관리자 액션 버튼 (작성자 본인에게만 표시) */}
      {isAuthor && (
        <div className="mb-6">
          <PostAdminActions postId={post.id} postSlug={post.slug} />
        </div>
      )}

      {/* 메타 정보 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 text-muted-foreground">
        {/* 작성일 */}
        <div className="flex items-center gap-2">
          <span className="text-sm">📅</span>
          <time className="text-sm">
            {getRelativeTime(post.created_at)}
          </time>
        </div>

        {/* 수정일 */}
        {post.updated_at !== post.created_at && (
          <>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm">✏️</span>
              <time className="text-sm">
                수정됨: {getRelativeTime(post.updated_at)}
              </time>
            </div>
          </>
        )}

        {/* 구분선 */}
        <div className="hidden sm:block w-px h-8 bg-border" />

        {/* 좋아요 버튼 */}
        <div className="flex items-center">
          <LikeButton
            postId={post.id}
            initialLikes={likeCount}
            size="lg"
            showCount={true}
          />
        </div>
      </div>

      {/* 카테고리 */}
      {post.categories && (
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Link
            href={`/categories/${post.categories.slug}`}
            className="inline-flex items-center"
          >
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              📁 {post.categories.name}
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}

// 포스트 콘텐츠 컴포넌트
function PostContent({ post, likeCount }: { post: PostWithCategory; likeCount: number }) {
  return (
    <article className="mb-16">
      {/* 커버 이미지 */}
      {post.cover_image_url && (
        <div className="relative w-full h-64 md:h-80 lg:h-96 mb-8 rounded-xl overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* 마크다운 콘텐츠 */}
      <MarkdownContent 
        content={post.content || ''}
        size="lg"
        enableTableOfContents={true}
        className="mb-12"
      />

      {/* 소셜 공유 및 좋아요 버튼 */}
      <div className="mt-12 pt-8 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">          {/* 좋아요 섹션 */}
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">이 글이 도움이 되셨나요?</span>
            <LikeButton
              postId={post.id}
              initialLikes={likeCount}
              size="lg"
              showCount={true}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

// 메인 페이지 컴포넌트
export default async function PostDetailPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  // URL 디코딩 처리
  const slug = decodeURIComponent(rawSlug);
  
  try {
    console.log('=== 게시물 상세 페이지 접근 ===', slug);
    
    // Clerk 인증 정보 확인
    const { userId } = await auth();
    console.log('현재 사용자 ID:', userId);
    
    // 2025년 새로운 Third-Party Auth 방식 Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient();
    
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          color
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('게시물 조회 오류:', error);
      if (error.code === 'PGRST116') {
        console.log('❌ 게시물을 찾을 수 없음:', slug);
        notFound();
      }
      throw error;
    }

    if (!post) {
      console.log('❌ 게시물이 존재하지 않음');
      notFound();
    }    console.log('✅ 게시물 조회 성공:', post.title);

    // 좋아요 수 조회
    const { count: likeCount, error: likeError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);

    if (likeError) {
      console.error('좋아요 수 조회 오류:', likeError);
    }

    const totalLikes = likeCount || 0;
    console.log('✅ 좋아요 수 조회 완료:', totalLikes);

    // 작성자 권한 확인
    const isAuthor = userId === post.author_id;
    console.log('작성자 권한:', isAuthor, '(userId:', userId, 'vs author_id:', post.author_id, ')');

    // 조회수 증가 (비동기 처리)
    try {
      await supabase
        .from('posts')
        .update({ view_count: (post.view_count || 0) + 1 })
        .eq('id', post.id);
      console.log('✅ 조회수 증가 완료');
    } catch (viewError) {
      console.error('조회수 증가 실패:', viewError);
      // 조회수 증가 실패는 페이지 렌더링에 영향을 주지 않음
    }

    // PostHeader와 PostContent에 맞는 데이터 형식으로 변환
    const transformedPost = {
      ...post,
      author: {
        id: post.author_id,
        name: '작성자', // Clerk에서 가져올 예정
        avatar: '/default-avatar.png',
        bio: null
      },
      // categories가 배열이므로 첫 번째 요소를 가져오거나 null로 설정
      categories: Array.isArray(post.categories) && post.categories.length > 0 
        ? post.categories[0] 
        : null
    };

    // RelatedPosts 컴포넌트를 위한 BlogPost 타입으로 변환
    const categoryData = Array.isArray(post.categories) && post.categories.length > 0 
      ? post.categories[0] 
      : null;

    const blogPost = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content || '',
      excerpt: post.excerpt || post.content?.substring(0, 200) + '...' || '',
      publishedAt: post.created_at,
      updatedAt: post.updated_at,
      author: {
        id: post.author_id,
        name: '작성자',
        email: 'admin@example.com'
      },
      category: categoryData ? {
        id: categoryData.id,
        name: categoryData.name,
        slug: categoryData.slug,
        description: '',
        color: categoryData.color || '#6366f1'
      } : {
        id: 'uncategorized',
        name: '미분류',
        slug: 'uncategorized',
        description: '카테고리가 지정되지 않은 글',
        color: '#6b7280'
      },
      tags: [],
      coverImage: post.cover_image_url || '/images/default-cover.jpg',
      images: [],
      readingTime: Math.ceil((post.content?.length || 0) / 1000),
      viewCount: post.view_count || 0,
      likeCount: 0,
      featured: false,
      comments: [],
      draft: post.status !== 'published'
    };

    console.log('✅ 게시물 상세 페이지 데이터 준비 완료');    return (
      <div className="py-16">
        <div className="max-w-4xl mx-auto">
          {/* 포스트 헤더 */}
          <PostHeader post={transformedPost} isAuthor={isAuthor} likeCount={totalLikes} />

          {/* 포스트 콘텐츠 */}
          <PostContent post={transformedPost} likeCount={totalLikes} />          {/* 관련 포스트 */}
          <RelatedPosts currentPost={blogPost} />          {/* 댓글 섹션 */}
          <div className="mt-16 pt-8 border-t">
            <CommentSection 
              postId={post.id} 
              postTitle={post.title} 
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('게시물 조회 중 오류 발생:', error);
    notFound();
  }
} 