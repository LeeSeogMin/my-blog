/**
 * Supabase 데이터베이스 TypeScript 타입 정의
 * 
 * 주요 특징:
 * - Clerk 인증 시스템과 호환 (사용자 ID는 string 타입)
 * - 생성된 데이터베이스 스키마와 완전 일치
 * - Row, Insert, Update 타입 분리로 유연성 확보
 * - 블로그 특화 유틸리티 타입 포함
 */

// =====================================================
// 1. 기본 테이블 타입 정의
// =====================================================

/**
 * Categories 테이블 타입
 * 블로그 게시물의 카테고리 정보
 */
export interface Categories {
  /** 카테고리 고유 ID (UUID) */
  id: string
  /** 카테고리명 */
  name: string
  /** URL용 카테고리명 (SEO 친화적) */
  slug: string
  /** 카테고리 설명 (선택적) */
  description: string | null
  /** 생성일 */
  created_at: string
  /** 수정일 */
  updated_at: string
}

/**
 * Posts 테이블 타입
 * 블로그 게시물 정보
 */
export interface Posts {
  /** 게시물 고유 ID (UUID) */
  id: string
  /** 게시물 제목 */
  title: string
  /** 게시물 내용 (마크다운) */
  content: string
  /** URL용 제목 (SEO 친화적) */
  slug: string
  /** 커버 이미지 URL (선택적) */
  cover_image_url: string | null
  /** 작성자 ID (Clerk 사용자 ID - 문자열) */
  author_id: string
  /** 카테고리 ID (선택적) */
  category_id: string | null
  /** 게시물 상태 */
  status: 'published' | 'draft' | 'archived'
  /** 조회수 */
  view_count: number
  /** 생성일 */
  created_at: string
  /** 수정일 */
  updated_at: string
}

/**
 * Comments 테이블 타입
 * 게시물 댓글 정보
 */
export interface Comments {
  /** 댓글 고유 ID (UUID) */
  id: string
  /** 게시물 ID */
  post_id: string
  /** 댓글 내용 */
  content: string
  /** 작성자 ID (Clerk 사용자 ID - 문자열) */
  author_id: string
  /** 부모 댓글 ID (대댓글용, 선택적) */
  parent_id: string | null
  /** 댓글 상태 */
  status: 'active' | 'deleted' | 'hidden'
  /** 생성일 */
  created_at: string
}

/**
 * Likes 테이블 타입
 * 게시물 좋아요 정보
 */
export interface Likes {
  /** 좋아요 고유 ID (UUID) */
  id: string
  /** 게시물 ID */
  post_id: string
  /** 사용자 ID (Clerk 사용자 ID - 문자열) */
  user_id: string
  /** 생성일 */
  created_at: string
}

// =====================================================
// 2. CRUD 작업을 위한 타입 분리
// =====================================================

/**
 * 데이터베이스 삽입용 타입 (Insert)
 * 자동 생성되는 필드들을 제외한 타입
 */
export type CategoriesInsert = Omit<Categories, 'id' | 'created_at' | 'updated_at'>
export type PostsInsert = Omit<Posts, 'id' | 'created_at' | 'updated_at' | 'view_count'>
export type CommentsInsert = Omit<Comments, 'id' | 'created_at'>
export type LikesInsert = Omit<Likes, 'id' | 'created_at'>

/**
 * 데이터베이스 업데이트용 타입 (Update)
 * 모든 필드가 선택적이며, ID와 생성일은 제외
 */
export type CategoriesUpdate = Partial<Omit<Categories, 'id' | 'created_at'>>
export type PostsUpdate = Partial<Omit<Posts, 'id' | 'created_at'>>
export type CommentsUpdate = Partial<Omit<Comments, 'id' | 'created_at'>>
export type LikesUpdate = Partial<Omit<Likes, 'id' | 'created_at'>>

// =====================================================
// 3. Supabase Database 통합 타입
// =====================================================

/**
 * Supabase 데이터베이스 스키마 타입
 * Supabase 클라이언트에서 사용
 */
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Categories
        Insert: CategoriesInsert
        Update: CategoriesUpdate
      }
      posts: {
        Row: Posts
        Insert: PostsInsert
        Update: PostsUpdate
      }
      comments: {
        Row: Comments
        Insert: CommentsInsert
        Update: CommentsUpdate
      }
      likes: {
        Row: Likes
        Insert: LikesInsert
        Update: LikesUpdate
      }
    }
    Views: {
      posts_with_category: {
        Row: PostWithCategory
      }
      posts_with_stats: {
        Row: PostWithStats
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// =====================================================
// 4. Clerk 인증 관련 타입
// =====================================================

/**
 * Clerk 사용자 기본 정보 타입
 * Clerk에서 제공하는 사용자 정보 구조
 */
export interface ClerkUser {
  /** Clerk 사용자 ID (문자열) */
  id: string
  /** 사용자 이메일 */
  emailAddresses: Array<{
    emailAddress: string
    id: string
  }>
  /** 사용자 이름 */
  firstName: string | null
  /** 사용자 성 */
  lastName: string | null
  /** 프로필 이미지 URL */
  imageUrl: string
  /** 사용자명 */
  username: string | null
  /** 생성일 */
  createdAt: number
  /** 수정일 */
  updatedAt: number
}

/**
 * Clerk JWT 클레임 타입
 * JWT 토큰에 포함되는 사용자 정보
 */
export interface ClerkJWTClaims {
  /** 사용자 ID */
  sub: string
  /** 이메일 */
  email?: string
  /** 이름 */
  given_name?: string
  /** 성 */
  family_name?: string
  /** 프로필 이미지 */
  picture?: string
  /** 발급 시간 */
  iat: number
  /** 만료 시간 */
  exp: number
}

// =====================================================
// 5. 블로그 특화 유틸리티 타입
// =====================================================

/**
 * 카테고리 정보가 포함된 게시물 타입
 * posts_with_category 뷰와 일치
 */
export interface PostWithCategory extends Posts {
  /** 카테고리명 */
  category_name: string | null
  /** 카테고리 slug */
  category_slug: string | null
}

/**
 * 통계 정보가 포함된 게시물 타입
 * posts_with_stats 뷰와 일치
 */
export interface PostWithStats extends Omit<Posts, 'content'> {
  /** 댓글 수 */
  comment_count: number
  /** 좋아요 수 */
  like_count: number
}

/**
 * 작성자 정보가 포함된 댓글 타입
 * 프론트엔드에서 댓글 표시용
 */
export interface CommentWithAuthor extends Comments {
  /** 작성자 이름 */
  author_name: string
  /** 작성자 프로필 이미지 */
  author_image: string
  /** 대댓글 목록 (선택적) */
  replies?: CommentWithAuthor[]
}

/**
 * 게시물 목록 표시용 타입
 * 목록에서 필요한 최소 정보만 포함
 */
export interface PostSummary {
  /** 게시물 ID */
  id: string
  /** 제목 */
  title: string
  /** 요약 (content의 일부) */
  excerpt: string
  /** slug */
  slug: string
  /** 커버 이미지 */
  cover_image_url: string | null
  /** 작성자 ID */
  author_id: string
  /** 카테고리 정보 */
  category_name: string | null
  category_slug: string | null
  /** 통계 */
  comment_count: number
  like_count: number
  view_count: number
  /** 생성일 */
  created_at: string
}

/**
 * 게시물 상세 표시용 타입
 * 상세 페이지에서 필요한 모든 정보 포함
 */
export interface PostDetail extends PostWithCategory {
  /** 댓글 목록 */
  comments: CommentWithAuthor[]
  /** 좋아요 수 */
  like_count: number
  /** 현재 사용자의 좋아요 여부 */
  is_liked: boolean
}

// =====================================================
// 6. API 응답 타입
// =====================================================

/**
 * API 성공 응답 타입
 */
export interface ApiResponse<T = any> {
  /** 성공 여부 */
  success: true
  /** 응답 데이터 */
  data: T
  /** 응답 메시지 (선택적) */
  message?: string
}

/**
 * API 오류 응답 타입
 */
export interface ApiError {
  /** 성공 여부 */
  success: false
  /** 오류 메시지 */
  error: string
  /** 상세 오류 정보 (선택적) */
  details?: any
}

/**
 * 페이지네이션 정보 타입
 */
export interface PaginationInfo {
  /** 현재 페이지 */
  page: number
  /** 페이지당 항목 수 */
  limit: number
  /** 전체 항목 수 */
  total: number
  /** 전체 페이지 수 */
  totalPages: number
  /** 다음 페이지 존재 여부 */
  hasNext: boolean
  /** 이전 페이지 존재 여부 */
  hasPrev: boolean
}

/**
 * 페이지네이션된 응답 타입
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** 페이지네이션 정보 */
  pagination: PaginationInfo
}

// =====================================================
// 7. 폼 및 입력 타입
// =====================================================

/**
 * 게시물 작성/수정 폼 타입
 */
export interface PostFormData {
  /** 제목 */
  title: string
  /** 내용 */
  content: string
  /** 카테고리 ID (선택적) */
  category_id?: string
  /** 커버 이미지 파일 (선택적) */
  cover_image?: File
  /** 상태 */
  status: Posts['status']
}

/**
 * 댓글 작성 폼 타입
 */
export interface CommentFormData {
  /** 댓글 내용 */
  content: string
  /** 부모 댓글 ID (대댓글용, 선택적) */
  parent_id?: string
}

/**
 * 카테고리 작성/수정 폼 타입
 */
export interface CategoryFormData {
  /** 카테고리명 */
  name: string
  /** slug */
  slug: string
  /** 설명 (선택적) */
  description?: string
}

// =====================================================
// 8. 검색 및 필터 타입
// =====================================================

/**
 * 게시물 검색 필터 타입
 */
export interface PostFilters {
  /** 검색 키워드 */
  search?: string
  /** 카테고리 ID */
  category_id?: string
  /** 작성자 ID */
  author_id?: string
  /** 상태 */
  status?: Posts['status']
  /** 정렬 기준 */
  sort_by?: 'created_at' | 'updated_at' | 'view_count' | 'title'
  /** 정렬 순서 */
  sort_order?: 'asc' | 'desc'
  /** 페이지 */
  page?: number
  /** 페이지당 항목 수 */
  limit?: number
}

/**
 * 댓글 검색 필터 타입
 */
export interface CommentFilters {
  /** 게시물 ID */
  post_id?: string
  /** 작성자 ID */
  author_id?: string
  /** 상태 */
  status?: Comments['status']
  /** 정렬 순서 */
  sort_order?: 'asc' | 'desc'
}

// =====================================================
// 타입 정의 완료
// ===================================================== 