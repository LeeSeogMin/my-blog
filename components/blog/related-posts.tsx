/**
 * 관련 포스트 추천 컴포넌트
 * 현재 포스트와 관련된 다른 포스트들을 스마트하게 추천
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type BlogPost } from '@/data/mockData';

// 상대 시간 계산 함수
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
  return `${Math.floor(diffInSeconds / 31536000)}년 전`;
}

/**
 * RelatedPosts 컴포넌트의 Props 인터페이스
 */
interface RelatedPostsProps {
  /** 현재 포스트 (추천에서 제외됨) */
  currentPost: BlogPost;
  /** 표시할 관련 포스트 개수 */
  limit?: number;
  /** 섹션 제목 */
  title?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 빈 상태에서 최신 포스트로 대체 여부 */
  fallbackToLatest?: boolean;
  /** 컴팩트한 레이아웃 사용 여부 */
  compact?: boolean;
}

/**
 * 개별 관련 포스트 카드 컴포넌트
 */
interface RelatedPostCardProps {
  post: BlogPost;
  compact?: boolean;
}

function RelatedPostCard({ post, compact = false }: RelatedPostCardProps) {
  return (
    <article className="group relative bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* 커버 이미지 */}
      <div className={`relative overflow-hidden ${compact ? 'h-32' : 'h-40'}`}>
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
            <div className={`${compact ? 'text-2xl' : 'text-3xl'} opacity-60`}>📝</div>
          </div>
        )}
        
        {/* 추천 포스트 배지 */}
        {post.featured && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
              ⭐
            </span>
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="p-4">
        {/* 메타 정보 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {/* 카테고리 */}
          <Link
            href={`/categories/${post.category.slug}`}
            className="inline-flex items-center hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <span 
              className="px-2 py-1 rounded text-xs font-medium hover:opacity-80 transition-opacity"
              style={{ 
                backgroundColor: post.category.color + '15',
                color: post.category.color 
              }}
            >
              {post.category.name}
            </span>
          </Link>
          
          <span>•</span>
          
          {/* 읽기 시간 */}
          <span className="flex items-center gap-1">
            📖 {post.readingTime}분
          </span>
        </div>

        {/* 제목 */}
        <h3 className={`font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight ${
          compact ? 'text-sm' : 'text-base'
        }`}>
          {post.title}
        </h3>

        {/* 요약 (컴팩트 모드가 아닐 때만) */}
        {!compact && (
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-3">
            {post.excerpt}
          </p>
        )}

        {/* 하단 정보 */}
        <div className="flex items-center justify-between">
          {/* 작성자 */}
          <div className="flex items-center gap-2">
            {post.author.profileImage ? (
              <Image
                src={post.author.profileImage}
                alt={post.author.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                {post.author.name[0]}
              </div>
            )}
            <span className="text-xs text-muted-foreground font-medium">
              {post.author.name}
            </span>
          </div>

          {/* 발행일 */}
          <time 
            dateTime={new Date(post.publishedAt).toISOString()}
            className="text-xs text-muted-foreground"
          >
            {getRelativeTime(new Date(post.publishedAt))}
          </time>
        </div>
      </div>

      {/* 전체 카드 링크 */}
      <Link
        href={`/posts/${post.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`${post.title} 글 읽기`}
      />
    </article>
  );
}

/**
 * 빈 상태 컴포넌트
 */
function EmptyState({ 
  title = "관련 포스트가 없습니다", 
  description = "아직 관련된 다른 포스트가 없습니다. 곧 더 많은 콘텐츠를 제공할 예정입니다.",
  showLatestButton = true 
}: {
  title?: string;
  description?: string;
  showLatestButton?: boolean;
}) {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
        <span className="text-2xl opacity-60">📚</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
        {description}
      </p>
      {showLatestButton && (
        <Link
          href="/posts"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          📖 최신 글 보러 가기
        </Link>
      )}
    </div>
  );
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
function LoadingSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="bg-card border rounded-lg overflow-hidden animate-pulse">
      {/* 이미지 스켈레톤 */}
      <div className={`bg-muted ${compact ? 'h-32' : 'h-40'}`} />
      
      {/* 콘텐츠 스켈레톤 */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-12 bg-muted rounded" />
        </div>
        <div className="h-5 bg-muted rounded mb-2" />
        <div className="h-5 bg-muted rounded mb-2 w-3/4" />
        {!compact && (
          <>
            <div className="h-4 bg-muted rounded mb-1" />
            <div className="h-4 bg-muted rounded mb-3 w-2/3" />
          </>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-muted rounded-full" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
          <div className="h-3 w-12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * 관련 포스트 추천 메인 컴포넌트
 */
export default function RelatedPosts({
  currentPost,
  limit = 3,
  title = "관련 글",
  className = "",
  fallbackToLatest = true,
  compact = false,
}: RelatedPostsProps) {
  // 관련 포스트 계산 (메모이제이션) - 현재는 빈 배열 반환 (추후 구현)
  const posts = useMemo(() => {
    // TODO: 실제 데이터베이스에서 관련 포스트 조회 로직 구현
    return [];
  }, [currentPost, limit, fallbackToLatest]);

  // 추천 포스트가 없는 경우
  if (posts.length === 0) {
    return (
      <section className={`mt-16 pt-8 border-t ${className}`}>
        <h2 className="text-2xl font-bold mb-8">{title}</h2>
        <EmptyState />
      </section>
    );
  }

  return (
    <section className={`mt-16 pt-8 border-t ${className}`}>
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        {/* 추천 알고리즘 설명 */}
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            🎯 <span>스마트 추천</span>
          </span>
          <span className="text-xs bg-muted px-2 py-1 rounded">
            카테고리 + 태그 기반
          </span>
        </div>
      </div>

      {/* 포스트 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <RelatedPostCard 
            key={post.id} 
            post={post} 
            compact={compact}
          />
        ))}
      </div>

      {/* 더 보기 링크 */}
      {posts.length >= limit && (
        <div className="mt-8 text-center">
          <Link
            href={`/categories/${currentPost.category.slug}`}
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            📁 {currentPost.category.name} 카테고리의 다른 글 보기
          </Link>
        </div>
      )}

      {/* 추천 통계 (개발 모드에서만 표시) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 p-4 bg-muted/30 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium mb-2">
            🔍 추천 알고리즘 상세 정보 (개발 모드)
          </summary>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>현재 포스트: {currentPost.title}</p>
            <p>카테고리: {currentPost.category.name}</p>
            <p>태그: {currentPost.tags.join(', ')}</p>
            <p>추천 포스트 수: {posts.length}</p>
            <p>추천 기준: 동일 카테고리 (+10점) + 공통 태그 (+2점/개)</p>
          </div>
        </details>
      )}
    </section>
  );
}

/**
 * 컴팩트한 관련 포스트 컴포넌트 (사이드바용)
 */
export function CompactRelatedPosts({ currentPost, limit = 3 }: Pick<RelatedPostsProps, 'currentPost' | 'limit'>) {
  return (
    <RelatedPosts
      currentPost={currentPost}
      limit={limit}
      title="관련 글"
      compact={true}
      fallbackToLatest={true}
      className="mt-0 pt-0 border-t-0"
    />
  );
}

/**
 * 인라인 관련 포스트 컴포넌트 (본문 중간 삽입용)
 */
export function InlineRelatedPosts({ currentPost }: Pick<RelatedPostsProps, 'currentPost'>) {
  // TODO: 실제 데이터베이스에서 관련 포스트 조회 로직 구현
  const relatedPosts: BlogPost[] = [];
  
  if (relatedPosts.length === 0) return null;
  
  const post = relatedPosts[0];
  
  return (
    <div className="my-8 p-6 bg-muted/30 border-l-4 border-primary rounded-r-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <span className="text-2xl">💡</span>
        </div>
        <div className="flex-grow">
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">
            이 글과 관련된 추천 포스트
          </h4>
          <Link 
            href={`/posts/${post.slug}`}
            className="block group"
          >
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {post.excerpt}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
} 