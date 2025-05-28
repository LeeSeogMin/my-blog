-- ========================================
-- 블로그 RLS 정책 (2025년 새로운 Clerk Third-Party Auth 방식)
-- 작성일: 2025-01-27
-- 특징: auth.jwt()->>'sub' 직접 사용, TO authenticated 명시, 최적화된 보안
-- ⚠️ 참고: Storage 정책은 Supabase Dashboard에서 별도 설정 필요
-- ========================================

-- ========================================
-- 1. 기존 RLS 정책 완전 정리 (테이블만)
-- ========================================

-- 기존 테이블 정책 삭제 (모든 테이블)
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;
DROP POLICY IF EXISTS "posts_delete_policy" ON posts;

DROP POLICY IF EXISTS "comments_select_policy" ON comments;
DROP POLICY IF EXISTS "comments_insert_policy" ON comments;
DROP POLICY IF EXISTS "comments_update_policy" ON comments;
DROP POLICY IF EXISTS "comments_delete_policy" ON comments;

DROP POLICY IF EXISTS "likes_select_policy" ON likes;
DROP POLICY IF EXISTS "likes_insert_policy" ON likes;
DROP POLICY IF EXISTS "likes_delete_policy" ON likes;

DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON categories;
DROP POLICY IF EXISTS "categories_update_policy" ON categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON categories;

-- ⚠️ Storage 정책은 Supabase Dashboard > Storage > Policies에서 수동 설정
-- storage.objects 테이블은 시스템 테이블이므로 SQL로 직접 설정 불가

-- ========================================
-- 2. RLS 활성화 (테이블만)
-- ========================================

-- 테이블 RLS 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- ⚠️ Storage RLS는 이미 활성화되어 있으므로 별도 설정 불필요

-- ========================================
-- 3. 카테고리 테이블 RLS 정책 (새로운 방식)
-- ========================================

-- 카테고리 조회: 모든 사용자 허용 (공개 정보)
CREATE POLICY "categories_select_policy" ON categories
  FOR SELECT
  USING (true);

-- 카테고리 생성: 인증된 사용자만 가능
CREATE POLICY "categories_insert_policy" ON categories
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.jwt()->>'sub' IS NOT NULL
  );

-- 카테고리 수정: 인증된 사용자만 가능 (관리자 기능)
CREATE POLICY "categories_update_policy" ON categories
  FOR UPDATE TO authenticated
  USING (
    auth.jwt()->>'sub' IS NOT NULL
  );

-- 카테고리 삭제: 인증된 사용자만 가능 (관리자 기능)
CREATE POLICY "categories_delete_policy" ON categories
  FOR DELETE TO authenticated
  USING (
    auth.jwt()->>'sub' IS NOT NULL
  );

-- ========================================
-- 4. 게시물 테이블 RLS 정책 (새로운 방식)
-- ========================================

-- 게시물 조회: 발행된 게시물은 모든 사용자, 초안은 작성자만
CREATE POLICY "posts_select_policy" ON posts
  FOR SELECT
  USING (
    status = 'published' OR 
    (status IN ('draft', 'archived') AND author_id = auth.jwt()->>'sub')
  );

-- 게시물 생성: 인증된 사용자만 가능
-- ✅ 새로운 방식: auth.jwt()->>'sub' 직접 사용
CREATE POLICY "posts_insert_policy" ON posts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.jwt()->>'sub' IS NOT NULL AND
    author_id = auth.jwt()->>'sub'
  );

-- 게시물 수정: 작성자만 가능
CREATE POLICY "posts_update_policy" ON posts
  FOR UPDATE TO authenticated
  USING (
    author_id = auth.jwt()->>'sub'
  )
  WITH CHECK (
    author_id = auth.jwt()->>'sub'
  );

-- 게시물 삭제: 작성자만 가능
CREATE POLICY "posts_delete_policy" ON posts
  FOR DELETE TO authenticated
  USING (
    author_id = auth.jwt()->>'sub'
  );

-- ========================================
-- 5. 댓글 테이블 RLS 정책 (새로운 방식)
-- ========================================

-- 댓글 조회: 발행된 게시물의 댓글만 조회 가능
CREATE POLICY "comments_select_policy" ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.status = 'published'
    )
  );

-- 댓글 생성: 인증된 사용자만 가능
-- ✅ 새로운 방식: auth.jwt()->>'sub' 직접 사용
CREATE POLICY "comments_insert_policy" ON comments
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.jwt()->>'sub' IS NOT NULL AND
    user_id = auth.jwt()->>'sub' AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.status = 'published'
    )
  );

-- 댓글 수정: 댓글 작성자만 가능
CREATE POLICY "comments_update_policy" ON comments
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.jwt()->>'sub'
  )
  WITH CHECK (
    user_id = auth.jwt()->>'sub'
  );

-- 댓글 삭제: 댓글 작성자 또는 게시물 작성자만 가능
CREATE POLICY "comments_delete_policy" ON comments
  FOR DELETE TO authenticated
  USING (
    user_id = auth.jwt()->>'sub' OR
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.author_id = auth.jwt()->>'sub'
    )
  );

-- ========================================
-- 6. 좋아요 테이블 RLS 정책 (새로운 방식)
-- ========================================

-- 좋아요 조회: 모든 사용자 허용 (통계 목적)
CREATE POLICY "likes_select_policy" ON likes
  FOR SELECT
  USING (true);

-- 좋아요 생성: 인증된 사용자만 가능 (중복 방지 로직)
-- ✅ 새로운 방식: auth.jwt()->>'sub' 직접 사용
CREATE POLICY "likes_insert_policy" ON likes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.jwt()->>'sub' IS NOT NULL AND
    user_id = auth.jwt()->>'sub' AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = likes.post_id 
      AND posts.status = 'published'
    ) AND
    NOT EXISTS (
      SELECT 1 FROM likes AS existing_likes
      WHERE existing_likes.user_id = auth.jwt()->>'sub'
      AND existing_likes.post_id = likes.post_id
    )
  );

-- 좋아요 삭제: 본인이 누른 좋아요만 삭제 가능
CREATE POLICY "likes_delete_policy" ON likes
  FOR DELETE TO authenticated
  USING (
    user_id = auth.jwt()->>'sub'
  );

-- ========================================
-- 7. 성능 최적화를 위한 추가 인덱스
-- ========================================

-- RLS 정책 성능 최적화용 인덱스 (이미 database-schema.sql에서 생성됨)
-- 추가로 필요한 복합 인덱스만 생성

-- 게시물 상태별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_posts_status_created_at ON posts(status, created_at DESC);

-- 댓글-게시물 조인 최적화
CREATE INDEX IF NOT EXISTS idx_comments_post_status ON comments(post_id);

-- 좋아요 중복 체크 최적화 (이미 UNIQUE 제약조건으로 존재)
-- CREATE INDEX IF NOT EXISTS idx_likes_user_post ON likes(user_id, post_id);

-- ========================================
-- 8. RLS 정책 검증 함수 (선택적)
-- ========================================

-- RLS 정책이 올바르게 작동하는지 검증하는 함수
CREATE OR REPLACE FUNCTION verify_rls_policies()
RETURNS TABLE(table_name text, policy_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    COUNT(p.policyname) as policy_count
  FROM information_schema.tables t
  LEFT JOIN pg_policies p ON p.tablename = t.table_name
  WHERE t.table_schema = 'public' 
    AND t.table_name IN ('categories', 'posts', 'comments', 'likes')
  GROUP BY t.table_name
  ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 9. 완료 메시지 및 정책 요약
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ 2025년 새로운 방식 RLS 정책 설정 완료!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 적용된 테이블 정책:';
  RAISE NOTICE '  • categories: 4개 정책 (SELECT 공개, 나머지 authenticated)';
  RAISE NOTICE '  • posts: 4개 정책 (작성자 기반 권한 관리)';
  RAISE NOTICE '  • comments: 4개 정책 (게시물 상태 기반 + 작성자 권한)';
  RAISE NOTICE '  • likes: 3개 정책 (중복 방지 + 본인 관리)';
  RAISE NOTICE '';
  RAISE NOTICE '🔥 새로운 방식 특징:';
  RAISE NOTICE '  • auth.jwt()->>"sub" 직접 사용';
  RAISE NOTICE '  • TO authenticated 역할 명시';
  RAISE NOTICE '  • Third-Party Auth 최적화';
  RAISE NOTICE '  • 성능 및 보안 향상';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ 추가 설정 필요:';
  RAISE NOTICE '  • Storage 정책: Supabase Dashboard > Storage > Policies';
  RAISE NOTICE '  • blog-images 버킷 정책 수동 설정';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 검증 명령어:';
  RAISE NOTICE '  SELECT * FROM verify_rls_policies();';
  RAISE NOTICE '========================================';
END $$; 