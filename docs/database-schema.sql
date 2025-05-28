-- ========================================
-- 블로그 데이터베이스 스키마 (2025년 새로운 Clerk Third-Party Auth 방식)
-- 작성일: 2025-01-27
-- 특징: auth.jwt()->>'sub' 함수 활용, TEXT 타입 사용자 ID, RLS 정책 호환
-- ========================================

-- 필수 확장 활성화
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 1. 기존 테이블 및 버킷 정리 (의존성 순서 고려)
-- ========================================

-- 기존 테이블 삭제 (의존성 역순)
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 기존 Storage 버킷 정리
DELETE FROM storage.objects WHERE bucket_id = 'blog-images';
DELETE FROM storage.buckets WHERE id = 'blog-images';

-- ========================================
-- 2. Storage 버킷 생성
-- ========================================

-- 블로그 이미지 저장용 공개 버킷 생성
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 3. 테이블 생성 (의존성 순서)
-- ========================================

-- 3.1. 카테고리 테이블
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1', -- 카테고리 색상 (hex 코드)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리 테이블 주석
COMMENT ON TABLE categories IS '블로그 카테고리 관리 테이블';
COMMENT ON COLUMN categories.color IS '카테고리 표시 색상 (hex 코드, 예: #6366f1)';

-- 3.2. 게시물 테이블
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT, -- 게시물 요약
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
    cover_image_url TEXT, -- Supabase Storage URL
    view_count INTEGER DEFAULT 0,
    -- 🔥 새로운 방식: TEXT 타입 사용자 ID (Clerk 호환)
    author_id TEXT NOT NULL DEFAULT (auth.jwt()->>'sub'),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 게시물 테이블 주석
COMMENT ON TABLE posts IS '블로그 게시물 테이블';
COMMENT ON COLUMN posts.author_id IS 'Clerk 사용자 ID (TEXT 타입, auth.jwt()->>"sub" 기본값)';
COMMENT ON COLUMN posts.status IS '게시물 상태: draft(초안), published(발행), archived(보관)';

-- 3.3. 댓글 테이블
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    -- 🔥 새로운 방식: TEXT 타입 사용자 ID (Clerk 호환)
    user_id TEXT NOT NULL DEFAULT (auth.jwt()->>'sub'),
    user_name VARCHAR(100), -- 사용자 표시 이름 (Clerk에서 가져옴)
    user_email VARCHAR(255), -- 사용자 이메일 (선택적)
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 대댓글 지원
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 댓글 테이블 주석
COMMENT ON TABLE comments IS '블로그 댓글 테이블 (대댓글 지원)';
COMMENT ON COLUMN comments.user_id IS 'Clerk 사용자 ID (TEXT 타입, auth.jwt()->>"sub" 기본값)';
COMMENT ON COLUMN comments.parent_id IS '대댓글의 경우 상위 댓글 ID';

-- 3.4. 좋아요 테이블
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 🔥 새로운 방식: TEXT 타입 사용자 ID (Clerk 호환)
    user_id TEXT NOT NULL DEFAULT (auth.jwt()->>'sub'),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- 사용자당 게시물별 하나의 좋아요만 허용
    UNIQUE(user_id, post_id)
);

-- 좋아요 테이블 주석
COMMENT ON TABLE likes IS '블로그 게시물 좋아요 테이블';
COMMENT ON COLUMN likes.user_id IS 'Clerk 사용자 ID (TEXT 타입, auth.jwt()->>"sub" 기본값)';

-- ========================================
-- 4. 인덱스 생성 (성능 최적화)
-- ========================================

-- 게시물 테이블 인덱스
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);

-- 댓글 테이블 인덱스
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- 좋아요 테이블 인덱스
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- 카테고리 테이블 인덱스
CREATE INDEX idx_categories_slug ON categories(slug);

-- ========================================
-- 5. 트리거 함수 생성 (updated_at 자동 업데이트)
-- ========================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. 초기 데이터 삽입
-- ========================================

-- 기본 카테고리 데이터 삽입 (ON CONFLICT로 재실행 안전성 확보)
INSERT INTO categories (name, slug, description, color) VALUES
('일반', 'general', '일반적인 주제의 블로그 글', '#6b7280'),
('기술', 'tech', '프로그래밍 및 개발 관련 글', '#3b82f6'),
('일상', 'daily', '일상적인 이야기와 경험 공유', '#10b981'),
('개발', 'development', '웹 개발 및 소프트웨어 개발 관련', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- 7. 완료 메시지
-- ========================================

-- 스키마 생성 완료 확인
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ 블로그 데이터베이스 스키마 생성 완료!';
    RAISE NOTICE '📊 생성된 테이블: categories, posts, comments, likes';
    RAISE NOTICE '🗄️ Storage 버킷: blog-images (공개)';
    RAISE NOTICE '🔐 Clerk Third-Party Auth 방식 적용';
    RAISE NOTICE '🎯 auth.jwt()->>"sub" 함수 활용 준비 완료';
    RAISE NOTICE '========================================';
END $$; 