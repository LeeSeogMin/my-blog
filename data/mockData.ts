/**
 * 블로그 애플리케이션 목업 데이터
 * 타입 정의, 샘플 데이터, 유틸리티 함수 제공
 */

import type { Comment, CommentFormData, CommentStats } from '@/types/comment';

/**
 * 작성자 정보 인터페이스
 */
export interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

/**
 * 카테고리 인터페이스
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

/**
 * 블로그 포스트 인터페이스
 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: Author;
  category: Category;
  tags: string[];
  coverImage?: string;
  publishedAt: Date;
  updatedAt: Date;
  readingTime: number;
  viewCount: number;
  likeCount: number;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
}

// 댓글 관련 타입들을 re-export
export type { Comment, CommentFormData, CommentStats };

// ================================
// 샘플 데이터
// ================================

/**
 * 샘플 작성자 데이터
 */
export const mockAuthors: Author[] = [
  {
    id: 'author-1',
    name: '김개발',
    email: 'kim@example.com',
    bio: '풀스택 개발자로 웹 기술과 사용자 경험에 관심이 많습니다.',
    socialLinks: {
      github: 'https://github.com/kimdev',
      twitter: 'https://twitter.com/kimdev'
    }
  },
  {
    id: 'author-2',
    name: '박프론트',
    email: 'park@example.com',
    bio: '프론트엔드 전문가, React와 Next.js를 주로 다룹니다.',
    socialLinks: {
      github: 'https://github.com/parkfront'
    }
  }
];

/**
 * 샘플 카테고리 데이터
 */
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: '웹 개발',
    slug: 'web-development',
    description: '웹 개발 전반에 관한 내용',
    color: '#3B82F6'
  },
  {
    id: 'cat-2',
    name: 'JavaScript',
    slug: 'javascript',
    description: 'JavaScript 언어와 관련 기술',
    color: '#F59E0B'
  },
  {
    id: 'cat-3',
    name: 'React',
    slug: 'react',
    description: 'React 라이브러리와 생태계',
    color: '#06B6D4'
  },
  {
    id: 'cat-4',
    name: 'Next.js',
    slug: 'nextjs',
    description: 'Next.js 프레임워크',
    color: '#000000'
  },
  {
    id: 'cat-5',
    name: 'TypeScript',
    slug: 'typescript',
    description: 'TypeScript 언어와 타입 시스템',
    color: '#3178C6'
  }
];

/**
 * 샘플 블로그 포스트 데이터
 */
export const mockPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Next.js 15와 App Router로 모던 웹 애플리케이션 구축하기',
    slug: 'nextjs-15-app-router-modern-web-app',
    content: '# Next.js 15와 App Router로 모던 웹 애플리케이션 구축하기\n\nNext.js 15가 출시되면서 많은 새로운 기능들이 추가되었습니다...',
    excerpt: 'Next.js 15의 App Router를 활용하여 모던하고 성능 최적화된 웹 애플리케이션을 구축하는 방법을 알아봅니다.',
    author: mockAuthors[0],
    category: mockCategories[3],
    tags: ['Next.js', 'App Router', '웹 개발', 'React'],
    publishedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    readingTime: 8,
    viewCount: 1250,
    likeCount: 89,
    featured: true,
    status: 'published'
  },
  {
    id: 'post-2',
    title: 'TypeScript 마스터하기: 고급 타입과 유틸리티 타입 활용법',
    slug: 'typescript-advanced-types-utility-types',
    content: '# TypeScript 마스터하기: 고급 타입과 유틸리티 타입 활용법\n\nTypeScript를 사용하다 보면 기본 타입만으로는 복잡한 애플리케이션의 타입을 정확히 표현하기 어려운 경우가 있습니다...',
    excerpt: 'TypeScript의 고급 타입 시스템과 유틸리티 타입을 활용하여 더욱 안전하고 표현력 있는 코드를 작성하는 방법을 배워봅니다.',
    author: mockAuthors[1],
    category: mockCategories[4],
    tags: ['TypeScript', '고급 타입', '유틸리티 타입', '타입 안정성'],
    publishedAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    readingTime: 12,
    viewCount: 890,
    likeCount: 67,
    featured: true,
    status: 'published'
  },
  {
    id: 'post-3',
    title: 'React 18의 새로운 기능들: Concurrent Features 완전 정복',
    slug: 'react-18-concurrent-features-guide',
    content: '# React 18의 새로운 기능들: Concurrent Features 완전 정복\n\nReact 18에서 도입된 Concurrent Features는 사용자 경험을 크게 향상시키는 혁신적인 기능들입니다...',
    excerpt: 'React 18의 Concurrent Features를 활용하여 더욱 반응성 높고 사용자 친화적인 애플리케이션을 구축하는 방법을 알아봅니다.',
    author: mockAuthors[0],
    category: mockCategories[2],
    tags: ['React', 'React 18', 'Concurrent Features', 'Performance'],
    publishedAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    readingTime: 10,
    viewCount: 756,
    likeCount: 54,
    featured: false,
    status: 'published'
  },
  {
    id: 'post-4',
    title: 'JavaScript ES2024 새로운 기능들과 실무 활용 사례',
    slug: 'javascript-es2024-new-features-practical-examples',
    content: '# JavaScript ES2024 새로운 기능들과 실무 활용 사례\n\n매년 JavaScript에는 새로운 기능들이 추가됩니다. ES2024(ES15)에서도 개발자의 생산성을 높이는 유용한 기능들이 도입되었습니다...',
    excerpt: 'JavaScript ES2024에서 새롭게 추가된 기능들을 살펴보고, 실무에서 이를 효과적으로 활용하는 방법을 알아봅니다.',
    author: mockAuthors[1],
    category: mockCategories[1],
    tags: ['JavaScript', 'ES2024', '새로운 기능', '모던 JavaScript'],
    publishedAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    readingTime: 7,
    viewCount: 642,
    likeCount: 43,
    featured: false,
    status: 'published'
  },
  {
    id: 'post-5',
    title: '웹 성능 최적화 완벽 가이드: Core Web Vitals부터 실전 기법까지',
    slug: 'web-performance-optimization-complete-guide',
    content: '# 웹 성능 최적화 완벽 가이드: Core Web Vitals부터 실전 기법까지\n\n웹 성능은 사용자 경험과 SEO에 직접적인 영향을 미치는 중요한 요소입니다...',
    excerpt: 'Google의 Core Web Vitals 지표부터 실전에서 바로 적용할 수 있는 웹 성능 최적화 기법까지 종합적으로 다룹니다.',
    author: mockAuthors[0],
    category: mockCategories[0],
    tags: ['성능 최적화', 'Core Web Vitals', 'SEO', '사용자 경험'],
    publishedAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    readingTime: 15,
    viewCount: 523,
    likeCount: 38,
    featured: false,
    status: 'published'
  },
  {
    id: 'post-6',
    title: 'CSS Grid vs Flexbox: 언제 무엇을 사용해야 할까?',
    slug: 'css-grid-vs-flexbox-when-to-use',
    content: '# CSS Grid vs Flexbox: 언제 무엇을 사용해야 할까?\n\nCSS의 레이아웃 시스템으로 Grid와 Flexbox가 널리 사용되고 있습니다. 하지만 언제 어떤 것을 사용해야 할지 헷갈리는 경우가 많습니다...',
    excerpt: 'CSS Grid와 Flexbox의 차이점을 이해하고, 상황에 맞는 최적의 레이아웃 방법을 선택하는 가이드를 제공합니다.',
    author: mockAuthors[1],
    category: mockCategories[0],
    tags: ['CSS', 'Grid', 'Flexbox', '레이아웃'],
    publishedAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    readingTime: 9,
    viewCount: 445,
    likeCount: 29,
    featured: false,
    status: 'published'
  }
];

/**
 * 샘플 댓글 데이터
 */
export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    authorName: '김독자',
    authorEmail: 'reader1@example.com',
    authorWebsite: 'https://blog.example.com',
    content: 'Next.js 15의 App Router에 대한 설명이 정말 도움이 되었습니다! 특히 서버 컴포넌트와 클라이언트 컴포넌트의 차이점 부분이 이해하기 쉽게 설명되어 있네요.',
    createdAt: new Date('2024-01-16T10:30:00Z'),
    status: 'approved',
    likeCount: 12,
    dislikeCount: 0,
    reportCount: 0,
    isEdited: false,
    isPinned: false,
    isAuthor: false
  },
  {
    id: 'comment-2',
    postId: 'post-1',
    authorName: '박개발',
    authorEmail: 'dev2@example.com',
    content: '@김독자 저도 같은 생각입니다. 실제 프로젝트에 바로 적용해볼 수 있는 예제들이 많아서 좋았어요.',
    createdAt: new Date('2024-01-16T14:45:00Z'),
    status: 'approved',
    parentId: 'comment-1',
    likeCount: 8,
    dislikeCount: 0,
    reportCount: 0,
    isEdited: false,
    isPinned: false,
    isAuthor: false
  },
  {
    id: 'comment-3',
    postId: 'post-1',
    authorName: '김개발',
    authorEmail: 'kim@example.com',
    authorImageUrl: '/images/avatars/default.png',
    content: '좋은 피드백 감사합니다! 다음 포스트에서는 더 실전적인 예제들을 다뤄보겠습니다.',
    createdAt: new Date('2024-01-16T16:20:00Z'),
    status: 'approved',
    parentId: 'comment-1',
    likeCount: 15,
    dislikeCount: 0,
    reportCount: 0,
    isEdited: false,
    isPinned: true,
    isAuthor: true
  },
  {
    id: 'comment-4',
    postId: 'post-2',
    authorName: '이타입',
    authorEmail: 'type@example.com',
    content: 'TypeScript의 고급 타입 기능들이 이렇게 활용할 수 있는지 몰랐네요. 특히 조건부 타입 부분이 인상깊었습니다.',
    createdAt: new Date('2024-01-12T09:15:00Z'),
    status: 'approved',
    likeCount: 7,
    dislikeCount: 0,
    reportCount: 0,
    isEdited: false,
    isPinned: false,
    isAuthor: false
  },
  {
    id: 'comment-5',
    postId: 'post-3',
    authorName: '리액트매니아',
    authorEmail: 'react@example.com',
    content: 'React 18의 Concurrent Features 정말 혁신적이네요! 실제 프로젝트에서 성능 향상을 체감할 수 있었습니다.',
    createdAt: new Date('2024-01-09T15:20:00Z'),
    status: 'approved',
    likeCount: 11,
    dislikeCount: 0,
    reportCount: 0,
    isEdited: false,
    isPinned: false,
    isAuthor: false
  }
];

// ================================
// 유틸리티 함수
// ================================

/**
 * 포스트 ID로 포스트 조회
 */
export function getPostById(id: string): BlogPost | undefined {
  return mockPosts.find(post => post.id === id);
}

/**
 * 슬러그로 포스트 조회
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return mockPosts.find(post => post.slug === slug);
}

/**
 * 카테고리별 포스트 조회
 */
export function getPostsByCategory(categorySlug: string): BlogPost[] {
  return mockPosts.filter(post => post.category.slug === categorySlug);
}

/**
 * 태그별 포스트 조회
 */
export function getPostsByTag(tag: string): BlogPost[] {
  return mockPosts.filter(post => post.tags.includes(tag));
}

/**
 * 추천 포스트 조회
 */
export function getFeaturedPosts(): BlogPost[] {
  return mockPosts.filter(post => post.featured && post.status === 'published');
}

/**
 * 최근 포스트 조회
 */
export function getRecentPosts(limit: number = 5): BlogPost[] {
  return mockPosts
    .filter(post => post.status === 'published')
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
}

/**
 * 포스트 검색
 */
export function searchPosts(query: string): BlogPost[] {
  const lowercaseQuery = query.toLowerCase();
  return mockPosts.filter(post =>
    post.status === 'published' && (
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.excerpt.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  );
}

/**
 * 인기 태그 조회
 */
export function getPopularTags(limit: number = 10): string[] {
  const tagCounts = new Map<string, number>();
  
  mockPosts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  
  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

/**
 * 포스트별 댓글 조회
 */
export function getCommentsByPostId(postId: string): Comment[] {
  return mockComments.filter(comment => 
    comment.postId === postId && comment.status === 'approved'
  );
}

/**
 * 댓글을 트리 구조로 변환
 */
export function buildCommentTree(postId: string): Comment[] {
  const comments = getCommentsByPostId(postId);
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // 모든 댓글을 Map에 저장하고 replies 배열 초기화
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // 댓글을 트리 구조로 구성
  commentMap.forEach(comment => {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  // 날짜순으로 정렬
  rootComments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  
  rootComments.forEach(comment => {
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
  });

  return rootComments;
}

/**
 * 댓글 통계 조회
 */
export function getCommentStats(postId: string): CommentStats {
  const postComments = mockComments.filter(comment => comment.postId === postId);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const totalComments = postComments.length;
  const approvedComments = postComments.filter(c => c.status === 'approved').length;
  const pendingComments = postComments.filter(c => c.status === 'pending').length;
  const spamComments = postComments.filter(c => c.status === 'spam').length;
  const todayComments = postComments.filter(c => c.createdAt >= todayStart).length;
  const weekComments = postComments.filter(c => c.createdAt >= weekStart).length;
  
  const avgCommentLength = totalComments > 0 
    ? Math.round(postComments.reduce((sum, c) => sum + c.content.length, 0) / totalComments)
    : 0;
  
  const replyCount = postComments.filter(c => c.parentId).length;
  const replyRatio = totalComments > 0 ? Math.round((replyCount / totalComments) * 100) : 0;
  
  return {
    postId,
    totalComments,
    approvedComments,
    pendingComments,
    spamComments,
    todayComments,
    weekComments,
    avgCommentLength,
    replyRatio,
  };
}

// 삭제: getLatestPosts는 아래에서 더 개선된 버전으로 재구현됨

/**
 * 상대적 시간 표시 함수
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return '방금 전';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}주 전`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}년 전`;
}

/**
 * 카테고리별 포스트 개수와 함께 카테고리 조회
 */
export function getCategoriesWithCount(): Array<Category & { postCount: number }> {
  return mockCategories.map(category => ({
    ...category,
    postCount: mockPosts.filter(post => 
      post.category.id === category.id && post.status === 'published'
    ).length
  }));
}

/**
 * 페이지네이션된 포스트 조회
 */
export function getPaginatedPosts(
  page: number = 1,
  limit: number = 10,
  categorySlug?: string,
  sortBy: 'latest' | 'popular' | 'views' = 'latest'
): {
  data: BlogPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
} {
  let filteredPosts = mockPosts.filter(post => post.status === 'published');
  
  // 카테고리 필터링
  if (categorySlug && categorySlug !== 'all') {
    filteredPosts = filteredPosts.filter(post => post.category.slug === categorySlug);
  }
  
  // 정렬
  switch (sortBy) {
    case 'popular':
      filteredPosts.sort((a, b) => b.likeCount - a.likeCount);
      break;
    case 'views':
      filteredPosts.sort((a, b) => b.viewCount - a.viewCount);
      break;
    case 'latest':
    default:
      filteredPosts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
      break;
  }
  
  const totalItems = filteredPosts.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = filteredPosts.slice(startIndex, endIndex);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * 페이지네이션 번호 생성 함수
 */
export function getPageNumbers(currentPage: number, totalPages: number): number[] {
  const pages: number[] = [];
  const maxVisiblePages = 5;
  
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  }
  
  return pages;
}

/**
 * 관련 포스트 가져오기
 * @param currentPost 현재 포스트
 * @param limit 가져올 포스트 개수
 * @returns 관련도 순으로 정렬된 포스트 배열
 */
export function getRelatedPosts(currentPost: BlogPost, limit: number = 3): BlogPost[] {
  // 현재 포스트를 제외한 발행된 포스트만 필터링
  const otherPosts = mockPosts.filter(post => 
    post.id !== currentPost.id && 
    post.status === 'published'
  );

  // 각 포스트의 관련도 점수 계산
  const scoredPosts = otherPosts.map(post => {
    let score = 0;

    // 1. 같은 카테고리 (+10점)
    if (post.category.id === currentPost.category.id) {
      score += 10;
    }

    // 2. 공통 태그 (태그당 +2점)
    const commonTags = post.tags.filter(tag => 
      currentPost.tags.includes(tag)
    );
    score += commonTags.length * 2;

    // 3. 최신 포스트 가산점 (최대 5점)
    const daysDiff = Math.floor(
      (new Date().getTime() - post.publishedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    score += Math.max(0, 5 - Math.floor(daysDiff / 30)); // 한 달당 1점 감소

    return { post, score };
  });

  // 점수 기준 내림차순 정렬 후 상위 N개 반환
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}

/**
 * 최신 포스트 가져오기
 * @param limit 가져올 포스트 개수
 * @param excludeIds 제외할 포스트 ID 목록
 * @returns 최신 순으로 정렬된 포스트 배열
 */
export function getLatestPosts(limit: number = 3, excludeIds: string[] = []): BlogPost[] {
  return mockPosts
    .filter(post => 
      post.status === 'published' && 
      !excludeIds.includes(post.id)
    )
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
}