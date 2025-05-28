# Supabase Storage 정책 설정 가이드

## 개요
`storage.objects` 테이블은 Supabase 시스템 테이블이므로 SQL로 직접 RLS 정책을 설정할 수 없습니다.  
대신 Supabase Dashboard의 Storage 섹션에서 GUI를 통해 정책을 설정해야 합니다.

## blog-images 버킷 Storage 정책 설정

### 1. Supabase Dashboard 접속
- [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
- 해당 프로젝트 선택

### 2. Storage 섹션으로 이동
- 좌측 사이드바에서 **Storage** 클릭
- **Policies** 탭 선택

### 3. 필요한 정책 4개 생성

#### 3.1 SELECT 정책 (이미지 조회)
```
Policy Name: blog-images SELECT policy
Policy Definition: SELECT
Target Roles: public
USING expression: bucket_id = 'blog-images'
```

#### 3.2 INSERT 정책 (이미지 업로드)
```
Policy Name: blog-images INSERT policy  
Policy Definition: INSERT
Target Roles: authenticated
WITH CHECK expression: bucket_id = 'blog-images' AND auth.jwt()->>'sub' IS NOT NULL
```

#### 3.3 UPDATE 정책 (이미지 수정)
```
Policy Name: blog-images UPDATE policy
Policy Definition: UPDATE  
Target Roles: authenticated
USING expression: bucket_id = 'blog-images' AND (storage.foldername(name))[1] = auth.jwt()->>'sub'
WITH CHECK expression: bucket_id = 'blog-images' AND (storage.foldername(name))[1] = auth.jwt()->>'sub'
```

#### 3.4 DELETE 정책 (이미지 삭제)
```
Policy Name: blog-images DELETE policy
Policy Definition: DELETE
Target Roles: authenticated
USING expression: bucket_id = 'blog-images' AND (storage.foldername(name))[1] = auth.jwt()->>'sub'
```

## 설정 순서

### 1단계: 정책 생성 화면 접근
1. Storage > Policies 페이지에서 **"New policy"** 버튼 클릭
2. **"Create a policy"** 선택

### 2단계: 각 정책 설정
위의 4가지 정책을 순서대로 생성합니다.

**공통 설정:**
- **Allowed operation**: 해당 작업 선택 (SELECT, INSERT, UPDATE, DELETE)
- **Target roles**: 위에 명시된 역할 선택
- **Policy definition**: 위의 표현식 입력

### 3단계: 정책 확인
모든 정책 생성 후 Storage > Policies 페이지에서 다음이 표시되는지 확인:
- ✅ blog-images SELECT policy (public)
- ✅ blog-images INSERT policy (authenticated)  
- ✅ blog-images UPDATE policy (authenticated)
- ✅ blog-images DELETE policy (authenticated)

## 2025년 새로운 방식 특징

### auth.jwt()->>'sub' 사용
- **기존 방식**: `auth.uid()` 또는 `auth.role()`
- **새로운 방식**: `auth.jwt()->>'sub'` (Clerk 사용자 ID 직접 접근)
- **장점**: Third-Party Auth와 완벽 호환, 보안 강화

### 폴더 구조 기반 권한
```
(storage.foldername(name))[1] = auth.jwt()->>'sub'
```
- 업로드한 사용자만 자신의 이미지를 수정/삭제 가능
- 폴더명에 사용자 ID가 포함되어 자동 권한 관리

## 테스트 방법

### 1. 이미지 업로드 테스트
- 로그인 후 `/test-upload` 페이지에서 이미지 업로드
- 성공 시 Supabase Storage에 파일 저장 확인

### 2. 권한 테스트  
- 다른 사용자로 로그인하여 타인의 이미지 수정/삭제 시도
- 403 Forbidden 오류 발생 확인

### 3. 공개 조회 테스트
- 로그아웃 상태에서 이미지 URL 직접 접근
- 정상적으로 이미지 표시 확인

## 문제 해결

### Storage 정책이 작동하지 않는 경우
1. **버킷 설정 확인**: blog-images 버킷이 public으로 설정되었는지 확인
2. **정책 표현식 확인**: 위의 정확한 표현식 사용 여부 확인  
3. **역할 확인**: authenticated와 public 역할이 올바르게 설정되었는지 확인
4. **Clerk 토큰 확인**: `/test-supabase` 페이지에서 JWT 토큰 정상 전달 확인

### 일반적인 오류
- **Expression Error**: 표현식 문법 오류 → 위의 정확한 표현식 복사
- **Permission Denied**: 역할 설정 오류 → Target Roles 재확인
- **Bucket Not Found**: 버킷명 오타 → 'blog-images' 정확히 입력

## 완료 확인
모든 Storage 정책 설정 완료 후:
1. ✅ 4개 정책 모두 생성됨
2. ✅ 이미지 업로드 정상 작동  
3. ✅ 권한 기반 접근 제어 작동
4. ✅ 공개 이미지 조회 가능

이제 블로그의 이미지 업로드 기능이 완전히 보안이 적용된 상태로 작동합니다! 