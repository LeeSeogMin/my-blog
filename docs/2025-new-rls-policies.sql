-- ========================================
-- 2025년 새로운 Clerk Third-Party Auth 방식 RLS 정책
-- ========================================

-- 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;
DROP POLICY IF EXISTS "posts_delete_policy" ON posts;

-- ========================================
-- 게시물 테이블 RLS 정책 (2025년 새로운 방식)
-- ========================================

-- 1. 게시물 조회 정책 (모든 발행된 게시물은 공개)
CREATE POLICY "posts_select_policy" ON posts
  FOR SELECT
  TO authenticated, anon
  USING (
    status = 'published' OR 
    (auth.jwt() ->> 'sub') = author_id
  );

-- 2. 게시물 생성 정책 (인증된 사용자만 생성 가능)
CREATE POLICY "posts_insert_policy" ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'sub') = author_id AND
    (auth.jwt() ->> 'role') = 'authenticated'
  );

-- 3. 게시물 수정 정책 (작성자만 수정 가능)
CREATE POLICY "posts_update_policy" ON posts
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = author_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = author_id);

-- 4. 게시물 삭제 정책 (작성자만 삭제 가능)
CREATE POLICY "posts_delete_policy" ON posts
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = author_id);

-- ========================================
-- 카테고리 테이블 RLS 정책
-- ========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON categories;

-- 1. 카테고리 조회 정책 (모든 사용자 조회 가능)
CREATE POLICY "categories_select_policy" ON categories
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- 2. 카테고리 생성 정책 (인증된 사용자만 생성 가능)
CREATE POLICY "categories_insert_policy" ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role') = 'authenticated');

-- ========================================
-- 댓글 테이블 RLS 정책
-- ========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "comments_select_policy" ON comments;
DROP POLICY IF EXISTS "comments_insert_policy" ON comments;
DROP POLICY IF EXISTS "comments_update_policy" ON comments;
DROP POLICY IF EXISTS "comments_delete_policy" ON comments;

-- 1. 댓글 조회 정책 (승인된 댓글만 공개)
CREATE POLICY "comments_select_policy" ON comments
  FOR SELECT
  TO authenticated, anon
  USING (
    status = 'approved' OR 
    (auth.jwt() ->> 'sub') = user_id
  );

-- 2. 댓글 생성 정책 (인증된 사용자만 생성 가능)
CREATE POLICY "comments_insert_policy" ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'sub') = user_id AND
    (auth.jwt() ->> 'role') = 'authenticated'
  );

-- 3. 댓글 수정 정책 (작성자만 수정 가능)
CREATE POLICY "comments_update_policy" ON comments
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

-- 4. 댓글 삭제 정책 (작성자만 삭제 가능)
CREATE POLICY "comments_delete_policy" ON comments
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ========================================
-- 좋아요 테이블 RLS 정책
-- ========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "likes_select_policy" ON likes;
DROP POLICY IF EXISTS "likes_insert_policy" ON likes;
DROP POLICY IF EXISTS "likes_delete_policy" ON likes;

-- 1. 좋아요 조회 정책 (모든 사용자 조회 가능)
CREATE POLICY "likes_select_policy" ON likes
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- 2. 좋아요 생성 정책 (인증된 사용자만 생성 가능)
CREATE POLICY "likes_insert_policy" ON likes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'sub') = user_id AND
    (auth.jwt() ->> 'role') = 'authenticated'
  );

-- 3. 좋아요 삭제 정책 (본인만 삭제 가능)
CREATE POLICY "likes_delete_policy" ON likes
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

-- ========================================
-- RLS 활성화 확인
-- ========================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 정책 적용 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('posts', 'categories', 'comments', 'likes');

-- 생성된 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('posts', 'categories', 'comments', 'likes')
ORDER BY tablename, policyname; 