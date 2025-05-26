-- =====================================================
-- Clerk 인증 통합 RLS 정책 (Row Level Security)
-- =====================================================
-- 
-- 주요 특징:
-- - Clerk JWT 토큰 기반 인증 시스템
-- - auth.jwt() 함수로 Clerk 사용자 정보 추출
-- - 소유권 기반 권한 제어 (작성자만 수정/삭제)
-- - Storage 파일 업로드 보안 정책 포함
-- - 프로덕션 환경 준비 완료
--
-- 실행 순서: 
-- 1. RLS 활성화 → 2. 테이블 정책 → 3. Storage 정책
-- =====================================================

-- =====================================================
-- 1. RLS (Row Level Security) 활성화
-- =====================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Storage 객체에 RLS 활성화 (이미지 파일 보안)
-- 주의: storage.objects와 storage.buckets는 Supabase에서 자동으로 RLS가 활성화됨
-- 별도로 ENABLE ROW LEVEL SECURITY를 실행할 필요 없음

-- =====================================================
-- 2. CATEGORIES 테이블 RLS 정책
-- =====================================================

-- 모든 사용자가 카테고리 목록을 읽을 수 있음
CREATE POLICY "모든 사용자 카테고리 읽기 가능" ON categories
FOR SELECT USING (true);

-- Clerk 인증된 사용자만 카테고리 생성 가능
CREATE POLICY "Clerk 인증 사용자 카테고리 생성" ON categories
FOR INSERT WITH CHECK (
    -- Clerk JWT 토큰 존재 확인
    auth.jwt() ->> 'sub' IS NOT NULL AND
    -- 인증된 역할 확인
    auth.jwt() ->> 'role' = 'authenticated'
);

-- Clerk 인증된 사용자만 카테고리 수정 가능 (관리자 기능)
CREATE POLICY "Clerk 인증 사용자 카테고리 수정" ON categories
FOR UPDATE USING (
    auth.jwt() ->> 'sub' IS NOT NULL AND
    auth.jwt() ->> 'role' = 'authenticated'
) WITH CHECK (
    auth.jwt() ->> 'sub' IS NOT NULL AND
    auth.jwt() ->> 'role' = 'authenticated'
);

-- Clerk 인증된 사용자만 카테고리 삭제 가능 (관리자 기능)
CREATE POLICY "Clerk 인증 사용자 카테고리 삭제" ON categories
FOR DELETE USING (
    auth.jwt() ->> 'sub' IS NOT NULL AND
    auth.jwt() ->> 'role' = 'authenticated'
);

-- =====================================================
-- 3. POSTS 테이블 RLS 정책
-- =====================================================

-- 모든 사용자가 게시물 목록을 읽을 수 있음 (published 상태만)
CREATE POLICY "모든 사용자 게시물 읽기 가능" ON posts
FOR SELECT USING (
    -- 게시된 상태의 게시물만 공개
    status = 'published' OR
    -- 작성자는 자신의 모든 게시물 조회 가능
    (auth.jwt() ->> 'sub' IS NOT NULL AND auth.jwt() ->> 'sub' = author_id)
);

-- Clerk 인증된 사용자만 게시물 작성 가능
CREATE POLICY "Clerk 인증 사용자 게시물 작성" ON posts
FOR INSERT WITH CHECK (
    -- Clerk JWT 토큰 존재 확인
    auth.jwt() ->> 'sub' IS NOT NULL AND
    -- 인증된 역할 확인
    auth.jwt() ->> 'role' = 'authenticated' AND
    -- 작성자 ID가 현재 사용자와 일치
    auth.jwt() ->> 'sub' = author_id
);

-- 게시물 작성자만 자신의 게시물 수정 가능
CREATE POLICY "게시물 작성자만 수정 가능" ON posts
FOR UPDATE USING (
    -- 현재 사용자가 작성자인지 확인
    auth.jwt() ->> 'sub' = author_id
) WITH CHECK (
    -- 수정 후에도 작성자가 동일한지 확인
    auth.jwt() ->> 'sub' = author_id
);

-- 게시물 작성자만 자신의 게시물 삭제 가능
CREATE POLICY "게시물 작성자만 삭제 가능" ON posts
FOR DELETE USING (
    auth.jwt() ->> 'sub' = author_id
);

-- =====================================================
-- 4. COMMENTS 테이블 RLS 정책
-- =====================================================

-- 모든 사용자가 댓글 목록을 읽을 수 있음 (active 상태만)
CREATE POLICY "모든 사용자 댓글 읽기 가능" ON comments
FOR SELECT USING (
    -- 활성 상태의 댓글만 공개
    status = 'active' OR
    -- 작성자는 자신의 모든 댓글 조회 가능
    (auth.jwt() ->> 'sub' IS NOT NULL AND auth.jwt() ->> 'sub' = author_id)
);

-- Clerk 인증된 사용자만 댓글 작성 가능
CREATE POLICY "Clerk 인증 사용자 댓글 작성" ON comments
FOR INSERT WITH CHECK (
    -- Clerk JWT 토큰 존재 확인
    auth.jwt() ->> 'sub' IS NOT NULL AND
    -- 인증된 역할 확인
    auth.jwt() ->> 'role' = 'authenticated' AND
    -- 작성자 ID가 현재 사용자와 일치
    auth.jwt() ->> 'sub' = author_id AND
    -- 댓글 상태는 기본적으로 active
    status = 'active'
);

-- 댓글 작성자만 자신의 댓글 수정 가능
CREATE POLICY "댓글 작성자만 수정 가능" ON comments
FOR UPDATE USING (
    -- 현재 사용자가 작성자인지 확인
    auth.jwt() ->> 'sub' = author_id
) WITH CHECK (
    -- 수정 후에도 작성자가 동일한지 확인
    auth.jwt() ->> 'sub' = author_id
);

-- 댓글 작성자만 자신의 댓글 삭제 가능
CREATE POLICY "댓글 작성자만 삭제 가능" ON comments
FOR DELETE USING (
    auth.jwt() ->> 'sub' = author_id
);

-- =====================================================
-- 5. LIKES 테이블 RLS 정책
-- =====================================================

-- 모든 사용자가 좋아요 목록을 읽을 수 있음
CREATE POLICY "모든 사용자 좋아요 읽기 가능" ON likes
FOR SELECT USING (true);

-- Clerk 인증된 사용자만 좋아요 추가 가능
CREATE POLICY "Clerk 인증 사용자 좋아요 추가" ON likes
FOR INSERT WITH CHECK (
    -- Clerk JWT 토큰 존재 확인
    auth.jwt() ->> 'sub' IS NOT NULL AND
    -- 인증된 역할 확인
    auth.jwt() ->> 'role' = 'authenticated' AND
    -- 사용자 ID가 현재 사용자와 일치
    auth.jwt() ->> 'sub' = user_id
);

-- 좋아요를 누른 사용자만 자신의 좋아요 삭제 가능
CREATE POLICY "좋아요 사용자만 삭제 가능" ON likes
FOR DELETE USING (
    auth.jwt() ->> 'sub' = user_id
);

-- =====================================================
-- 6. STORAGE 버킷 설정 및 RLS 정책
-- =====================================================

-- blog-images 버킷 생성 (public 접근 가능)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'blog-images',
    'blog-images',
    true,  -- 공개 접근 가능 (이미지 URL 직접 접근)
    5242880,  -- 5MB 파일 크기 제한
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']  -- 허용된 MIME 타입
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. STORAGE 객체 RLS 정책 (blog-images 버킷)
-- =====================================================
-- 
-- 주의: Storage 정책은 Supabase 대시보드의 Storage > Policies에서 설정해야 합니다.
-- SQL Editor에서 직접 생성하면 권한 오류가 발생할 수 있습니다.
-- 
-- 아래는 Supabase 대시보드에서 설정할 정책들의 참고용 코드입니다:

/*
-- 1. 모든 사용자가 blog-images 버킷의 파일을 읽을 수 있음
-- Policy Name: "Public read access for blog images"
-- Operation: SELECT
-- Target roles: public
-- USING expression:
bucket_id = 'blog-images'

-- 2. Clerk 인증된 사용자만 blog-images 버킷에 파일 업로드 가능
-- Policy Name: "Authenticated users can upload blog images"
-- Operation: INSERT
-- Target roles: authenticated
-- WITH CHECK expression:
bucket_id = 'blog-images' AND
auth.jwt() ->> 'sub' IS NOT NULL AND
auth.jwt() ->> 'role' = 'authenticated' AND
auth.jwt() ->> 'sub' = owner AND
(
    storage.extension(name) = 'jpg' OR
    storage.extension(name) = 'jpeg' OR
    storage.extension(name) = 'png' OR
    storage.extension(name) = 'gif' OR
    storage.extension(name) = 'webp'
)

-- 3. 파일을 업로드한 사용자만 자신의 파일 삭제 가능
-- Policy Name: "Users can delete their own files"
-- Operation: DELETE
-- Target roles: authenticated
-- USING expression:
bucket_id = 'blog-images' AND
auth.jwt() ->> 'sub' = owner

-- 4. 파일을 업로드한 사용자만 자신의 파일 수정 가능
-- Policy Name: "Users can update their own files"
-- Operation: UPDATE
-- Target roles: authenticated
-- USING expression:
bucket_id = 'blog-images' AND
auth.jwt() ->> 'sub' = owner
*/

-- =====================================================
-- 8. 대안: 애플리케이션 레벨에서 Storage 보안 처리
-- =====================================================

-- Storage 정책 대신 애플리케이션 코드에서 보안을 처리하는 함수들
-- 이 함수들은 API 라우트에서 사용하여 파일 업로드 권한을 확인할 수 있습니다

-- 사용자가 파일을 업로드할 수 있는지 확인하는 함수
CREATE OR REPLACE FUNCTION can_upload_file(file_name text, file_size bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        -- Clerk 인증 확인
        auth.jwt() ->> 'sub' IS NOT NULL AND
        auth.jwt() ->> 'role' = 'authenticated' AND
        -- 파일 크기 제한 (5MB)
        file_size <= 5242880 AND
        -- 파일 확장자 확인
        (
            file_name ILIKE '%.jpg' OR
            file_name ILIKE '%.jpeg' OR
            file_name ILIKE '%.png' OR
            file_name ILIKE '%.gif' OR
            file_name ILIKE '%.webp'
        );
$$;

-- 사용자가 특정 파일을 삭제할 수 있는지 확인하는 함수
CREATE OR REPLACE FUNCTION can_delete_file(file_owner text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        auth.jwt() ->> 'sub' IS NOT NULL AND
        auth.jwt() ->> 'sub' = file_owner;
$$;

-- =====================================================
-- 9. 유용한 보안 함수 생성
-- =====================================================

-- Clerk 사용자 인증 상태 확인 함수
CREATE OR REPLACE FUNCTION is_clerk_authenticated()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT auth.jwt() ->> 'sub' IS NOT NULL 
           AND auth.jwt() ->> 'role' = 'authenticated';
$$;

-- 현재 Clerk 사용자 ID 가져오기 함수
CREATE OR REPLACE FUNCTION get_clerk_user_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT auth.jwt() ->> 'sub';
$$;

-- 사용자가 특정 게시물의 작성자인지 확인하는 함수
CREATE OR REPLACE FUNCTION is_post_author(post_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM posts 
        WHERE id = post_id 
        AND author_id = auth.jwt() ->> 'sub'
    );
$$;

-- 사용자가 특정 댓글의 작성자인지 확인하는 함수
CREATE OR REPLACE FUNCTION is_comment_author(comment_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM comments 
        WHERE id = comment_id 
        AND author_id = auth.jwt() ->> 'sub'
    );
$$;

-- =====================================================
-- 10. 테스트용 정책 확인 뷰
-- =====================================================

-- 현재 사용자의 인증 상태를 확인하는 뷰
CREATE OR REPLACE VIEW current_user_info AS
SELECT 
    auth.jwt() ->> 'sub' as user_id,
    auth.jwt() ->> 'role' as role,
    auth.jwt() ->> 'email' as email,
    auth.jwt() ->> 'email_verified' as email_verified,
    is_clerk_authenticated() as is_authenticated;

-- 사용자별 콘텐츠 통계 뷰 (본인 콘텐츠만 조회)
CREATE OR REPLACE VIEW user_content_stats AS
SELECT 
    auth.jwt() ->> 'sub' as user_id,
    (SELECT COUNT(*) FROM posts WHERE author_id = auth.jwt() ->> 'sub') as post_count,
    (SELECT COUNT(*) FROM comments WHERE author_id = auth.jwt() ->> 'sub') as comment_count,
    (SELECT COUNT(*) FROM likes WHERE user_id = auth.jwt() ->> 'sub') as like_count;

-- =====================================================
-- RLS 정책 설정 완료
-- =====================================================

-- 정책 적용 확인을 위한 테스트 쿼리 (주석 해제하여 사용)
/*
-- 현재 사용자 정보 확인
SELECT * FROM current_user_info;

-- 사용자 콘텐츠 통계 확인
SELECT * FROM user_content_stats;

-- 게시물 조회 테스트 (인증 상태에 따라 다른 결과)
SELECT id, title, author_id, status FROM posts;

-- 댓글 조회 테스트
SELECT id, content, author_id, status FROM comments;

-- 좋아요 조회 테스트
SELECT id, post_id, user_id FROM likes;
*/

-- =====================================================
-- 주요 보안 특징 요약
-- =====================================================
--
-- 1. Clerk JWT 완전 통합:
--    - auth.jwt() 함수로 Clerk 토큰 정보 추출
--    - 'sub' 클레임에서 사용자 ID 확인
--    - 'role' 클레임에서 인증 상태 확인
--
-- 2. 소유권 기반 권한 제어:
--    - 작성자만 자신의 콘텐츠 수정/삭제 가능
--    - 파일 업로드자만 자신의 파일 관리 가능
--
-- 3. 공개 읽기 정책:
--    - 모든 사용자가 게시물, 댓글, 좋아요 조회 가능
--    - 이미지 파일 공개 접근 가능 (CDN 활용)
--
-- 4. 파일 보안:
--    - 허용된 이미지 형식만 업로드 가능
--    - 5MB 파일 크기 제한
--    - 인증된 사용자만 업로드 가능
--
-- 5. 프로덕션 준비:
--    - 모든 테이블에 RLS 활성화
--    - 보안 함수로 재사용 가능한 로직 제공
--    - 테스트용 뷰로 정책 동작 확인 가능
--
-- 다음 단계:
-- 1. Clerk 대시보드에서 JWT 템플릿 'supabase' 설정
-- 2. Next.js 애플리케이션에서 Clerk 토큰 전달 확인
-- 3. Supabase 대시보드에서 Storage 정책 수동 설정
-- 4. 실제 CRUD 작업으로 정책 동작 테스트
--
-- Storage 정책 설정 방법:
-- 1. Supabase 대시보드 > Storage > Policies 이동
-- 2. "New Policy" 클릭하여 위의 주석에 있는 정책들을 하나씩 생성
-- 3. 또는 애플리케이션 코드에서 can_upload_file, can_delete_file 함수 사용
-- ===================================================== 