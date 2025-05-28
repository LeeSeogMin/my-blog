/**
 * Supabase 데이터베이스 TypeScript 타입 정의
 * 2025년 새로운 Clerk Third-Party Auth 방식 호환
 * 
 * 특징:
 * - Clerk 사용자 ID는 string 타입 (UUID 아님)
 * - auth.jwt()->>'sub' 함수 활용
 * - Third-Party Auth 토큰 구조 반영
 */

// ========================================
// 1. 기본 데이터베이스 테이블 타입
// ========================================

/**
 * 카테고리 테이블 타입
 * 블로그 게시물 분류를 위한 카테고리 정보
 */
export interface Category {
  id: string; // UUID
  name: string;
  slug: string;
  description: string | null;
  color: string; // hex 색상 코드 (예: #6366f1)
  created_at: string; // ISO 8601 형식
  updated_at: string; // ISO 8601 형식
}

/**
 * 게시물 테이블 타입
 * 블로그의 핵심 콘텐츠 정보
 */
export interface Post {
  id: string; // UUID
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: 'draft' | 'published' | 'archived';
  cover_image_url: string | null; // Supabase Storage URL
  view_count: number;
  author_id: string; // 🔥 Clerk 사용자 ID (string 타입)
  category_id: string | null; // UUID
  created_at: string; // ISO 8601 형식
  updated_at: string; // ISO 8601 형식
}

/**
 * 댓글 테이블 타입
 * 게시물에 대한 사용자 댓글 (대댓글 지원)
 */
export interface Comment {
  id: string; // UUID
  content: string;
  user_id: string; // 🔥 Clerk 사용자 ID (string 타입)
  user_name: string | null; // Clerk에서 가져온 사용자 표시 이름
  user_email: string | null; // 사용자 이메일 (선택적)
  post_id: string; // UUID
  parent_id: string | null; // 대댓글의 경우 상위 댓글 ID
  created_at: string; // ISO 8601 형식
  updated_at: string; // ISO 8601 형식
}

/**
 * 좋아요 테이블 타입
 * 사용자의 게시물 좋아요 정보
 */
export interface Like {
  id: string; // UUID
  user_id: string; // 🔥 Clerk 사용자 ID (string 타입)
  post_id: string; // UUID
  created_at: string; // ISO 8601 형식
}

// ========================================
// 2. Database 스키마 타입 (Supabase 클라이언트용)
// ========================================

/**
 * Supabase Database 스키마 타입
 * createClient<Database>() 형태로 사용
 */
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'author_id' | 'view_count'> & {
          id?: string;
          author_id?: string; // auth.jwt()->>'sub' 기본값
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at' | 'author_id'>>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'user_id'> & {
          id?: string;
          user_id?: string; // auth.jwt()->>'sub' 기본값
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
      };
      likes: {
        Row: Like;
        Insert: Omit<Like, 'id' | 'created_at' | 'user_id'> & {
          id?: string;
          user_id?: string; // auth.jwt()->>'sub' 기본값
          created_at?: string;
        };
        Update: Partial<Omit<Like, 'id' | 'created_at' | 'user_id'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// ========================================
// 3. 확장 타입 (관계형 데이터 조회용)
// ========================================

/**
 * 카테고리 정보가 포함된 게시물 타입
 * JOIN 쿼리 결과용
 */
export interface PostWithCategory extends Post {
  categories: Category | null;
}

/**
 * 댓글 수가 포함된 게시물 타입
 * 게시물 목록에서 댓글 수 표시용
 */
export interface PostWithCommentCount extends Post {
  comment_count: number;
}

/**
 * 좋아요 수가 포함된 게시물 타입
 * 게시물 목록에서 좋아요 수 표시용
 */
export interface PostWithLikeCount extends Post {
  like_count: number;
}

/**
 * 모든 관련 정보가 포함된 완전한 게시물 타입
 * 게시물 상세 페이지용
 */
export interface PostWithAllData extends Post {
  categories: Category | null;
  comment_count: number;
  like_count: number;
  user_liked: boolean; // 현재 사용자가 좋아요를 눌렀는지
}

/**
 * 게시물 수가 포함된 카테고리 타입
 * 카테고리 목록 페이지용
 */
export interface CategoryWithPostCount extends Category {
  post_count: number;
}

/**
 * 대댓글이 포함된 댓글 타입
 * 댓글 트리 구조 표시용
 */
export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

// ========================================
// 4. Clerk 사용자 관련 타입 (2025년 Third-Party Auth)
// ========================================

/**
 * Clerk 사용자 기본 정보 타입
 * Third-Party Auth에서 사용되는 사용자 정보
 */
export interface ClerkUser {
  id: string; // Clerk 사용자 ID (string 형식)
  firstName: string | null;
  lastName: string | null;
  emailAddress: string;
  imageUrl: string | null;
  username: string | null;
}

/**
 * JWT 토큰 클레임 타입 (2025년 새로운 방식)
 * auth.jwt() 함수 결과 타입
 */
export interface JWTClaims {
  sub: string; // Clerk 사용자 ID
  role: 'authenticated' | 'anon'; // 사용자 역할
  aud: string; // 대상 (audience)
  exp: number; // 만료 시간 (Unix timestamp)
  iat: number; // 발급 시간 (Unix timestamp)
  iss: string; // 발급자 (issuer)
  email?: string; // 사용자 이메일 (선택적)
}

/**
 * Clerk 세션 정보 타입
 * useSession 훅에서 사용되는 세션 타입
 */
export interface ClerkSession {
  id: string;
  user: ClerkUser;
  lastActiveAt: Date;
  expireAt: Date;
  getToken: () => Promise<string | null>;
}

// ========================================
// 5. API 응답 타입
// ========================================

/**
 * 기본 API 응답 타입
 * 모든 API 엔드포인트에서 사용되는 공통 응답 구조
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 페이지네이션이 포함된 API 응답 타입
 * 목록 조회 API에서 사용
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 게시물 생성/수정 요청 타입
 * POST, PUT API에서 사용되는 요청 바디 타입
 */
export interface PostCreateRequest {
  title: string;
  content: string;
  excerpt?: string;
  category_id?: string | null;
  status?: 'draft' | 'published' | 'archived';
  featured_image?: string | null;
}

/**
 * 댓글 생성 요청 타입
 * 댓글 작성 API에서 사용되는 요청 바디 타입
 */
export interface CommentCreateRequest {
  content: string;
  post_id: string;
  parent_id?: string; // 대댓글의 경우
  user_name?: string; // Clerk에서 가져온 사용자 이름
  user_email?: string; // 사용자 이메일
}

// ========================================
// 6. 유틸리티 타입
// ========================================

/**
 * 테이블 이름 타입
 * 타입 안전한 테이블 참조를 위한 유니온 타입
 */
export type TableName = 'categories' | 'posts' | 'comments' | 'likes';

/**
 * 게시물 상태 타입
 * 게시물 상태 필터링에 사용
 */
export type PostStatus = Post['status'];

/**
 * 정렬 방향 타입
 * 목록 조회 시 정렬 방향 지정
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 정렬 필드 타입 (게시물용)
 * 게시물 목록 정렬에 사용되는 필드
 */
export type PostSortField = 'created_at' | 'updated_at' | 'title' | 'view_count';

// ========================================
// 7. 타입 가드 함수
// ========================================

/**
 * JWT 클레임이 유효한지 확인하는 타입 가드
 * @param claims - 검증할 클레임 객체
 * @returns 유효한 JWT 클레임인지 여부
 */
export function isValidJWTClaims(claims: any): claims is JWTClaims {
  return (
    typeof claims === 'object' &&
    typeof claims.sub === 'string' &&
    (claims.role === 'authenticated' || claims.role === 'anon') &&
    typeof claims.exp === 'number' &&
    typeof claims.iat === 'number'
  );
}

/**
 * 게시물이 발행된 상태인지 확인하는 타입 가드
 * @param post - 확인할 게시물 객체
 * @returns 발행된 게시물인지 여부
 */
export function isPublishedPost(post: Post): boolean {
  return post.status === 'published';
}

/**
 * 사용자가 댓글 작성자인지 확인하는 함수
 * @param comment - 댓글 객체
 * @param userId - 확인할 사용자 ID
 * @returns 댓글 작성자인지 여부
 */
export function isCommentAuthor(comment: Comment, userId: string): boolean {
  return comment.user_id === userId;
}

/**
 * 사용자가 게시물 작성자인지 확인하는 함수
 * @param post - 게시물 객체
 * @param userId - 확인할 사용자 ID
 * @returns 게시물 작성자인지 여부
 */
export function isPostAuthor(post: Post, userId: string): boolean {
  return post.author_id === userId;
} 