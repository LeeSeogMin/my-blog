'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useUser, SignInButton } from '@clerk/nextjs';

interface LikeButtonProps {
  postId: string;
  initialLikes?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

/**
 * 블로그 포스트 좋아요 버튼 컴포넌트 (데이터베이스 연동)
 * Supabase 데이터베이스와 Clerk 인증을 활용한 좋아요 기능을 제공합니다.
 */
export default function LikeButton({ 
  postId, 
  initialLikes = 0, 
  size = 'md',
  showCount = true,
  className = ''
}: LikeButtonProps) {
  const { user, isSignedIn } = useUser();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  /**
   * 서버에서 좋아요 상태 조회
   */
  const fetchLikeStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('=== 좋아요 상태 조회 ===', postId);

      const response = await fetch(`/api/likes?postId=${postId}`);
      
      if (!response.ok) {
        throw new Error(`좋아요 상태 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 좋아요 상태 조회 완료:', data);

      setIsLiked(data.liked || false);
      setLikeCount(data.totalLikes || 0);
    } catch (error) {
      console.error('좋아요 상태 조회 중 오류:', error);
      // 오류 시 기본값 유지
      setIsLiked(false);
      setLikeCount(initialLikes);
    } finally {
      setIsLoading(false);
    }
  }, [postId, initialLikes]);

  /**
   * 좋아요 토글 처리 (데이터베이스 연동)
   */
  const handleLikeToggle = async (): Promise<void> => {
    if (isLoading) return; // 중복 클릭 방지

    if (!isSignedIn) {
      console.log('미인증 사용자 - 로그인 필요');
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);

    // 낙관적 업데이트 (UI 즉시 변경)
    const previousLiked = isLiked;
    const previousCount = likeCount;
    const newLikedState = !isLiked;
    const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;

    setIsLiked(newLikedState);
    setLikeCount(newLikeCount);

    try {
      console.log('=== 좋아요 토글 ===', { postId, newLikedState });

      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error(`좋아요 토글 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 좋아요 토글 완료:', data);

      // 서버에서 받은 실제 데이터로 상태 업데이트
      setIsLiked(data.liked);
      setLikeCount(data.totalLikes);

      // 애니메이션 효과를 위한 지연
      setTimeout(() => {
        setIsAnimating(false);
      }, 200);

    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
      
      // 오류 발생 시 상태 롤백
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      setIsAnimating(false);
    } finally {
      setIsLoading(false);
    }
  };
  /**
   * 키보드 이벤트 처리
   * @param event 키보드 이벤트
   */
  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLikeToggle();
    }
  };

  /**
   * 컴포넌트 크기별 스타일 설정
   */
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'h-8 px-2 text-xs',
          icon: 'w-3 h-3',
          gap: 'gap-1'
        };
      case 'lg':
        return {
          button: 'h-12 px-4 text-base',
          icon: 'w-6 h-6',
          gap: 'gap-2'
        };
      default: // md
        return {
          button: 'h-10 px-3 text-sm',
          icon: 'w-4 h-4',
          gap: 'gap-1.5'
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // 컴포넌트 마운트 시 서버에서 좋아요 상태 조회
  useEffect(() => {
    fetchLikeStatus();
  }, [fetchLikeStatus]);

  // 미인증 사용자를 위한 렌더링
  if (!isSignedIn) {
    return (
      <div className={`flex items-center ${sizeStyles.gap} ${className}`}>
        <SignInButton mode="modal">
          <Button
            variant="outline"
            size="sm"
            className={`
              ${sizeStyles.button} 
              ${sizeStyles.gap}
              hover:bg-red-50 hover:text-red-600 hover:border-red-300
              transition-all duration-200 ease-in-out
            `}
          >
            <Heart className={`${sizeStyles.icon} fill-none`} />
            {showCount && likeCount > 0 && (
              <span className="font-medium select-none">
                {likeCount}
              </span>
            )}
          </Button>
        </SignInButton>
        <span className="text-xs text-muted-foreground ml-1">
          로그인하여 좋아요
        </span>
      </div>
    );
  }
  return (
    <Button
      variant={isLiked ? 'default' : 'outline'}
      size="sm"
      className={`
        ${sizeStyles.button} 
        ${sizeStyles.gap}
        ${isLiked 
          ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
          : 'hover:bg-red-50 hover:text-red-600 hover:border-red-300'
        }
        transition-all duration-200 ease-in-out
        ${isAnimating ? 'scale-105' : 'scale-100'}
        ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={handleLikeToggle}
      onKeyDown={handleKeyDown}
      disabled={isLoading}
      aria-label={`이 포스트에 ${isLiked ? '좋아요 취소' : '좋아요'}`}
      aria-pressed={isLiked}
      role="button"
      tabIndex={0}
    >
      <Heart 
        className={`
          ${sizeStyles.icon}
          ${isLiked ? 'fill-current' : 'fill-none'}
          ${isAnimating ? 'animate-pulse' : ''}
          ${isLoading ? 'animate-spin' : ''}
          transition-all duration-200
        `}
      />
      
      {showCount && (
        <span className="font-medium select-none">
          {isLoading ? '...' : (likeCount > 0 ? likeCount : '')}
        </span>
      )}
      
      {/* 스크린 리더를 위한 추가 정보 */}
      <span className="sr-only">
        {isLoading 
          ? '좋아요를 처리 중입니다...'
          : isLiked 
            ? `좋아요를 눌렀습니다. 현재 총 ${likeCount}개의 좋아요가 있습니다.`
            : `좋아요를 누르세요. 현재 총 ${likeCount}개의 좋아요가 있습니다.`
        }
      </span>
    </Button>
  );
}