'use client';

/**
 * 블로그 포스트 카드 컴포넌트
 * 포스트 목록에서 개별 포스트를 표시하는 재사용 가능한 컴포넌트
 */

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { BlogPost } from '@/types';
import { useState } from 'react';
import LikeButton from './like-button';

/**
 * PostCard 컴포넌트의 Props 인터페이스
 */
interface PostCardProps {
  /** 표시할 블로그 포스트 데이터 */
  post: BlogPost;
  /** 카드 크기 변형 */
  variant?: 'default' | 'featured' | 'compact';
  /** 카테고리 태그 표시 여부 */
  showCategory?: boolean;
  /** 작성자 정보 표시 여부 */
  showAuthor?: boolean;
  /** 통계 정보 표시 여부 (조회수, 좋아요) */
  showStats?: boolean;
  /** 좋아요 버튼 표시 여부 */
  showLikeButton?: boolean;
  /** 태그 표시 여부 */
  showTags?: boolean;
  /** 최대 표시할 태그 개수 */
  maxTags?: number;
  /** 추가 클래스명 */
  className?: string;
  /** 검색어 (하이라이팅용) */
  searchQuery?: string;
}

/**
 * 검색어 하이라이팅 함수
 */
function highlightSearchTerm(text: string, searchTerm?: string): React.ReactNode {
  if (!searchTerm?.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-primary/20 text-primary font-medium rounded px-1">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/**
 * 블로그 포스트 카드 컴포넌트
 */
export function PostCard({
  post,
  variant = 'default',
  showCategory = true,
  showAuthor = true,
  showStats = true,
  showLikeButton = true,
  showTags = false,
  maxTags = 3,
  className = '',
  searchQuery,
}: PostCardProps) {
  const [imageError, setImageError] = useState(false);

  // 변형에 따른 이미지 높이 설정
  const imageHeight = {
    default: 'h-48',
    featured: 'h-56',
    compact: 'h-40'
  }[variant];

  // 변형에 따른 제목 크기 설정
  const titleSize = {
    default: 'text-xl',
    featured: 'text-2xl',
    compact: 'text-lg'
  }[variant];

  return (
    <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <article className="relative h-full">
        {/* 커버 이미지 */}
        <div className={`relative ${imageHeight} overflow-hidden`}>
          {post.coverImage && !imageError ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={variant === 'featured'}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
              <div className="text-4xl opacity-60">📝</div>
            </div>
          )}

          {/* 추천 포스트 배지 */}
          {post.featured && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                ⭐ 추천
              </span>
            </div>
          )}
          
          {/* 검색 결과 배지 */}
          {searchQuery && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                🔍 검색 결과
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-6 flex flex-col h-full">
          {/* 메타 정보 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 flex-wrap">
            {/* 카테고리 */}
            {showCategory && (
              <>
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
              </>
            )}
            
            {/* 읽기 시간 */}
            <span className="flex items-center gap-1">
              <span>📖</span>
              {post.readingTime}분 읽기
            </span>
            
            <span>•</span>
            
            {/* 발행일 */}
            <time dateTime={new Date(post.publishedAt).toISOString()}>
              {getRelativeTime(new Date(post.publishedAt))}
            </time>
          </div>

          {/* 제목 (검색어 하이라이팅 적용) */}
          <h3 className={`${titleSize} font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight`}>
            {highlightSearchTerm(post.title, searchQuery)}
          </h3>

          {/* 요약 (검색어 하이라이팅 적용) */}
          <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed text-sm flex-grow">
            {highlightSearchTerm(post.excerpt, searchQuery)}
          </p>

          {/* 태그 (검색어 하이라이팅 적용) */}
          {showTags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {post.tags.slice(0, maxTags).map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  #{highlightSearchTerm(tag, searchQuery)}
                </Link>
              ))}
              {post.tags.length > maxTags && (
                <span className="px-2 py-1 text-xs text-muted-foreground">
                  +{post.tags.length - maxTags}
                </span>
              )}
            </div>
          )}

          {/* 하단 정보 */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
            {/* 왼쪽: 작성자 정보 */}
            {showAuthor && (
              <div className="flex items-center gap-2">
                {post.author.profileImage ? (
                  <Image
                    src={post.author.profileImage}
                    alt={post.author.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                    {post.author.name[0]}
                  </div>
                )}
                <span className="text-sm text-muted-foreground font-medium">
                  {post.author.name}
                </span>
              </div>
            )}

            {/* 오른쪽: 통계 정보 및 좋아요 버튼 */}
            <div className="flex items-center gap-3">              {/* 통계 정보 (조회수만) */}
              {showStats && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span>👀</span>
                    {(post.viewCount || 0).toLocaleString()}
                  </span>
                </div>
              )}{/* 좋아요 버튼 */}
              {showLikeButton && (
                <div onClick={(e) => e.stopPropagation()}>
                  <LikeButton
                    postId={post.id}
                    initialLikes={post.likeCount}
                    size="sm"
                    showCount={true}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* 전체 카드 링크 */}
        <Link
          href={`/posts/${post.slug}`}
          className="absolute inset-0 z-10"
          aria-label={`${post.title} 포스트 읽기`}
        />
      </article>
    </Card>
  );
}

// 기본 export도 유지
export default PostCard;

/**
 * 추천 포스트 카드 (featured 변형)
 */
export function FeaturedPostCard({ post, ...props }: Omit<PostCardProps, 'variant'>) {
  return (
    <PostCard
      post={post}
      variant="featured"
      showTags={true}
      maxTags={4}
      {...props}
    />
  );
}

/**
 * 컴팩트 포스트 카드 (compact 변형)
 */
export function CompactPostCard({ post, ...props }: Omit<PostCardProps, 'variant'>) {
  return (
    <PostCard
      post={post}
      variant="compact"
      showStats={false}
      {...props}
    />
  );
}

/**
 * 관련 포스트 카드 (compact 변형, 최소 정보)
 */
export function RelatedPostCard({ post, ...props }: Omit<PostCardProps, 'variant'>) {
  return (
    <PostCard
      post={post}
      variant="compact"
      showStats={false}
      showLikeButton={false}
      showTags={false}
      {...props}
    />
  );
} 