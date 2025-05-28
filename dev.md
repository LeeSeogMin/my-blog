### **2. 5. Clerk에서 Supabase 통합 설정**

Clerk의 인증 정보를 Supabase RLS(Row Level Security)에서 사용하려면 JWT 토큰을 통해 두 시스템을 연결해야 한다. 이 설정이 없으면 Supabase는 Clerk의 사용자 정보를 인식하지 못해 RLS 정책이 작동하지 않는다.

### 1. Clerk Dashboard 접속

- [https://dashboard.clerk.com](https://dashboard.clerk.com/)에 로그인한다.
- 블로그 프로젝트(예: `my-blog`)를 선택한다.

### 2. Integrations 메뉴 이동

- 좌측 사이드바에서 **Integrations**를 클릭한다.
- **Supabase** 통합을 검색하고 활성화한다.
- **Manage Integration**으로 이동한다.

### 3. Development와 Production 인스턴스 설정

- **Select instance**에서 **Development**와 **Production** 인스턴스를 각각 설정한다:
    - **Development 환경** (테스트용):
        - Development 인스턴스를 선택한다.
        - 통합 활성화 후 Clerk 도메인을 복사한다 (예: `https://grand-lion-58.clerk.accounts.dev`).
    - **Production 환경** (실제 배포용):
        - Production 인스턴스를 선택한다.
        - 통합 활성화 후 Clerk 도메인을 복사한다 (예: `https://<your-prod-app-id>.clerk.accounts.dev`).

---

### Supabase에서 JWT 설정

### 1. Supabase Dashboard 접속

- https://supabase.com/dashboard에 로그인한다.

### 2. Authentication 섹션에서 Clerk 설정

- 각 프로젝트에서 설정한다:
    - **Development 프로젝트** (예: `my-blog-database`):
        1. 좌측 사이드바에서 **Authentication** 메뉴로 이동한다.
        2. **Sign In / Providers** 탭으로 이동한다.
        3. **Third-Party Auth** 섹션에서 **Add a provider**를 클릭하고 **Clerk**를 선택한다.
        4. **Clerk Domain** 입력란에 Development용 Clerk 도메인(예: `https://grand-lion-58.clerk.accounts.dev`)을 입력한다.
        5. **Save** 버튼을 클릭한다.
    - **Production 프로젝트**:
        1. 동일한 절차를 반복하되, Production용 Clerk 도메인(예: `https://<your-prod-app-id>.clerk.accounts.dev`)을 입력한다.
        2. **Save** 버튼을 클릭한다.

### 2.6. 환경변수 설정 및 Third-Party Auth 검증

**프롬프트:**

```jsx
Next.js 환경변수 확인 및 Clerk Third-Party Auth 통합 테스트 페이지를 생성해 주세요.

**현재 상황:**
- **2025년 새로운 Clerk Third-Party Auth 방식 사용**
- **JWT Template 방식 deprecated (2025.04.01부터)**
- Supabase Third-Party Auth에 Clerk 등록 완료

**구현 대상:**
- 파일 경로: `app/test-supabase/page.tsx`
- 파일 역할: 새로운 Third-Party Auth 통합 테스트

**주요 요구사항:**
1. 환경변수 상태 표시 (기존과 동일)

2. **새로운 Third-Party Auth 테스트**
   - Clerk 세션 토큰 확인
   - **auth.jwt()->>'sub' 함수 테스트**
   - 세션의 role 클레임 확인 ('authenticated' 값)

3. **Supabase 클라이언트 연결 테스트**
   - 새로운 accessToken 방식 사용
   - RLS 정책 동작 확인

**기술적 요구사항:**
- **@clerk/nextjs의 useSession 훅 사용**
- **새로운 클라이언트 설정 방식 적용**
- 구 방식(getToken) 대신 세션 기반 접근

**완료 기준:**
- Third-Party Auth 통합 상태 확인 가능
- 새로운 방식의 JWT 클레임 검증
- RLS 정책 정상 작동 확인
```

## 3. 데이터베이스 테이블 설계 및 생성

### 3.1. 블로그 데이터베이스 스키마 설계

블로그에 필요한 주요 테이블을 설계해보자.

AI에게 간단한 데이터베이스 스키마 설계를 요청한다:

**프롬프트:**

```
간단한 블로그 데이터베이스 스키마와 Storage 버킷을 설계해 주세요.

**현재 상황:**
- Supabase PostgreSQL 사용
- **2025년 새로운 Clerk Third-Party Auth 방식 사용**
- **auth.jwt()->>'sub' 함수 활용 가능**
- 이미지 업로드 기능 필요
- 개발 단계이므로 최대한 단순하게 구현

**구현 대상:**
- 파일 경로: `docs/database-schema.sql`
- 파일 역할: 블로그 테이블 및 Storage 버킷 생성 SQL

**주요 요구사항:**
1. 기존 테이블 및 버킷 삭제
   - DROP TABLE IF EXISTS (의존성 순서 고려)
   - Storage 버킷도 재생성

2. 필요한 테이블 (4개)
   - categories: 카테고리 관리
   - posts: 블로그 게시물 (author_id는 TEXT 타입, Clerk 사용자 ID)
   - comments: 댓글 (user_id는 TEXT 타입, Clerk 사용자 ID)
   - likes: 좋아요 (user_id는 TEXT 타입, Clerk 사용자 ID)

3. **새로운 방식 적용**
   - **user_id 컬럼 기본값: auth.jwt()->>'sub'**
   - **UUID 대신 TEXT 타입 사용 (Clerk 사용자 ID)**
   - **RLS 정책 호환성 고려**

4. Storage 버킷 생성
   - 버킷명: blog-images
   - 공개 설정: true (누구나 이미지 볼 수 있음)
   - SQL: INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true)

5. 초기 데이터
   - 카테고리 4개 (일반, 기술, 일상, 개발)
   - ON CONFLICT 처리로 재실행 안전성 확보

**기술적 요구사항:**
- pgcrypto 확장 활성화
- **auth.jwt() 함수는 Supabase 내장 함수이므로 별도 생성 불필요**
- 한글 주석으로 각 섹션 설명
- Storage 버킷 생성 포함
- 여러 번 실행해도 오류 없음

**완료 기준:**
- 테이블 4개 + Storage 버킷 1개 생성
- **Clerk 사용자 ID 호환 데이터 타입 사용**
- 초기 카테고리 데이터 포함
- Supabase에서 바로 실행 가능

요청사항만 실행한다.
```

### 3.2. Supabase에서 테이블 생성

AI가 제공한 SQL을 사용하여 Supabase에서 테이블을 생성한다.

1. Supabase 대시보드 → SQL Editor 이동
2. AI가 제공한 CREATE TABLE 문 복사(database-schema.sql)후 붙여넣기
3. 쿼리 실행

테이블 생성 후 Table Editor에서 다음을 확인한다:

- 테이블이 올바르게 생성되었는지
- **사용자 ID 컬럼이 TEXT 타입으로 설정되었는지**
- 기본값이 설정되었는지 (created_at, user_id 등)

### 3.3. Supabase TypeScript 타입 생성

AI에게 TypeScript 타입 생성을 요청한다:

**프롬프트:**

```
Supabase 데이터베이스의 TypeScript 타입을 정의해 주세요.

**현재 상황:**
- 데이터베이스 테이블 생성 완료 (posts, comments, likes, categories)
- **2025년 새로운 Clerk Third-Party Auth 방식 사용**
- **Clerk 사용자 ID는 문자열 형태 (UUID 아님)**
- **auth.jwt()->>'sub' 활용 가능**
- TypeScript 타입 안전성 확보 필요

**구현 대상:**
- 파일 경로: `types/database.types.ts`
- 파일 역할: Supabase 스키마 기반 TypeScript 타입 정의

**주요 요구사항:**
1. 테이블별 타입 인터페이스
   - Posts, Comments, Likes, Categories 인터페이스
   - 각 컬럼의 정확한 타입 지정
   - **author_id, user_id는 string 타입** (Clerk 사용자 ID)
   - null 허용 컬럼 처리

2. Database 통합 타입
   - Supabase 클라이언트에서 사용할 Database 타입
   - 테이블별 Row, Insert, Update 타입 분리
   - 관계형 데이터 조회를 위한 확장 타입

3. 유틸리티 타입
   - 자주 사용될 조합 타입
   - 블로그 특화 타입 (PostWithCategory 등)
   - **Clerk 사용자 정보 타입** (ClerkUser 인터페이스)

**Clerk 통합 타입 요구사항:**
- **사용자 ID 타입**: string (Clerk 고유 ID 형식)
- **Clerk 사용자 타입**: 기본 사용자 정보 인터페이스 포함
- **JWT 클레임 타입**: 새로운 Third-Party Auth 토큰 구조 반영

**Third-Party Auth 고려사항:**
- **role 클레임**: 'authenticated' | 'anon'
- **sub 클레임**: Clerk 사용자 ID (string)
- **세션 기반 타입**: useSession 훅 호환성

**기술적 요구사항:**
- 생성된 데이터베이스 스키마와 완전 일치
- Supabase JavaScript 클라이언트와 호환
- **새로운 Third-Party Auth 방식과 호환성 확보**
- JSDoc 주석으로 각 타입 설명

**완료 기준:**
- 모든 테이블의 타입이 정확히 정의됨
- **Clerk 사용자 ID 타입이 올바르게 string으로 정의됨**
- **Third-Party Auth 세션 타입 포함**
- lib/supabase.ts에서 바로 활용 가능
- TypeScript 컴파일 오류 없음

요청사항만 실행한다.
```

### 3.4. Supabase 클라이언트 설정 (최신 Third-Party Auth 방식)

AI에게 2025년 새로운 방식의 Supabase 클라이언트 구현을 요청한다:

**프롬프트:**

```
2025년 새로운 Clerk Third-Party Auth 방식을 사용한 Supabase 클라이언트를 구현해 주세요.

**중요 변경사항:**
- **JWT Template 방식 완전 deprecated (2025.04.01부터)**
- **Third-Party Auth 방식으로 전면 변경**
- **JWT Secret 공유 불필요** (보안 대폭 개선)
- **새로운 accessToken 설정 방식 필수**
- **세션 기반 자동 토큰 관리**

**현재 상황:**
- 2.5에서 Third-Party Auth 설정 완료
- Clerk 세션에 'role': 'authenticated' 클레임 추가 완료
- 데이터베이스 테이블 및 타입 정의 완료
- **auth.jwt()->>'sub' 직접 사용 가능**

**구현 대상:**
- 파일 경로: `lib/supabase.ts`
- 파일 역할: 최신 방식 Supabase 클라이언트 인스턴스

**주요 요구사항:**
1. **새로운 클라이언트 설정 방식**
   // ✅ 2025년 권장 방식
   const supabaseClient = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
     {
       accessToken: async () => session?.getToken() ?? null,
     }
   );

   // ❌ 구 방식 (완전 deprecated)
   // const token = await getToken({ template: 'supabase' });
   // supabase.auth.setAuth(token);

2. **클라이언트/서버 인스턴스 분리**
   - **클라이언트용**: useSession 기반 자동 토큰 관리
   - **서버용**: auth() 함수를 통한 서버 사이드 인증
   - **관리자용**: Service Role Key 사용 (필요시)
   - Database 타입 정의 연동

3. **타입 안전성 및 호환성**
   - 환경 변수 타입 체크
   - **새로운 Third-Party Auth 타입 정의**
   - 기존 코드와의 호환성 유지
   - 에러 처리 개선

4. **실사용 예시 포함**
   - 컴포넌트에서 사용법
   - API 라우트에서 사용법
   - RLS 정책과의 연동 방법

**기술적 요구사항:**
- **@clerk/nextjs의 useSession 훅 필수 활용**
- **auth() 함수 서버 사이드 활용**
- **Database 타입 완전 연동**
- 환경 변수 존재 여부 확인
- **새 방식과 구 방식 차이점 주석으로 명확히 설명**

**사용 예시 포함:**
// 클라이언트 컴포넌트에서 사용
const supabase = useSupabaseClient(); // 세션 기반 자동 인증
const { data } = await supabase.from('posts').select('*'); // RLS 자동 적용

// API 라우트에서 사용
const serverClient = createServerSupabaseClient(); // auth() 함수 기반

**완료 기준:**
- **새로운 Third-Party Auth 방식 완전 적용**
- **구 방식 코드 완전 제거**
- 클라이언트/서버 양쪽에서 사용 가능
- **RLS 정책에서 auth.jwt()->>'sub' 정상 인식**
- TypeScript 컴파일 오류 없음
- **기존 컴포넌트 호환성 유지**

요청사항만 실행한다.
```

### 3.5. 블로그 특화 RLS 정책 (최신 Third-Party Auth 적용)

2025년 새로운 방식에 맞는 효율적인 RLS 정책을 설정한다:

**프롬프트:**

```
2025년 새로운 Clerk Third-Party Auth 방식에 최적화된 RLS 정책을 설정해 주세요.

**변경사항:**
- **auth.jwt()->>'sub' 직접 사용 권장**
- **TO authenticated 역할 명시 필수**
- **requesting_user_id() 함수는 선택사항**
- **role 클레임 'authenticated' 확인 가능**

**현재 상황:**
- Third-Party Auth 설정 완료
- Clerk 세션에 role: 'authenticated' 클레임 포함
- 블로그 테이블 생성 완료 (posts, comments, likes, categories)
- blog-images Storage 버킷 생성 완료

**구현 대상:**
- 파일 경로: `docs/modern-rls-policies.sql`
- 파일 역할: 최신 방식 RLS 정책

**주요 요구사항:**
1. **최신 RLS 패턴 적용**
   -- ✅ 권장 방식: auth.jwt() 직접 사용
   CREATE POLICY "posts_select_policy" ON posts
     FOR SELECT TO authenticated USING (true);

   CREATE POLICY "posts_insert_policy" ON posts
     FOR INSERT TO authenticated WITH CHECK (
       auth.jwt()->>'sub' IS NOT NULL
     );

   CREATE POLICY "posts_update_policy" ON posts
     FOR UPDATE TO authenticated USING (
       author_id = auth.jwt()->>'sub'
     );

2. **블로그 테이블 정책**
   - **posts**: 새로운 패턴 적용, 작성자만 수정/삭제 가능
   - **comments**: auth.jwt()->>'sub' 사용, 작성자만 수정/삭제 가능
   - **likes**: 중복 방지 로직 포함, 본인만 삭제 가능
   - **categories**: 기본 authenticated 정책, 로그인 사용자만 관리

3. **Storage 정책 (blog-images 버킷)**
   - SELECT: 모든 사용자 허용 (공개 이미지)
   - INSERT: 로그인 사용자만 업로드
   - UPDATE/DELETE: 업로드한 본인만 가능

4. **정책 이름 규칙**
   - 테이블: "[테이블명]_[동작]_policy"
   - Storage: "storage_[동작]_policy"

**기술적 요구사항:**
- **기존 정책 완전 삭제** (DROP POLICY IF EXISTS)
- **RLS 활성화** (ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
- **Storage 객체에 대한 RLS도 활성화**
- **TO authenticated 역할 명시적 사용**
- **auth.jwt()->>'sub' 직접 활용**
- 한글 주석으로 각 정책 설명

**호환성 참고:**
-- 🟡 기존 방식 (여전히 작동하지만 권장하지 않음)
-- requesting_user_id() = user_id

-- ✅ 새 방식 (권장)
-- auth.jwt()->>'sub' = user_id

**완료 기준:**
- **4개 테이블 + Storage 객체 RLS 정책 모두 포함**
- **모든 정책이 최신 Third-Party Auth 방식으로 작성됨**
- **성능 및 보안 최적화된 정책**
- **이미지 업로드/조회가 정상 작동하는 정책**
- **JWT 토큰 전달 시 모든 RLS 정책 정상 작동**

요청사항만 실행한다.
```

AI가 제공한 최신 방식 RLS 정책을 Supabase에서 실행한다:

1. **Supabase 대시보드 접속:** 해당 프로젝트 선택
2. **SQL Editor 이동:** 좌측 사이드바에서 **"SQL Editor"** 클릭
3. **SQL 쿼리 실행:**
    - AI가 docs/modern-rls-policies.sql 파일에 제공한 RLS 정책 SQL을 복사하여 붙여넣기
    - **"Run"** 버튼을 클릭하여 쿼리 실행

**RLS 정책 적용 확인:**

- **Authentication > Policies**에서 각 테이블의 RLS 정책이 올바르게 추가되었는지 확인
- **Storage > Policies**에서 blog-images 버킷의 RLS 정책 확인
- **2.6의 테스트 페이지에서 Third-Party Auth 및 RLS 정책 동작 확인**

## 4. 이미지 업로드 기능 구현

### 4.1. Supabase Storage 설정

데이터베이스 설정이 완료되었으니, 이제 이미지 파일을 저장할 Storage를 설정해보자.

```
Supabase Storage 버킷 생성 가이드

Supabase 대시보드에서 Storage 섹션으로 이동:
먼저 Supabase 대시보드에 로그인합니다.
좌측 사이드바 메뉴에서 Storage 아이콘 (구름과 버킷 모양)을 클릭합니다.

새 버킷(Bucket) 생성 과정:
Storage 페이지로 이동하면 화면 상단에 "New bucket" (새 버킷) 버튼이 보일 것입니다. 이 버튼을 클릭합니다.
새 버킷을 생성하기 위한 팝업 창 또는 설정 페이지가 나타납니다.

버킷(폴더) 설정 옵션 입력:
나타난 설정 화면에서 다음과 같은 정보를 입력합니다.
버킷 이름 (Name): blog-images

Public bucket (공개 버킷):
체크 여부: 체크 (✓)

"save" 클릭:

이제 blog-images라는 이름의 공개 버킷이 Supabase Storage에 생성되었습니다. 파일 형식 제한은 별도의 RLS 정책(SQL 쿼리)을 통해 앞에서 수행되었습니다.
```

### 4.2. 이미지 업로드 유틸리티 함수 작성

AI에게 이미지 업로드를 위한 헬퍼 함수 작성을 요청한다:

**프롬프트:**

```
Supabase Storage를 사용하여 이미지를 업로드하는 TypeScript 함수를 구현해 주세요.

**현재 상황:**
- Supabase Storage에 'blog-images' 공개 버킷 생성 완료
- TypeScript 기반 프로젝트에서 타입 안전성 확보 필요

**구현 대상:**
- 파일 경로: `lib/upload-image.ts`
- 파일 역할: 이미지 업로드 및 URL 반환 유틸리티

**주요 요구사항:**
1. 이미지 업로드 기능
   - 파일 형식 검증 (jpg, png, gif, webp만 허용)
   - 고유한 파일명 생성 (현재시간 + 랜덤문자)
   - Supabase Storage에 업로드
   - 업로드된 파일의 공개 URL 반환
   - 파일크기는 제한하지 않는다. 

2. TypeScript 타입 정의
   - 함수 매개변수 및 반환값 타입 정의
   - 에러 타입 정의
   - File 객체 타입 활용

3. 에러 처리
   - 파일 형식 오류
   - 업로드 실패 처리
   - 네트워크 오류 처리

**기술적 요구사항:**
- lib/supabase.ts에서 생성한 클라이언트 사용
- uuid 패키지 활용 (필요시 설치)
- 각 단계별로 한글 주석 추가
- 기본적인 성공/실패 처리만 구현

**완료 기준:**
- uploadImage(file) → { success: boolean, url?: string, error?: string } 형태
- TypeScript 컴파일 오류 없음
- 실제 이미지 업로드 테스트 가능

요청사항만 실행한다. 
```

### 4.3. 이미지 업로드 컴포넌트 구현

AI에게 이미지 업로드 UI 컴포넌트 작성을 요청한다:

**프롬프트:**

```
블로그 게시물의 커버 이미지를 업로드할 수 있는 React 컴포넌트를 구현해 주세요.

**현재 상황:**
- lib/upload-image.ts 유틸리티 함수 구현 완료
- TypeScript 기반 React 컴포넌트 필요

**구임 대상:**
- 파일 경로: `components/image-upload.tsx`
- 파일 역할: 이미지 선택, 미리보기, 업로드 UI 제공

**주요 요구사항:**
1. 기본 UI 구성
   - 파일 선택 버튼 (복잡한 드래그앤드롭 제외)
   - 선택한 이미지 미리보기
   - 업로드 버튼과 진행 상태 표시
   - 업로드 완료 시 URL을 부모 컴포넌트로 전달

2. Props 인터페이스
   - onImageUploaded: (url: string) => void - 업로드 완료 콜백
   - initialImage?: string - 초기 이미지 URL (수정 시 사용)
   - className?: string - 추가 스타일링

3. 상태 관리
   - 선택된 파일 상태
   - 미리보기 이미지 URL
   - 업로드 진행 상태 (로딩, 성공, 실패)
   - 에러 메시지

**기술적 요구사항:**
- 'use client' 컴포넌트로 구현
- TypeScript Props 인터페이스 정의
- TailwindCSS와 Lucide React 아이콘 사용
- useState와 기본 이벤트 핸들러 사용
- 모바일 친화적 디자인

**완료 기준:**
- 이미지 선택 및 미리보기 정상 동작
- 업로드 진행 상태 표시
- 업로드 완료 시 콜백 함수 호출
- 에러 상황에 대한 적절한 사용자 피드백

요청사항만 실행한다. 
```

## 4. 이미지 업로드 기능 구현

### 4.1. Supabase Storage 설정

데이터베이스 설정이 완료되었으니, 이제 이미지 파일을 저장할 Storage를 설정해보자.

**Supabase Storage 버킷 생성 가이드**

**Supabase 대시보드에서 Storage 섹션으로 이동:**
먼저 Supabase 대시보드에 로그인합니다.
좌측 사이드바 메뉴에서 **Storage** 아이콘 (구름과 버킷 모양)을 클릭합니다.

**새 버킷(Bucket) 생성 과정:**
Storage 페이지로 이동하면 화면 상단에 "New bucket" (새 버킷) 버튼이 보일 것입니다. 이 버튼을 클릭합니다.
새 버킷을 생성하기 위한 팝업 창 또는 설정 페이지가 나타납니다.

**버킷(폴더) 설정 옵션 입력:**
나타난 설정 화면에서 다음과 같은 정보를 입력합니다.

- 버킷 이름 (Name): `blog-images`
- Public bucket (공개 버킷):
    - 체크 여부: 체크 (✓)
- "save" 클릭:

이제 blog-images라는 이름의 공개 버킷이 Supabase Storage에 생성되었습니다.
파일 형식 제한은 별도의 RLS 정책(SQL 쿼리)을 통해 앞에서 수행되었습니다.

### 4.2. 이미지 업로드 유틸리티 함수 작성

AI에게 이미지 업로드를 위한 헬퍼 함수 작성을 요청한다:

**프롬프트:**

```
Supabase Storage를 사용하여 이미지를 업로드하는 TypeScript 함수를 구현해 주세요.

**현재 상황:**
- Supabase Storage에 'blog-images' 공개 버킷 생성 완료
- TypeScript 기반 프로젝트에서 타입 안전성 확보 필요
- **2025년 새로운 Third-Party Auth 방식 사용**

**구현 대상:**
- 파일 경로: `lib/upload-image.ts`
- 파일 역할: 이미지 업로드 및 URL 반환 유틸리티

**주요 요구사항:**
1. 이미지 업로드 기능
   - 파일 형식 검증 (jpg, png, gif, webp만 허용)
   - 고유한 파일명 생성 (현재시간 + 랜덤문자)
   - Supabase Storage에 업로드
   - 업로드된 파일의 공개 URL 반환
   - 파일크기는 제한하지 않는다.

2. TypeScript 타입 정의
   - 함수 매개변수 및 반환값 타입 정의
   - 에러 타입 정의
   - File 객체 타입 활용

3. 에러 처리
   - 파일 형식 오류
   - 업로드 실패 처리
   - 네트워크 오류 처리

**기술적 요구사항:**
- lib/supabase.ts에서 생성한 클라이언트 사용
- **새로운 Third-Party Auth 방식의 클라이언트 활용**
- uuid 패키지 활용 (필요시 설치)
- 각 단계별로 한글 주석 추가
- 기본적인 성공/실패 처리만 구현

**완료 기준:**
- uploadImage(file) → { success: boolean, url?: string, error?: string } 형태
- TypeScript 컴파일 오류 없음
- 실제 이미지 업로드 테스트 가능

요청사항만 실행한다.
```

### 4.3. 이미지 업로드 컴포넌트 구현

AI에게 이미지 업로드 UI 컴포넌트 작성을 요청한다:

**프롬프트:**

```
블로그 게시물의 커버 이미지를 업로드할 수 있는 React 컴포넌트를 구현해 주세요.

**현재 상황:**
- lib/upload-image.ts 유틸리티 함수 구현 완료
- TypeScript 기반 React 컴포넌트 필요

**구현 대상:**
- 파일 경로: `components/image-upload.tsx`
- 파일 역할: 이미지 선택, 미리보기, 업로드 UI 제공

**주요 요구사항:**
1. 기본 UI 구성
   - 파일 선택 버튼 (복잡한 드래그앤드롭 제외)
   - 선택한 이미지 미리보기
   - 업로드 버튼과 진행 상태 표시
   - 업로드 완료 시 URL을 부모 컴포넌트로 전달

2. Props 인터페이스
   - onImageUploaded: (url: string) => void - 업로드 완료 콜백
   - initialImage?: string - 초기 이미지 URL (수정 시 사용)
   - className?: string - 추가 스타일링

3. 상태 관리
   - 선택된 파일 상태
   - 미리보기 이미지 URL
   - 업로드 진행 상태 (로딩, 성공, 실패)
   - 에러 메시지

**기술적 요구사항:**
- 'use client' 컴포넌트로 구현
- TypeScript Props 인터페이스 정의
- TailwindCSS와 Lucide React 아이콘 사용
- useState와 기본 이벤트 핸들러 사용
- 모바일 친화적 디자인

**완료 기준:**
- 이미지 선택 및 미리보기 정상 동작
- 업로드 진행 상태 표시
- 업로드 완료 시 콜백 함수 호출
- 에러 상황에 대한 적절한 사용자 피드백

요청사항만 실행한다.

```

### 4.4. 게시물 작성 폼에 이미지 업로드 통합

기존의 게시물 작성 폼에 이미지 업로드 기능을 통합해보자.

AI에게 게시물 작성 폼 업데이트를 요청한다:

**프롬프트:**

```
게시물 작성 폼에 커버 이미지 업로드 기능을 통합해 주세요.

**현재 상황:**
- ImageUpload 컴포넌트 구현 완료
- 8-9장에서 구현한 블로그 구조와 통합 필요

**구현 대상:**
- 파일 경로: `components/admin/post-form.tsx` (새로 생성)
- 파일 역할: 관리자용 게시물 작성/수정 폼

**주요 요구사항:**
1. 폼 구성 요소
   - 게시물 제목 입력 필드
   - 커버 이미지 업로드 (ImageUpload 컴포넌트 활용)
   - 카테고리 선택 드롭다운
   - 게시물 내용 입력 (Textarea)
   - 저장/취소 버튼

2. 데이터 구조
   - title: 제목 (string)
   - content: 내용 (string)
   - slug: URL용 제목 (자동 생성)
   - coverImageUrl: 커버 이미지 URL (optional)
   - categoryId: 카테고리 ID (optional)

3. 폼 동작
   - 이미지 업로드 완료 시 URL 상태 업데이트
   - 제목 입력 시 slug 자동 생성 (안전한 한글 지원)
     * 영문 소문자, 숫자, 한글, 하이픈만 허용
     * 공백을 하이픈으로 변환
     * 연속된 하이픈 제거
     * 정규식 사용 시 하이픈 이스케이프 처리 필수
   - 폼 검증 (필수 필드 체크)

**기술적 요구사항:**
- 'use client' 컴포넌트로 구현
- useState로 폼 상태 관리
- TypeScript 타입 정의 활용
- ShadCN UI 컴포넌트 활용 (Button, Input, Textarea, Select)
- Select 컴포넌트 사용 시 주의사항:
  * SelectItem에 빈 문자열("")을 value로 사용하면 안 됨
  * 카테고리가 없는 경우 "none"과 같은 특정 값을 사용하고, 내부적으로 처리
  * 예: `<SelectItem value="none">카테고리 없음</SelectItem>`

**Slug 생성 함수 요구사항:**
- 한글 유니코드 범위: \uac00-\ud7a3 (완성형 한글)
- 정규식에서 하이픈 사용 시 반드시 이스케이프 처리: \-
- 안전한 문자만 허용: [a-z0-9가-힣\s\-]
- 예시 함수:
```typescript
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s\-]/g, '') // 안전한 문자만 허용
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속 하이픈 제거
    .replace(/^-|-$/g, '') // 앞뒤 하이픈 제거
}

1. 폼 데이터 처리
    - 특수 값 처리: 카테고리 선택에서 "none" 값은 실제 제출 시 빈 문자열로 변환
    - 초기 데이터 로딩 시 빈 categoryId는 "none" 값으로 변환

**완료 기준:**

- 모든 폼 필드가 정상 동작
- Select 컴포넌트에서 빈 문자열 사용으로 인한 오류 없음
- 이미지 업로드 통합 완료
- 폼 데이터가 올바른 형식으로 수집
- 기본적인 검증 및 에러 처리

요청사항만 실행한다.
```

**현재 구현 완료된 기능들**

✅ 완전히 작동 가능한 기능들

- Supabase 연결 및 설정
    - 환경변수 설정 완료
    - 데이터베이스 연결 테스트 가능
    - 접속: http://localhost:3000/test-supabase
- 이미지 업로드 시스템
    - Supabase Storage 'blog-images' 버킷 연동
    - 완전한 이미지 업로드 기능 (파일 검증, 고유명 생성, URL 반환)
    - 테스트 페이지: http://localhost:3000/test-upload
- 게시물 작성 폼 UI
    - 제목, 슬러그, 카테고리, 커버이미지, 내용 입력
    - 폼 검증 및 에러 처리
    - 이미지 업로드 통합
    - 테스트 페이지: http://localhost:3000/admin/post/new

```jsx
새 대화창을 열어서 시작합니다.

dev.md 에서 이 작업의 맥락을 파악하시오

프로젝트 전역 설정을 지금 한번 더 해주세요: ai의 기억력 한계
```

## 5. Supabase TypeScript 클라이언트를 활용한 CRUD 구현 및 즉시 테스트

이 부분에서 백엔드 완성합니다.

CRUD는 데이터베이스 기본 작업 4가지를 나타내는 약어

| 약어 | 영어 | 한국어 | 데이터베이스 | HTTP 메서드 |
| --- | --- | --- | --- | --- |
| C | Create | 생성 | INSERT | POST |
| R | Read | 읽기/조회 | SELECT | GET |
| U | Update | 수정 | UPDATE | PUT |
| D | Delete | 삭제 | DELETE | DELETE |

### 5.1. 게시물 API 라우트 구현

이제 Supabase TypeScript 클라이언트를 직접 사용하여 데이터베이스 작업을 수행한다.

AI에게 게시물 CRUD API 구현을 요청한다:

사용자(브라우저) → API 라우트 → Supabase 데이터베이스

- 사용자: "게시물 목록 보여줘"
- API 라우트: 요청을 받아서 데이터베이스에 쿼리
- 데이터베이스: 게시물 데이터 반환
- API 라우트: 사용자에게 데이터 전달

**주의 사항 프롬프트**

```
앞으로 진행될 Supabase API 구현과정에서 제한사항 및 주의사항을 기억하세요.

1. **집계 함수 제약**
   - `.group()`, `.having()` 메서드는 존재하지 않음
   - SQL GROUP BY 대신 개별 count 쿼리 또는 집계 함수 사용
   - 예: `.select('category, count.sum()')` 또는 개별 쿼리

2. **복잡한 쿼리 처리**
   - 복잡한 집계나 조인이 필요한 경우 RPC 함수 사용 권장
   - 또는 여러 개의 간단한 쿼리로 분할 처리

3. **권장 대안 패턴**
   - 카테고리별 게시물 수: Promise.all로 병렬 개별 쿼리
   - 복잡한 통계: PostgreSQL 함수 + .rpc() 호출
   - 집계 데이터: .select('column.count()') 형태 사용

4. **오류 발생 시 접근법**
   - Supabase 공식 문서에서 지원 메서드 확인
   - 존재하지 않는 메서드는 대안 접근법 사용
   - PostgREST 제약사항 고려한 쿼리 설계

```

**TypeScript API 라우트 구현 프롬프트**

```
블로그 게시물의 CRUD 작업을 위한 TypeScript API 라우트를 구현해 주세요.

**현재 상황:**
- Supabase 데이터베이스 및 타입 설정 완료
- posts 테이블 및 RLS 정책 설정 완료
- **Clerk JWT가 Supabase RLS와 통합 완료**
- **2025년 새로운 Third-Party Auth 방식 사용**

**구현 대상:**
- 파일 경로: `app/api/posts/route.ts`
- 파일 경로: `app/api/posts/[id]/route.ts`
- 파일 역할: Clerk 인증 기반 게시물 CRUD API 엔드포인트

**주요 요구사항:**
1. app/api/posts/route.ts
   - GET: 모든 게시물 조회 (페이지네이션 포함)
   - POST: 새 게시물 생성 (**Clerk 인증 필수**)

2. app/api/posts/[id]/route.ts
   - GET: 특정 게시물 조회
   - PUT: 게시물 수정 (**작성자 본인만 가능**)
   - DELETE: 게시물 삭제 (**작성자 본인만 가능**)

3. Clerk 인증 통합
   - **auth() 함수로 Clerk 사용자 정보 확인**
   - **userId를 author_id로 사용**
   - **인증되지 않은 요청은 401 응답**
   - **권한 없는 요청은 403 응답**

4. TypeScript 타입 활용
   - Database 타입 사용으로 타입 안전성 확보
   - 요청/응답 데이터 타입 정의
   - **Clerk 사용자 ID 타입 (string) 활용**
   - 에러 타입 정의

**Clerk 인증 로직 요구사항:**
```typescript
import { auth } from '@clerk/nextjs';

// 인증 확인 예시
const { userId } = auth();
if (!userId) {
  return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
}

// 작성자 확인 예시 (수정/삭제 시)
if (post.author_id !== userId) {
  return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
}

**기술적 요구사항:**

- lib/supabase.ts에서 생성한 클라이언트 사용
- **새로운 Third-Party Auth 방식의 서버 클라이언트 활용**
- 복잡한 ORM 없이 직접 supabase.from() 메소드 사용
- **Clerk auth() 함수로 사용자 인증 확인**
- **RLS 정책과 연동하여 이중 보안 확보**
- 기본적인 try-catch문 사용
- 적절한 HTTP 상태 코드 반환

**완료 기준:**

- 모든 CRUD 작업이 TypeScript로 안전하게 구현
- **Clerk 인증 및 권한 확인 로직 완벽 구현**
- **RLS 정책과 API 레벨 인증이 모두 작동**
- 에러 처리 및 응답 형식 일관성
- 실제 API 호출 테스트 가능

요청사항만 실행한다.
```

확인 사항:

- 응답 상태 코드 확인
- 응답 데이터 형식 확인
- 데이터베이스에 실제 저장 확인
- 에러 메시지 정상 표시 확인

모든 테스트가 통과하면 다음 단계로 진행하세요.

### 5.2. 카테고리 API 라우트 구현

카테고리 API 추가:

**프롬프트:**

```

카테고리 관리를 위한 TypeScript API 라우트를 구현해 주세요.

**현재 상황:**

- 게시물 API 구현 완료
- categories 테이블 및 RLS 정책 설정 완료
- **2025년 새로운 Third-Party Auth 방식 사용**

**구현 대상:**

- 파일 경로: `app/api/categories/route.ts`
- 파일 경로: `app/api/categories/[slug]/posts/route.ts`
- 파일 역할: 카테고리 관리 및 카테고리별 게시물 조회

**주요 요구사항:**

1. app/api/categories/route.ts
    - GET: 모든 카테고리 조회
    - POST: 새 카테고리 생성 (인증된 사용자만)
2. app/api/categories/[slug]/posts/route.ts
    - GET: 특정 카테고리의 게시물 조회
3. TypeScript 관계형 쿼리
    - 카테고리와 게시물 JOIN 쿼리
    - posts 테이블의 category_id로 연결
    - 카테고리 정보 포함한 게시물 데이터 반환

**기술적 요구사항:**

- Database 타입을 활용한 타입 안전성
- **lib/supabase.ts의 새로운 서버 클라이언트 사용**
- Supabase의 .select() 메소드로 관계형 데이터 조회
- 기본적인 CRUD 작업만 구현
- 복잡한 조인 쿼리는 제외

**완료 기준:**

- 카테고리 CRUD 정상 동작
- 카테고리별 게시물 필터링 기능
- TypeScript 컴파일 오류 없음

요청사항만 실행한다.

```

### 5.3. 추가 API 엔드포인트 구현

**프롬프트:**

```
게시물 조회를 위한 추가 API 엔드포인트를 구현해 주세요.

**구현 대상:**

- 파일 경로: `app/api/posts/slug/[slug]/route.ts`
- 파일 역할: slug로 게시물 조회

**주요 요구사항:**

1. GET /api/posts/slug/[slug]
    - URL의 slug로 게시물 조회
    - 카테고리 정보 포함
    - 존재하지 않으면 404 응답

**기술적 요구사항:**

- SEO 친화적 URL 지원
- **lib/supabase.ts의 새로운 서버 클라이언트 사용**
- 카테고리 JOIN 쿼리
- TypeScript 타입 안전성

**완료 기준:**

- slug로 게시물 정확히 조회
- 카테고리 정보 포함
- 404 처리 정상 작동

요청사항만 실행한다.

```

## 6. 블로그 페이지 데이터베이스 연동

프런트엔드 구현

### 6.1. 관리자 게시물 작성 페이지 구현

AI에게 관리자 페이지 구현을 요청한다:

**프롬프트:**

```
관리자가 게시물을 작성할 수 있는 페이지를 구현해 주세요.

**현재 상황:**
- 게시물 CRUD API 구현 완료
- 이미지 업로드 컴포넌트 구현 완료
- 카테고리 API 구현 완료
- **2025년 새로운 Third-Party Auth 방식 사용**

**구현 대상:**
- 파일 경로: `app/admin/posts/create/page.tsx`
- 파일 역할: 관리자용 게시물 작성 페이지

**주요 요구사항:**
1. 게시물 작성 폼
   - 제목 입력 필드
   - 슬러그 자동 생성 (제목 기반)
   - 카테고리 선택 (실제 데이터베이스에서 조회)
   - 커버 이미지 업로드 (기존 ImageUpload 컴포넌트 활용)
   - 내용 입력 (텍스트 에리어)
   - 저장/취소 버튼

2. 데이터베이스 연동
   - 카테고리 목록 실제 API에서 조회
   - 게시물 저장 시 실제 API 호출
   - 성공 시 게시물 상세 페이지로 이동
   - 실패 시 에러 메시지 표시

3. 인증 확인
   - Clerk 인증 상태 확인
   - 미인증 사용자 접근 차단

**기술적 요구사항:**
- 'use client' 컴포넌트로 구현
- 실제 API 엔드포인트 사용 (/api/posts, /api/categories)
- **ImageUpload 컴포넌트 사용 시 새로운 Supabase 클라이언트 방식 적용**
- TypeScript 타입 안전성 확보
- 로딩 상태 및 에러 처리

**완료 기준:**
- 실제로 게시물을 작성하고 저장할 수 있음
- 저장된 게시물이 데이터베이스에 저장됨
- 이미지 업로드가 정상 작동함
- 카테고리 선택이 실제 데이터 기반으로 작동함

요청사항만 실행한다.

```

### 6.1.5. 관리자 페이지 접근 링크 추가

**프롬프트:**

```
네비게이션에 관리자 페이지 접근 링크를 추가해 주세요.

**현재 상황:**
- 관리자 게시물 작성 페이지 구현 완료
- Header 컴포넌트에 네비게이션 존재

**구현 대상:**
- 파일 경로: `components/common/header.tsx` (기존 파일 수정)
- 파일 역할: 관리자 메뉴 추가

**주요 요구사항:**
1. 인증된 사용자에게만 관리자 메뉴 표시
   - "새 글 작성" 링크 추가
   - /admin/posts/create로 연결

2. 조건부 렌더링
   - SignedIn 컴포넌트 내부에 표시
   - 일반 네비게이션과 구분되게 표시

**완료 기준:**
- 로그인한 사용자에게만 "새 글 작성" 메뉴 표시
- 클릭 시 관리자 페이지로 이동

요청사항만 실행한다.

```

### 6.2. 홈페이지 실제 API 연동

AI에게 홈페이지 데이터베이스 연동을 요청한다:

**프롬프트:**

```
홈페이지를 실제 Supabase 데이터베이스와 연동해 주세요.

**현재 상황:**
- 홈페이지가 mockData 사용 중
- 게시물 및 카테고리 API 구현 완료
- **2025년 새로운 Third-Party Auth 방식 사용**

**구현 대상:**
- 파일 경로: `app/page.tsx` (기존 파일 수정)
- 파일 역할: 데이터베이스 기반 홈페이지

**주요 요구사항:**
1. MOCK 데이터 완전 제거
   - mockData.ts import 제거
   - 모든 mock 함수 호출 제거

2. 실제 데이터베이스 연동
   - Supabase 클라이언트 직접 사용
   - **서버 컴포넌트이므로 서버 클라이언트 사용**
   - 최신 게시물 3개 조회
   - 카테고리 목록 조회

3. 빈 상태 처리
   - 게시물이 없을 때 안내 메시지
   - 관리자 페이지로 유도 버튼

**기술적 요구사항:**
- 서버 컴포넌트에서 직접 Supabase 쿼리
- **lib/supabase.ts의 createServerSupabaseClient 사용**
- 에러 발생 시 빈 배열 반환
- TypeScript 타입 안전성 확보

**완료 기준:**
- 실제 데이터베이스의 게시물이 홈페이지에 표시됨
- 새로 작성한 게시물이 즉시 반영됨
- MOCK 데이터 관련 코드가 완전히 제거됨

요청사항만 실행한다.

```

### 6.2.5. 홈페이지 연동 즉시 확인

**프롬프트:**

```
홈페이지가 실제 데이터베이스와 올바르게 연동되었는지 확인해 주세요.

**확인 사항:**
1. 브라우저에서 홈페이지 새로고침
2. 콘솔에서 에러 확인
3. 네트워크 탭에서 Supabase 요청 확인

**테스트 시나리오:**
1. 데이터가 없을 때: "아직 게시물이 없습니다" 메시지 확인
2. 관리자 페이지에서 게시물 작성
3. 홈페이지로 돌아와서 새 게시물 표시 확인

**문제 해결:**
- 데이터가 표시되지 않으면 Supabase 대시보드에서 데이터 확인
- RLS 정책 확인 (읽기 권한)
- 환경 변수 설정 확인

만일 환경변수 연결이 안되면 기존의 테스트 페이지를 활용한다.

요청사항만 실행한다.

```

### 6.3. 게시물 목록 페이지 실제 API 연동

**프롬프트:**

```
게시물 목록 페이지를 실제 데이터베이스와 연동해 주세요.

**현재 상황:**
- 게시물 목록 페이지가 mockData 사용 중
- 게시물 API 구현 완료
- **2025년 새로운 Third-Party Auth 방식 사용**

**구현 대상:**
- 파일 경로: `app/posts/page.tsx` (기존 파일 수정)
- 파일 역할: 데이터베이스 기반 게시물 목록

**주요 요구사항:**
1. MOCK 데이터 제거
   - mockData import 및 사용 코드 제거

2. 실제 데이터베이스 연동
   - Supabase에서 모든 게시물 조회
   - **서버 컴포넌트이므로 서버 클라이언트 사용**
   - 카테고리 정보 포함 (join)
   - 최신순 정렬

3. 기존 PostCard 컴포넌트 활용
   - 데이터 구조 맞춤 변환
   - 타입 안전성 확보

**기술적 요구사항:**
- **lib/supabase.ts의 createServerSupabaseClient 사용**

**완료 기준:**
- 실제 데이터베이스의 모든 게시물 표시
- 카테고리 정보 정상 표시
- 클릭 시 상세 페이지로 이동

요청사항만 실행한다.

```

### 6.4. 게시물 상세 페이지 실제 API 연동

**프롬프트:**

```
게시물 상세 페이지를 실제 데이터베이스와 연동해 주세요.

**현재 상황:**
- 게시물 상세 페이지가 mockData 사용 중
- slug 기반 게시물 조회 API 구현 완료
- **2025년 새로운 Third-Party Auth 방식 사용**

**구현 대상:**
- 파일 경로: `app/posts/[slug]/page.tsx` (기존 파일 수정)
- 파일 역할: 데이터베이스 기반 게시물 상세 페이지

**주요 요구사항:**
1. MOCK 데이터 제거
   - mockData 관련 코드 완전 제거

2. 실제 데이터베이스 연동
   - slug로 게시물 조회
   - **서버 컴포넌트이므로 서버 클라이언트 사용**
   - 카테고리 정보 포함
   - 존재하지 않는 게시물은 notFound() 처리

3. 동적 기능
   - generateStaticParams로 정적 페이지 생성
   - 메타데이터 동적 생성

**기술적 요구사항:**
- **lib/supabase.ts의 createServerSupabaseClient 사용**

**완료 기준:**
- URL의 slug로 실제 게시물 조회
- 커버 이미지 정상 표시
- 404 페이지 정상 작동

요청사항만 실행한다.

```

### 6.5. 카테고리 관련 페이지들 실제 API 연동

**프롬프트:**

```
카테고리 관련 페이지들을 실제 데이터베이스와 연동해 주세요.

**현재 상황:**
- **2025년 새로운 Third-Party Auth 방식 사용**

**구현 대상:**
1. `app/categories/page.tsx` - 카테고리 목록
2. `app/categories/[slug]/page.tsx` - 카테고리별 게시물

**주요 요구사항:**
1. 카테고리 목록 페이지
   - MOCK 데이터 제거
   - 실제 카테고리 목록 조회
   - **서버 컴포넌트이므로 서버 클라이언트 사용**
   - 각 카테고리의 게시물 개수 표시

2. 카테고리별 게시물 페이지
   - slug로 카테고리 조회
   - **서버 컴포넌트이므로 서버 클라이언트 사용**
   - 해당 카테고리의 게시물만 필터링
   - generateStaticParams 구현

**기술적 요구사항:**
- **lib/supabase.ts의 createServerSupabaseClient 사용**

**완료 기준:**
- 실제 카테고리 데이터 표시
- 카테고리별 게시물 필터링 정상 작동
- 빈 카테고리 처리

요청사항만 실행한다.

```

### 6.6. 전체 연동 최종 확인

**프롬프트:**

```
모든 페이지가 실제 데이터베이스와 올바르게 연동되었는지 최종 확인해 주세요.

**확인 플로우:**
1. 관리자 페이지에서 새 게시물 작성 (이미지 포함)
2. 홈페이지에서 새 게시물 확인
3. 게시물 목록에서 확인
4. 게시물 상세 페이지 접근
5. 카테고리 페이지에서 필터링 확인

**체크리스트:**
- [ ] MOCK 데이터 import가 완전히 제거되었는가?
- [ ] 모든 페이지가 실제 데이터를 표시하는가?
- [ ] 새로 작성한 게시물이 모든 페이지에 반영되는가?
- [ ] 이미지 업로드가 정상 작동하는가?
- [ ] 에러 없이 모든 기능이 작동하는가?

**문제가 있다면:**
- 구체적인 에러 메시지 확인
- Supabase 대시보드에서 데이터 확인
- 네트워크 탭에서 API 호출 확인

요청사항만 실행한다.

```