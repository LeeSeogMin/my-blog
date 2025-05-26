/**
 * 블로그 포스트 상세 페이지
 * 동적 라우팅을 통해 개별 포스트의 상세 내용을 표시
 */

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import MarkdownContent from '@/components/blog/markdown-content';
import RelatedPosts from '@/components/blog/related-posts';
import LikeButton from '@/components/blog/like-button';
import type { Metadata } from 'next';
import type { Posts, Categories } from '@/types/database.types';

// 상대 시간 계산 함수
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
  return `${Math.floor(diffInSeconds / 31536000)}년 전`;
}

// 페이지 props 타입 정의
type PageProps = {
  params: Promise<{ slug: string }>;
};

// 정적 경로 생성 함수
export async function generateStaticParams() {
  try {
    const supabase = createServerClient();
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug')
      .eq('status', 'published');

    if (error) {
      console.error('정적 경로 생성 오류:', error);
      return [];
    }

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
    const supabase = createServerClient();
    
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
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
    return {
      title: '포스트를 찾을 수 없습니다 | My Blog',
    };
  }

    // 게시물 내용에서 요약 생성 (첫 200자)
    const excerpt = post.content.substring(0, 200).replace(/[#*`]/g, '') + '...';

  return {
    title: `${post.title} | My Blog`,
      description: excerpt,
      authors: [{ name: '작성자' }], // Clerk에서 가져올 예정
    openGraph: {
      title: post.title,
        description: excerpt,
      type: 'article',
        publishedTime: post.created_at,
        modifiedTime: post.updated_at,
        authors: ['작성자'],
        images: post.cover_image_url ? [
        {
            url: post.cover_image_url,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
        description: excerpt,
        images: post.cover_image_url ? [post.cover_image_url] : [],
    },
  };
  } catch (error) {
    console.error('메타데이터 생성 중 오류 발생:', error);
    return {
      title: '포스트를 찾을 수 없습니다 | My Blog',
    };
  }
}

// 포스트 헤더 컴포넌트
function PostHeader({ post }: { post: any }) {
  return (
    <header className="mb-12">
      {/* 뒤로 가기 링크 */}
      <div className="mb-6">
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          ← 모든 글 보기
        </Link>
      </div>

      {/* 포스트 제목 */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
        {post.title}
      </h1>

      {/* 포스트 메타 정보 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        {/* 작성자 정보 */}
        <div className="flex items-center gap-3">
          {post.author.avatar ? (
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
              {post.author.name[0]}
            </div>
          )}
          <div>
            <p className="font-medium">{post.author.name}</p>
            {post.author.bio && (
              <p className="text-sm text-muted-foreground">{post.author.bio}</p>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="hidden sm:block w-px h-8 bg-border" />

        {/* 날짜 및 읽기 시간 정보 */}
        <div className="flex flex-col text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>📅 {getRelativeTime(post.created_at)}</span>
            <span>📖 {Math.ceil(post.content.length / 200)}분 읽기</span>
            <span>👀 {post.view_count.toLocaleString()}</span>
          </div>
          {new Date(post.updated_at) > new Date(post.created_at) && (
            <p className="text-xs mt-1">
              마지막 수정: {new Date(post.updated_at).toLocaleDateString('ko-KR')}
            </p>
          )}
        </div>

        {/* 구분선 */}
        <div className="hidden sm:block w-px h-8 bg-border" />

        {/* 좋아요 버튼 */}
        <div className="flex items-center">
          <LikeButton
            postId={post.slug}
            initialLikes={0} // 추후 구현
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
function PostContent({ post }: { post: any }) {
  return (
    <article className="mb-16">
      {/* 커버 이미지 */}
      {post.cover_image_url && (
        <div className="relative w-full h-64 md:h-80 lg:h-96 mb-8 rounded-xl overflow-hidden">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          />
        </div>
      )}

      {/* 마크다운 콘텐츠 */}
      <MarkdownContent 
        content={post.content}
        size="lg"
        enableTableOfContents={true}
        className="mb-12"
      />

      {/* 소셜 공유 및 좋아요 버튼 */}
      <div className="mt-12 pt-8 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* 좋아요 섹션 */}
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">이 글이 도움이 되셨나요?</span>
            <LikeButton
              postId={post.slug}
              initialLikes={0} // 추후 구현
              size="lg"
              showCount={true}
            />
          </div>

          {/* 소셜 공유 버튼 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 sm:text-right">공유하기</h3>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                Twitter
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Facebook
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                링크 복사
              </button>
            </div>
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
    // Supabase 클라이언트 생성
    const supabase = createServerClient();
  
  // 포스트 데이터 가져오기
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
  
  // 포스트가 존재하지 않으면 404 반환
    if (error || !post) {
    notFound();
  }

    // 조회수 증가 (별도 요청으로 처리)
    await supabase
      .from('posts')
      .update({ view_count: post.view_count + 1 })
      .eq('id', post.id);

    // PostHeader와 PostContent에 맞는 데이터 형식으로 변환
    const transformedPost = {
      ...post,
      author: {
        id: post.author_id,
        name: '작성자', // Clerk에서 가져올 예정
        avatar: '/default-avatar.png',
        bio: null
      }
    };

    // RelatedPosts 컴포넌트를 위한 BlogPost 타입으로 변환
    const blogPost = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content,
      excerpt: post.content.substring(0, 200) + '...',
      publishedAt: post.created_at,
      updatedAt: post.updated_at,
      author: {
        id: post.author_id,
        name: '작성자',
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
      tags: [],
      coverImage: post.cover_image_url || '/images/default-cover.jpg',
      images: [],
      readingTime: Math.ceil(post.content.length / 1000),
      viewCount: post.view_count,
      likeCount: 0,
      featured: false,
      comments: [],
      draft: post.status !== 'published'
    };

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto">
        {/* 포스트 헤더 */}
          <PostHeader post={transformedPost} />

        {/* 포스트 콘텐츠 */}
          <PostContent post={transformedPost} />

        {/* 관련 포스트 - 새로운 컴포넌트 사용 */}
          <RelatedPosts currentPost={blogPost} />

        {/* 다음 구현할 섹션들 */}
        <div className="mt-16 pt-8 border-t">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">💬 댓글 시스템은 곧 추가될 예정입니다. 👍 좋아요 기능은 이미 활성화되어 있어요!</p>
            <div className="flex justify-center gap-4">
              <Link
                href="/posts"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                다른 글 보기
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('게시물 조회 중 오류 발생:', error);
    notFound();
  }
} 