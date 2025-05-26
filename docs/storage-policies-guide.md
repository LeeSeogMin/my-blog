# Supabase Storage 정책 설정 가이드

## 📋 개요

Supabase Storage의 RLS 정책은 SQL Editor에서 직접 생성할 수 없으며, Supabase 대시보드의 Storage > Policies 섹션에서 수동으로 설정해야 합니다.

## 🔧 설정 방법

### 1. Supabase 대시보드 접속
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **Storage** 클릭
4. **Policies** 탭 클릭

### 2. blog-images 버킷 정책 생성

#### 정책 1: 공개 읽기 접근
- **Policy Name**: `Public read access for blog images`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **USING expression**:
```sql
bucket_id = 'blog-images'
```

#### 정책 2: 인증된 사용자 업로드
- **Policy Name**: `Authenticated users can upload blog images`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **WITH CHECK expression**:
```sql
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
```

#### 정책 3: 파일 소유자만 삭제
- **Policy Name**: `Users can delete their own files`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id = 'blog-images' AND
auth.jwt() ->> 'sub' = owner
```

#### 정책 4: 파일 소유자만 수정
- **Policy Name**: `Users can update their own files`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id = 'blog-images' AND
auth.jwt() ->> 'sub' = owner
```

## 🔄 대안: 애플리케이션 레벨 보안

Storage 정책 설정이 복잡한 경우, 애플리케이션 코드에서 보안을 처리할 수 있습니다:

### 보안 함수 사용
`docs/rls-policies.sql`에 포함된 함수들을 API 라우트에서 활용:

```typescript
// API 라우트에서 파일 업로드 권한 확인
const { data: canUpload } = await supabaseClient
  .rpc('can_upload_file', {
    file_name: fileName,
    file_size: fileSize
  })

if (!canUpload) {
  return Response.json({ error: '파일 업로드 권한이 없습니다' }, { status: 403 })
}
```

### 클라이언트 사이드 검증
```typescript
// 파일 업로드 전 클라이언트에서 검증
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const maxSize = 5 * 1024 * 1024 // 5MB

if (!allowedTypes.includes(file.type)) {
  throw new Error('지원하지 않는 파일 형식입니다')
}

if (file.size > maxSize) {
  throw new Error('파일 크기가 너무 큽니다 (최대 5MB)')
}
```

## ✅ 설정 확인

Storage 정책이 올바르게 설정되었는지 확인하려면:

1. `/test-supabase` 페이지에서 "Storage 버킷" 테스트 실행
2. 테스트가 성공하면 정책이 올바르게 설정된 것입니다
3. 실제 파일 업로드/삭제 기능으로 추가 테스트

## 🚨 주의사항

1. **JWT 템플릿 필수**: Clerk JWT 템플릿 'supabase'가 설정되어야 `auth.jwt()` 함수가 작동합니다
2. **owner 필드**: 파일 업로드 시 `owner` 필드에 Clerk 사용자 ID가 자동으로 저장됩니다
3. **public 버킷**: blog-images 버킷은 `public = true`로 설정되어 이미지 URL에 직접 접근 가능합니다

## 📝 참고 링크

- [Supabase Storage RLS 문서](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Storage 정책 가이드](https://supabase.com/docs/guides/storage/security/policies)
- [Clerk JWT 템플릿 설정](https://clerk.com/docs/integrations/databases/supabase) 