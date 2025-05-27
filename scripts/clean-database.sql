-- 데이터베이스 정리 스크립트
-- 잘못된 테스트 데이터나 mock 데이터 제거

-- 1. 현재 게시물 확인
SELECT 
  id, 
  title, 
  slug, 
  author_id, 
  cover_image_url, 
  created_at,
  status
FROM posts 
ORDER BY created_at DESC;

-- 2. 잘못된 게시물 제거 (예: "새 게시물 작성" 가이드나 테스트 데이터)
DELETE FROM posts 
WHERE 
  title LIKE '%새 게시물 작성%' 
  OR title LIKE '%test%'
  OR title LIKE '%Test%'
  OR title LIKE '%가이드%'
  OR content LIKE '%이것은 테스트%'
  OR slug LIKE '%test%';

-- 3. 잘못된 이미지 URL이 있는 게시물의 cover_image_url을 NULL로 설정
UPDATE posts 
SET cover_image_url = NULL 
WHERE 
  cover_image_url IS NOT NULL 
  AND (
    cover_image_url LIKE '%example.com%'
    OR cover_image_url LIKE '%placeholder%'
    OR cover_image_url LIKE '%test%'
    OR cover_image_url LIKE '%localhost%'
    OR cover_image_url = ''
  );

-- 4. 모든 게시물 상태를 'published'로 설정 (필요한 경우)
UPDATE posts 
SET status = 'published' 
WHERE status IS NULL OR status = '';

-- 5. 정리 후 현재 상태 확인
SELECT 
  COUNT(*) as total_posts,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
  COUNT(CASE WHEN cover_image_url IS NOT NULL THEN 1 END) as posts_with_images
FROM posts;

-- 6. 카테고리별 게시물 수 확인
SELECT 
  c.name as category_name,
  COUNT(p.id) as post_count
FROM categories c
LEFT JOIN posts p ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY post_count DESC; 