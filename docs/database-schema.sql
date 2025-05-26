-- =====================================================
-- 블로그 데이터베이스 스키마 (Clerk 인증 통합)
-- =====================================================
-- 
-- 주요 특징:
-- - Clerk 인증 시스템 사용 (Supabase 자체 인증 미사용)
-- - 사용자 ID는 TEXT 타입 (Clerk ID: "user_xxxxxxxxxx" 형태)
-- - RLS 정책 및 Storage 정책은 별도 파일에서 관리
-- - PostgreSQL UUID 및 기본 함수 활용
--
-- 실행 순서: categories → posts → comments → likes
-- =====================================================

-- UUID 확장 활성화 (Supabase에서는 기본적으로 활성화되어 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CATEGORIES 테이블 (카테고리 관리)
-- =====================================================
-- 블로그 게시물의 카테고리를 관리하는 테이블
-- 예: "기술", "일상", "여행" 등
CREATE TABLE categories (
    -- 기본키: UUID 자동 생성
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 카테고리명 (필수)
    name TEXT NOT NULL,
    
    -- URL용 카테고리명 (SEO 친화적, 유니크)
    -- 예: "기술" → "tech", "일상" → "daily"
    slug TEXT NOT NULL UNIQUE,
    
    -- 카테고리 설명 (선택적)
    description TEXT,
    
    -- 생성일 (자동 설정)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 수정일 (자동 업데이트)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리 검색 성능을 위한 인덱스
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_name ON categories(name);

-- =====================================================
-- 2. POSTS 테이블 (블로그 게시물)
-- =====================================================
-- 블로그의 핵심 게시물 데이터를 저장하는 테이블
CREATE TABLE posts (
    -- 기본키: UUID 자동 생성
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 게시물 제목 (필수)
    title TEXT NOT NULL,
    
    -- 게시물 내용 (필수, 마크다운 형식)
    content TEXT NOT NULL,
    
    -- URL용 제목 (SEO 친화적)
    -- 예: "Next.js 시작하기" → "nextjs-getting-started"
    slug TEXT NOT NULL,
    
    -- 커버 이미지 URL (선택적)
    -- Supabase Storage 또는 외부 이미지 서비스 URL
    cover_image_url TEXT,
    
    -- 작성자 ID (Clerk 사용자 ID)
    -- 형태: "user_2NZLAx8hGk7AJv6N3KVtIF0ieuZ"
    author_id TEXT NOT NULL,
    
    -- 카테고리 참조 (선택적)
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- 게시물 상태 (published, draft, archived)
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    
    -- 조회수 (기본값 0)
    view_count INTEGER DEFAULT 0,
    
    -- 생성일 (자동 설정)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 수정일 (자동 업데이트)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 게시물 검색 및 조회 성능을 위한 인덱스
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- 제목과 내용에 대한 전문 검색 인덱스 (PostgreSQL)
-- 한국어 설정이 없는 경우 기본 'simple' 설정 사용
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('simple', title || ' ' || content));

-- =====================================================
-- 3. COMMENTS 테이블 (댓글)
-- =====================================================
-- 게시물에 대한 사용자 댓글을 저장하는 테이블
CREATE TABLE comments (
    -- 기본키: UUID 자동 생성
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 게시물 참조 (필수)
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    
    -- 댓글 내용 (필수)
    content TEXT NOT NULL,
    
    -- 작성자 ID (Clerk 사용자 ID)
    -- 형태: "user_2NZLAx8hGk7AJv6N3KVtIF0ieuZ"
    author_id TEXT NOT NULL,
    
    -- 부모 댓글 ID (대댓글 기능용, 선택적)
    -- NULL이면 최상위 댓글, 값이 있으면 대댓글
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    
    -- 댓글 상태 (active, deleted, hidden)
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'hidden')),
    
    -- 생성일 (자동 설정)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 댓글 조회 성능을 위한 인덱스
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- =====================================================
-- 4. LIKES 테이블 (좋아요)
-- =====================================================
-- 게시물에 대한 사용자 좋아요를 저장하는 테이블
-- 한 사용자가 같은 게시물에 중복 좋아요 방지
CREATE TABLE likes (
    -- 기본키: UUID 자동 생성
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 게시물 참조 (필수)
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    
    -- 사용자 ID (Clerk 사용자 ID)
    -- 형태: "user_2NZLAx8hGk7AJv6N3KVtIF0ieuZ"
    user_id TEXT NOT NULL,
    
    -- 생성일 (자동 설정)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 중복 좋아요 방지를 위한 복합 유니크 제약조건
    UNIQUE(post_id, user_id)
);

-- 좋아요 조회 성능을 위한 인덱스
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- =====================================================
-- 5. 자동 업데이트 함수 및 트리거 설정
-- =====================================================
-- updated_at 컬럼을 자동으로 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- categories 테이블의 updated_at 자동 업데이트 트리거
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- posts 테이블의 updated_at 자동 업데이트 트리거
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. 기본 데이터 삽입 (선택적)
-- =====================================================
-- 개발 및 테스트를 위한 기본 카테고리 데이터
INSERT INTO categories (name, slug, description) VALUES
    ('기술', 'tech', 'IT 기술 관련 게시물'),
    ('일상', 'daily', '일상 생활 이야기'),
    ('여행', 'travel', '여행 경험 및 정보'),
    ('리뷰', 'review', '제품 및 서비스 리뷰')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 7. 유용한 뷰 (View) 생성
-- =====================================================
-- 게시물과 카테고리 정보를 함께 조회하는 뷰
CREATE VIEW posts_with_category AS
SELECT 
    p.id,
    p.title,
    p.content,
    p.slug,
    p.cover_image_url,
    p.author_id,
    p.status,
    p.view_count,
    p.created_at,
    p.updated_at,
    c.name as category_name,
    c.slug as category_slug
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id;

-- 게시물별 댓글 수를 조회하는 뷰
CREATE VIEW posts_with_stats AS
SELECT 
    p.id,
    p.title,
    p.slug,
    p.author_id,
    p.status,
    p.view_count,
    p.created_at,
    p.updated_at,
    COALESCE(comment_counts.comment_count, 0) as comment_count,
    COALESCE(like_counts.like_count, 0) as like_count
FROM posts p
LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count
    FROM comments 
    WHERE status = 'active'
    GROUP BY post_id
) comment_counts ON p.id = comment_counts.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count
    FROM likes
    GROUP BY post_id
) like_counts ON p.id = like_counts.post_id;

-- =====================================================
-- 스키마 생성 완료
-- =====================================================
-- 
-- 다음 단계:
-- 1. Supabase 대시보드에서 이 SQL 스크립트 실행
-- 2. RLS 정책 설정 (별도 파일)
-- 3. Storage 정책 설정 (별도 파일)
-- 4. Next.js 애플리케이션에서 Supabase 클라이언트 설정
-- 5. Clerk JWT 통합 설정
-- 
-- 주의사항:
-- - 모든 사용자 관련 ID는 TEXT 타입 (Clerk ID 호환)
-- - Supabase 자체 인증 함수 사용 금지
-- - 외래키는 posts, comments, likes 테이블 간에만 설정
-- ===================================================== 