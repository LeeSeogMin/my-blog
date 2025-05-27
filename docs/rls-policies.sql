-- =====================================================
-- 블로그 RLS (Row Level Security) 정책 설정
-- Clerk JWT 인증 기반 + Storage 정책 포함
-- =====================================================

-- =====================================================
-- 기존 정책 모두 삭제
-- =====================================================
-- Posts 테이블 정책 삭제
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;
DROP POLICY IF EXISTS "posts_delete_policy" ON posts;

-- Comments 테이블 정책 삭제
DROP POLICY IF EXISTS "comments_select_policy" ON comments;
DROP POLICY IF EXISTS "comments_insert_policy" ON comments;
DROP POLICY IF EXISTS "comments_update_policy" ON comments;
DROP POLICY IF EXISTS "comments_delete_policy" ON comments;

-- Likes 테이블 정책 삭제
DROP POLICY IF EXISTS "likes_select_policy" ON likes;
DROP POLICY IF EXISTS "likes_insert_policy" ON likes;
DROP POLICY IF EXISTS "likes_delete_policy" ON likes;

-- Categories 테이블 정책 삭제
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON categories;
DROP POLICY IF EXISTS "categories_update_policy" ON categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON categories;

-- Storage 정책 삭제
DROP POLICY IF EXISTS "storage_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_policy" ON storage.objects;

-- =====================================================
-- RLS 활성화
-- =====================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1. POSTS 테이블 정책
-- =====================================================
-- 누구나 게시물을 읽을 수 있음
CREATE POLICY "posts_select_policy" ON posts
FOR SELECT USING (true);

-- 로그인한 사용자만 게시물 작성 가능
CREATE POLICY "posts_insert_policy" ON posts
FOR INSERT WITH CHECK (auth.jwt() IS NOT NULL);

-- 작성자만 자신의 게시물 수정 가능
CREATE POLICY "posts_update_policy" ON posts
FOR UPDATE USING (auth.jwt() ->> 'sub' = author_id);

-- 작성자만 자신의 게시물 삭제 가능
CREATE POLICY "posts_delete_policy" ON posts
FOR DELETE USING (auth.jwt() ->> 'sub' = author_id);

-- =====================================================
-- 2. COMMENTS 테이블 정책
-- =====================================================
-- 누구나 댓글을 읽을 수 있음
CREATE POLICY "comments_select_policy" ON comments
FOR SELECT USING (true);

-- 로그인한 사용자만 댓글 작성 가능
CREATE POLICY "comments_insert_policy" ON comments
FOR INSERT WITH CHECK (auth.jwt() IS NOT NULL);

-- 작성자만 자신의 댓글 수정 가능
CREATE POLICY "comments_update_policy" ON comments
FOR UPDATE USING (auth.jwt() ->> 'sub' = author_id);

-- 작성자만 자신의 댓글 삭제 가능
CREATE POLICY "comments_delete_policy" ON comments
FOR DELETE USING (auth.jwt() ->> 'sub' = author_id);

-- =====================================================
-- 3. LIKES 테이블 정책
-- =====================================================
-- 누구나 좋아요 목록을 볼 수 있음
CREATE POLICY "likes_select_policy" ON likes
FOR SELECT USING (true);

-- 로그인한 사용자만 좋아요 누를 수 있음
CREATE POLICY "likes_insert_policy" ON likes
FOR INSERT WITH CHECK (auth.jwt() IS NOT NULL);

-- 본인이 누른 좋아요만 취소할 수 있음
CREATE POLICY "likes_delete_policy" ON likes
FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);

-- =====================================================
-- 4. CATEGORIES 테이블 정책
-- =====================================================
-- 누구나 카테고리를 볼 수 있음
CREATE POLICY "categories_select_policy" ON categories
FOR SELECT USING (true);

-- 로그인한 사용자만 카테고리 생성 가능
CREATE POLICY "categories_insert_policy" ON categories
FOR INSERT WITH CHECK (auth.jwt() IS NOT NULL);

-- 로그인한 사용자만 카테고리 수정 가능
CREATE POLICY "categories_update_policy" ON categories
FOR UPDATE USING (auth.jwt() IS NOT NULL);

-- 로그인한 사용자만 카테고리 삭제 가능
CREATE POLICY "categories_delete_policy" ON categories
FOR DELETE USING (auth.jwt() IS NOT NULL);

-- =====================================================
-- 5. STORAGE (blog-images 버킷) 정책
-- =====================================================
-- 누구나 이미지를 볼 수 있음
CREATE POLICY "storage_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');

-- 로그인한 사용자만 이미지 업로드 가능
CREATE POLICY "storage_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'blog-images' AND
    auth.jwt() IS NOT NULL
);

-- 로그인한 사용자만 이미지 수정 가능
CREATE POLICY "storage_update_policy" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'blog-images' AND
    auth.jwt() IS NOT NULL
);

-- 로그인한 사용자만 이미지 삭제 가능
CREATE POLICY "storage_delete_policy" ON storage.objects
FOR DELETE USING (
    bucket_id = 'blog-images' AND
    auth.jwt() IS NOT NULL
);

-- =====================================================
-- ✅ RLS 정책 설정 완료!
-- =====================================================
-- ⚠️ 주의: API에서 Clerk 토큰을 Supabase에 전달해야 작동합니다.
-- =====================================================