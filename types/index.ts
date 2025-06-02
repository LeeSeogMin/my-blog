/**
 * 블로그 애플리케이션의 핵심 인터페이스 정의
 * @module types/index
 */

/**
 * 블로그 포스트 데이터 구조
 * @interface BlogPost
 */
export interface BlogPost {
  /** 포스트 고유 식별자 */
  id: string;
  /** URL에 사용될 고유 문자열 */
  slug: string;
  /** 포스트 제목 */
  title: string;
  /** 포스트 내용 (Markdown 형식) */
  content: string;
  /** 포스트 요약 (검색 결과, 목록 등에 표시) */
  excerpt: string;
  /** 포스트 발행일 (ISO 문자열) */
  publishedAt: string;
  /** 포스트 수정일 (ISO 문자열) */
  updatedAt?: string;
  /** 포스트 작성자 */
  author: Author;
  /** 포스트 카테고리 */
  category: Category;
  /** 관련 태그 목록 */
  tags: string[];
  /** 메인 커버 이미지 경로 */
  coverImage: string;
  /** 포스트에 포함된 추가 이미지들 */
  images?: string[];
  /** 읽기 예상 시간 (분) */
  readingTime: number;
  /** 조회수 */
  viewCount: number;
  /** 좋아요 수 */
  likeCount: number;
  /** 특집 포스트 여부 */
  featured: boolean;
  /** 관련 댓글 목록 */
  comments?: Comment[];
  /** 초안 여부 (true인 경우 공개 목록에 표시되지 않음) */
  draft?: boolean;
}

/**
 * 작성자 정보 구조
 * @interface Author
 */
export interface Author {
  /** 작성자 고유 식별자 */
  id: string;
  /** 작성자 이름 */
  name: string;
  /** 작성자 소개 */
  bio?: string;
  /** 작성자 프로필 이미지 */
  profileImage?: string;
  /** 작성자 역할/직함 */
  role?: string;
  /** 작성자 연락처 이메일 */
  email?: string;
  /** 소셜 미디어 링크 */
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

/**
 * 카테고리 정보 구조
 * @interface Category
 */
export interface Category {
  /** 카테고리 고유 식별자 */
  id: string;
  /** URL에 사용될 고유 문자열 */
  slug: string;
  /** 카테고리 이름 */
  name: string;
  /** 카테고리 설명 */
  description?: string;
  /** 카테고리 아이콘 (선택적) */
  icon?: string;
  /** 상위 카테고리 ID (중첩 카테고리 구조용) */
  parentId?: string;
  /** 카테고리 색상 */
  color?: string;
}

/**
 * 댓글 정보 구조
 * @interface Comment
 */
export interface Comment {
  /** 댓글 고유 식별자 */
  id: string;
  /** 연결된 포스트 ID */
  postId: string;
  /** 댓글 작성자 (등록된 사용자 또는 임시 이름) */
  author: {
    /** 작성자 ID (등록된 경우) */
    id?: string;
    /** 작성자 이름 */
    name: string;
    /** 작성자 이메일 (옵션) */
    email?: string;
    /** 작성자 프로필 이미지 */
    profileImage?: string;
  };
  /** 댓글 내용 */
  content: string;
  /** 작성 일시 */
  createdAt: string;
  /** 수정 일시 */
  updatedAt?: string;
  /** 상위 댓글 ID (대댓글인 경우) */
  parentId?: string;
  /** 좋아요 수 */
  likeCount: number;
  /** 대댓글 목록 */
  replies?: Comment[];
}

/**
 * 타입 가드: BlogPost 객체 검증
 * @param obj 검증할 객체
 * @returns 객체가 BlogPost 타입인지 여부
 */
export function isBlogPost(obj: any): obj is BlogPost {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.slug === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.excerpt === 'string' &&
    typeof obj.publishedAt === 'string'
  );
}

/**
 * 타입 가드: Author 객체 검증
 * @param obj 검증할 객체
 * @returns 객체가 Author 타입인지 여부
 */
export function isAuthor(obj: any): obj is Author {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string'
  );
}

/**
 * 타입 가드: Category 객체 검증
 * @param obj 검증할 객체
 * @returns 객체가 Category 타입인지 여부
 */
export function isCategory(obj: any): obj is Category {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.slug === 'string' &&
    typeof obj.name === 'string'
  );
}

/**
 * 타입 가드: Comment 객체 검증
 * @param obj 검증할 객체
 * @returns 객체가 Comment 타입인지 여부
 */
export function isComment(obj: any): obj is Comment {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.postId === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.createdAt === 'string' &&
    obj.author &&
    typeof obj.author === 'object' &&
    typeof obj.author.name === 'string'
  );
}
