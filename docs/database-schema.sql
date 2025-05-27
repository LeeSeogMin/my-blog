-- =====================================================
-- 간단한 블로그 데이터베이스 스키마 (Clerk 인증 기반)
-- =====================================================
-- 
-- 📌 기존 테이블 모두 삭제 후 재생성
-- 📌 Storage 버킷 포함
-- 📌 개발 단계용 단순한 구조
-- =====================================================

-- 기존 테이블 삭제 (의존성 순서대로)
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- pgcrypto 확장 활성화
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CATEGORIES 테이블
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_categories_slug ON categories(slug);

-- =====================================================
-- 2. POSTS 테이블
-- =====================================================
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_image_url TEXT,
    author_id TEXT NOT NULL, -- Clerk 사용자 ID
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- =====================================================
-- 3. COMMENTS 테이블
-- =====================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL, -- Clerk 사용자 ID
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);

-- =====================================================
-- 4. LIKES 테이블
-- =====================================================
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Clerk 사용자 ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id) -- 중복 좋아요 방지
);

-- 인덱스
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- =====================================================
-- 5. STORAGE 버킷 생성
-- =====================================================
-- blog-images 버킷 생성 (이미 있으면 public 설정만 업데이트)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- =====================================================
-- 초기 카테고리 데이터
-- =====================================================
INSERT INTO categories (name, slug) VALUES 
('일반', 'general'),
('기술', 'tech'),
('일상', 'daily'),
('개발', 'development')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- ✅ 스키마 및 초기 데이터 생성 완료!
-- =====================================================