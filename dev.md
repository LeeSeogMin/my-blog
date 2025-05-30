- 자료와 동영상화면이 다를 수 있습니다. 자료가 제시하는 순서대로 진행하시면 됩니다.
- 이 강의 자료를 my_blog에 [dev.md](http://dev.md) 파일로 저장하고 시작합니다.
- github copilot agent  “claude-4-sonnet” 사용 권장; cursor ai 사용도 적극 추천합니다.
- 동영상은 테스트 건너뛰지만 여러분들은 테스트하고 가세요.

**두 가지 방법이 있습니다.** 

1. 인증시스템까지 성공한 수강생은 본인의 코드로 계속 합니다. 
2. 실패한 분들은 아래와 같이 실행하여 코드를 다운받아 실습을 계속합니다: 단 최소 Clerk 인증은 받아야 한다. 

```
# 1. 현재 위치 확인 (웹 폴더로 이동)
cd C:\web

# 2. 기존 my_blog 폴더가 있다면 삭제(직접 삭제 가능)
C:\web>rmdir /s /q my_blog

# 3. GitHub에서 클론하여 my_blog 폴더에 저장
C:\web>git clone https://github.com/LeeSeogMin/my-blog.git my_blog

# 4. 프로젝트 폴더로 이동
cd my_blog

# 5. 패키지 설치
C:\web\my_blog>npm install

# 6. 환경 변수 파일 생성: 루트 디렉토리에 직접 환경변수 파일을 생성하거나 아래와 같이 실행한다. 
copy .env.local

환경변수 파일에 아래와 같이 저장한다. 
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=본인 키
CLERK_SECRET_KEY=본인 키

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# 7. 개발 서버 실행
npm run dev
```

## 0. 개발 환경 점검 및 정리: 본인 파일로 실습하는 경우

### 0.1. 버전 충돌 방지

1. **package.json 확인**
    - "dev" 스크립트에서 `-turbo` 옵션 제거
    - 변경 전: `"dev": "next dev --turbo"`
    - 변경 후: `"dev": "next dev"`

1. **next.config.js 파일을 열어서 아래의 내용으로 교체함**
    
    ```
    /** @type {import('next').NextConfig} */
    const nextConfig = {}
    
    module.exports = nextConfig
    ```
    

1. 캐시 정리 및 재설치: cmd에서 실행

```
cd C:\web

C:\web>cd my_blog

C:\web\my_blog>rmdir /s /q node_modules

C:\web\my_blog>del package-lock.json

C:\web\my_blog>rmdir /s /q .next

C:\web\my_blog>npm cache clean --force

C:\web\my_blog>npm install
```

### 0.2. 프로젝트 전역 설정

새로운 대화 세션에서 10장을 시작할 때 다음 설정을 적용한다: 

프로젝트의 맥락을 이해하게 한다. 

**프롬프트**

```jsx
dev.md 파일에서 앞으로의 작업의 맥락을 파악한다. 
```

프로젝트에서 사용할 설정을 기억하게 한다. 

**프롬프트**

```
### 프로젝트 전역 설정

**프로젝트 전역 설정:**
- 터미널 명령어: Command Prompt 사용 (PowerShell 사용 금지)
- 파일 생성/수정/삭제: Command Prompt 명령어로 안내
- 대화는 한글로 진행
- TypeScript와 한글 주석 사용
- 기본적인 에러 처리 포함
- 초보자도 이해할 수 있는 수준으로 구현
- 복잡한 고급 기능은 제외하고 기본적인 것만
- **Clerk와 Supabase 통합 방식**: Clerk 도메인을 Supabase의 Third-Party Auth에 입력하여 JWKS URL 자동 참조. RLS 정책은 `requesting_user_id()`를 통해 `sub` 클레임 활용. Supabase 클라이언트는 `global.headers`로 JWT 전달: 이 사실은 2025년 4월 1일 변경되었기에 반드시 기억해야 한다. 

**AI 실수 방지 체크리스트:**
✓ Next.js App Router 경로 구조 정확히 사용 (app/ 디렉토리 기준)  
✓ 'use client' 지시문 필요한 컴포넌트에만 추가  
✓ import 경로는 절대경로(@/) 또는 상대경로 일관성 유지  
✓ TypeScript 타입 정의 누락 없이 구현  
✓ 존재하지 않는 라이브러리나 컴포넌트 사용 금지  
✓ 복잡한 상태 관리나 최적화 기법 사용 금지  

**프로젝트 맥락 정보:**
- 8장 완료: 기본 블로그 구조, 포스트 목록/상세 페이지, 검색 기능, 댓글 시스템(로컬), 좋아요 기능  
- 9장 완료: Clerk 인증 시스템 통합, 권한 기반 댓글 관리  
- 현재 사용 중: Next.js 15, TypeScript, TailwindCSS, ShadCN UI, Clerk  
- 10장 목표: Supabase 데이터베이스 연동 및 이미지 업로드 시스템  
- **MOCK 데이터 제거 원칙**: 모든 mockData import를 제거하고 Supabase로 대체  
- **에러 처리**: try-catch로 감싸고 에러 시 빈 배열 반환  
- **빈 상태 처리**: 데이터가 없을 때 안내 메시지 필수  

---

위 설정을 메모리에 저장하고 다음 요청을 대기합니다.
```

## 1. 웹 애플리케이션에서 데이터베이스의 역할

### 1.1. 데이터베이스를 사용하는 이유

지금까지 블로그는 목업 데이터를 사용하여 동작했다. 하지만 실제 운영 환경에서는 사용자가 작성한 게시물, 댓글, 사용자 정보 등을 영구적으로 저장하고 관리해야 한다.

데이터베이스는 정보를 중앙화된 서버에서 체계적으로 관리하기 위해 사용한다. 블로그에서 관리해야 할 주요 데이터는 다음과 같다:

- **블로그 게시물**: 제목, 내용, 작성일, 커버 이미지
- **사용자 정보**: 작성자 정보 (Clerk에서 관리)
- **댓글**: 게시물에 달린 댓글들
- **좋아요**: 사용자들의 게시물 좋아요 정보

모든 데이터를 중앙화된 데이터베이스 서버에서 관리하여, 여러 사용자가 동일한 시스템에 접속해도 데이터가 일관되게 유지된다. 예를 들어, 사용자가 새 게시물을 작성하면 데이터베이스에 저장되고, 다른 사용자들도 즉시 해당 게시물을 볼 수 있다.

### 1.2. 데이터베이스의 핵심 특징

데이터베이스는 다음과 같은 특징을 가진다:

- **구조화된 데이터**: 데이터는 테이블, 열, 행과 같은 구조화된 형식으로 저장
- **쿼리 언어 지원**: SQL 같은 언어로 데이터 검색 및 조작
- **데이터 무결성**: 잘못된 데이터가 저장되지 않도록 규칙 적용

데이터베이스는 크게 두 가지 유형으로 나뉜다:

1. **관계형 데이터베이스(RDBMS)**: MySQL, PostgreSQL
    - 데이터를 테이블 형태로 관리하며, 스키마 필요
    - 데이터 간의 관계를 명확히 정의
2. **비관계형 데이터베이스(NoSQL)**: MongoDB, Redis
    - 문서(Document)나 키-값(Key-Value) 형식으로 데이터 저장

### 1.3. 이미지 스토리지의 필요성

이미지와 동영상 같은 파일은 크기가 크기 때문에 데이터베이스에 직접 저장하는 것보다 별도의 스토리지에 저장하는 것이 효율적이다.

일반적인 방식은 다음과 같다:

- **스토리지**: 실제 이미지 파일 저장
- **데이터베이스**: 이미지의 저장 위치(URL)만 기록

예를 들어, 사용자가 블로그 게시물의 커버 이미지를 업로드하면:

1. 이미지 파일은 스토리지에 저장
2. 데이터베이스의 posts 테이블에는 이미지 URL만 저장
3. 게시물을 표시할 때 URL을 통해 이미지를 불러옴

## 2. Supabase 소개 및 설정

### 2.1. Supabase 선택 이유

서비스 개발에 데이터베이스는 필수적이지만, 데이터베이스 서버를 직접 구축하고 관리하는 것은 복잡하고 비용이 많이 든다.

Supabase는 데이터베이스를 포함한 백엔드 서비스(BaaS)를 제공하여 개발자가 서버 설정 및 관리 부담을 줄이고, 애플리케이션 개발에 집중할 수 있도록 돕는다. 특히 서비스 초기에는 무료로 제공되어 비용 부담이 없다.

### 2.2. Supabase의 주요 기능

**Database**

- PostgreSQL 기반의 강력한 관계형 데이터베이스
- 웹 기반 테이블 에디터 제공
- SQL 에디터로 직접 쿼리 실행 가능

**Storage**

- 이미지, 동영상 등의 파일을 안전하게 저장
- CDN을 통한 빠른 파일 제공
- 간단한 업로드 API 제공

**Authentication**

- 다양한 소셜 로그인 지원 (우리는 Clerk 사용)
- 사용자 관리 기능

**무료 요금제 제공**

- 5만명의 사용자
- 500MB 데이터베이스
- 1GB 파일 스토리지

### 2.3. Supabase 프로젝트 생성

AI를 활용하여 Supabase 프로젝트를 생성해보자.

```
Supabase 데이터베이스 설정 가이드

****1. Supabase 계정 생성****

****Supabase 웹사이트 접속:****
웹 브라우저를 열고 https://supabase.com 에 접속합니다.
**회원가입 시작:**
웹사이트 우측 상단 또는 중앙에 있는 "Start your project" 버튼을 클릭합니다.

회원가입 페이지로 이동하면, 일반적으로 다음과 같은 옵션으로 가입할 수 있습니다:

****2. 새 Supabase 프로젝트 생성 과정****

****조직 생성:****
**Name(조직 이름):**
설정된 이름을 그대로 사용해도 되고 대학이름을 사용해도 됩니다.
****Type (형태):****
최초 가입 시에는 기본으로 생성된 "Personal" 조직을 선택하거나, 새로 조직을 생성할 수 있습니다. 개인 프로젝트라면 "Personal"을 그대로 사용하세요.
****Pricing Plan (요금제):****
초기 개발 단계에서는 **"Free Plan"**을 선택합니다.

모든 정보를 입력했으면 페이지 하단의 "Create new organization" 버튼을 클릭합니다.

****Project 생성:****
****Project Name (프로젝트 이름):****
권장 설정: my-blog-database
프로젝트를 쉽게 식별할 수 있는 이름을 입력합니다. 이 이름은 Supabase 대시보드에서 프로젝트를 구분하는 데 사용됩니다.
****Database Password (데이터베이스 비밀번호):****
권장 설정: 안전한 비밀번호 생성
****Region (지역):****
권장 설정: Northeast Asia (Seoul)

모든 정보를 입력했으면 페이지 하단의 "Create new project" 버튼을 클릭합니다. 진행 표시줄이 나타나고 완료되면 대시보드로 자동 이동됩니다.

****3. 프로젝트 설정에서 확인해야 할 주요 정보 및 환경 변수 키****
프로젝트 생성이 완료되면, 블로그 애플리케이션에서 Supabase 데이터베이스에 연결하기 위해 필요한 중요한 정보(키)들을 확인하고 메모해 두어야 합니다.

**API 설정 페이지로 이동:**
좌하단 메뉴에서 "View API settings" 아이콘을 클릭합니다.

확인 및 메모할 주요 정보:
이 페이지에서 다음과 같은 정보들을 확인할 수 있습니다. 이 정보들은 나중에 .env.local 파일에 환경 변수로 설정하여 애플리케이션에서 사용하게 됩니다.

**Project URL:** Supabase 프로젝트의 고유한 주소입니다.
환경 변수명: NEXT_PUBLIC_SUPABASE_URL
역할: 클라이언트(브라우저)와 서버 모두에서 Supabase에 요청을 보낼 때 사용됩니다.

**Anon/Public Key (anon public)**: 익명(anonymous) 사용자를 위한 공개 키입니다.
환경 변수명: NEXT_PUBLIC_SUPABASE_ANON_KEY
역할: 클라이언트 사이드 코드(브라우저에서 실행되는 React 컴포넌트 등)에서 Supabase에 접근할 때 주로 사용됩니다.

**Service Role Key (service_role):** 서비스 역할 키(또는 시크릿 키)는 매우 강력한 권한을 가진 비밀 키입니다. 이 키는 절대로 외부에 노출되어서는 안 됩니다!
환경 변수명: SUPABASE_SERVICE_ROLE_KEY
화면에서 REVEAL 클릭 후 확인한다.
역할: 서버 사이드 코드(Next.js API 라우트 등)에서 민감한 데이터 작업이나 RLS를 우회해야 하는 작업(예: 관리자 기능, 특정 사용자 데이터 강제 수정 등)을 수행할 때 사용됩니다.

```

### 2.4. Next.js 프로젝트에 Supabase 연결

패키지 설치:

```bash
npm install @supabase/supabase-js

```

환경 변수 설정 (`.env.local` 파일):

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

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
1. 환경변수 상태 표시

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

**3.4.1. 클라이언트 Supabase 설정**

AI에게 클라이언트 전용 Supabase 클라이언트 구현을 요청한다:

**프롬프트:**

```
2025년 새로운 Clerk Third-Party Auth 방식을 사용한 클라이언트 전용 Supabase 클라이언트를 구현해 주세요.

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
- 파일 역할: **클라이언트 컴포넌트 전용** Supabase 클라이언트 인스턴스
- **중요**: 서버 관련 코드는 절대 포함하지 않음

**주요 요구사항:**
1. **클라이언트 전용 설정**
   - **'use client' 지시어 필수**
   - **useSession 훅 기반 자동 토큰 관리만 구현**
   - **서버 관련 import 절대 금지**

2. **새로운 클라이언트 설정 방식**
   ```typescript
   // ✅ 2025년 권장 방식 (클라이언트 전용)
   const supabase = useMemo(() => {
     return createClient<Database>(
       config.url,
       config.anonKey,
       {
         global: {
           headers: async () => {
             if (session) {
               const token = await session.getToken();
               return token ? { Authorization: `Bearer ${token}` } : {};
             }
             return {};
           },
         },
         auth: {
           persistSession: false,
           autoRefreshToken: false,
         },
       }
     );
   }, [session]);
   ```

3. **클라이언트 전용 함수들**
   - **useSupabaseClient()**: 세션 기반 자동 인증 클라이언트 반환
   - **useCurrentUserId()**: 현재 Clerk 사용자 ID 반환
   - **extractJWTClaims()**: JWT 토큰 클레임 추출 (디버깅용)

4. **타입 안전성**
   - 환경 변수 타입 체크
   - **Database 타입 완전 연동**
   - **SupabaseClientType 타입 export**

**기술적 요구사항:**
- **@clerk/nextjs의 useSession 훅만 사용**
- **@clerk/nextjs/server import 절대 금지**
- **auth() 함수 사용 금지** (서버 전용이므로)
- **Database 타입 완전 연동**
- 환경 변수 존재 여부 확인
- **새 방식과 구 방식 차이점 주석으로 명확히 설명**

**사용 예시 포함:**
```typescript
// ✅ 클라이언트 컴포넌트에서 사용
'use client';
import { useSupabaseClient, useCurrentUserId } from '@/lib/supabase';

function MyComponent() {
  const supabase = useSupabaseClient(); // 세션 기반 자동 인증
  const userId = useCurrentUserId();
  
  const { data } = await supabase.from('posts').select('*'); // RLS 자동 적용
}
```

**완료 기준:**
- **클라이언트 컴포넌트에서만 사용 가능**
- **'use client' 지시어 포함**
- **서버 관련 코드 완전 제외**
- **새로운 Third-Party Auth 방식 완전 적용**
- **RLS 정책에서 auth.jwt()->>'sub' 정상 인식**
- TypeScript 컴파일 오류 없음
- **server-only 모듈 import 오류 없음**

요청사항만 실행한다.
```

**3.4.2. 서버 Supabase 설정**

AI에게 서버 전용 Supabase 클라이언트 구현을 요청한다:

**프롬프트:**

```jsx
2025년 새로운 Clerk Third-Party Auth 방식을 사용한 서버 전용 Supabase 클라이언트를 구현해 주세요.

**중요 변경사항:**
- **JWT Template 방식 완전 deprecated (2025.04.01부터)**
- **Third-Party Auth 방식으로 전면 변경**
- **JWT Secret 공유 불필요** (보안 대폭 개선)
- **새로운 accessToken 설정 방식 필수**
- **auth() 함수 기반 서버 사이드 토큰 관리**

**현재 상황:**
- 2.5에서 Third-Party Auth 설정 완료
- Clerk 세션에 'role': 'authenticated' 클레임 추가 완료
- 데이터베이스 테이블 및 타입 정의 완료
- **auth.jwt()->>'sub' 직접 사용 가능**
- lib/supabase.ts (클라이언트 전용) 구현 완료

**구현 대상:**
- 파일 경로: `lib/supabase-server.ts`
- 파일 역할: **서버 컴포넌트 및 API 라우트 전용** Supabase 클라이언트
- **중요**: 클라이언트 관련 코드는 절대 포함하지 않음

**주요 요구사항:**
1. **서버 전용 설정**
   - **'use client' 지시어 사용 금지**
   - **auth() 함수 기반 서버 사이드 인증만 구현**
   - **클라이언트 훅 사용 금지**

2. **새로운 서버 설정 방식**
   ```typescript
   // ✅ 2025년 권장 방식 (서버 전용)
   export async function createServerSupabaseClient(): Promise<SupabaseClient<Database>> {
     const { userId, getToken } = auth();
     
     const supabase = createClient<Database>(
       config.url,
       config.anonKey,
       {
         global: {
           headers: async () => {
             if (userId) {
               const token = await getToken();
               return token ? { Authorization: `Bearer ${token}` } : {};
             }
             return {};
           },
         },
         auth: {
           persistSession: false,
           autoRefreshToken: false,
         },
       }
     );

     return supabase;
   }
   ```

3. **서버 전용 함수들**
   - **createServerSupabaseClient()**: auth() 함수 기반 서버 클라이언트 생성
   - **createAdminSupabaseClient()**: Service Role Key 기반 관리자 클라이언트
   - **getCurrentUserIdServer()**: 서버에서 현재 사용자 ID 반환

4. **타입 안전성**
   - 환경 변수 타입 체크 (Service Role Key 포함)
   - **Database 타입 완전 연동**
   - **SupabaseServerClientType 타입 export**

**기술적 요구사항:**
- **@clerk/nextjs/server의 auth 함수만 사용**
- **@clerk/nextjs의 useSession 훅 사용 금지**
- **'use client' 지시어 사용 금지**
- **Database 타입 완전 연동**
- 환경 변수 존재 여부 확인 (SUPABASE_SERVICE_ROLE_KEY 포함)
- **새 방식과 구 방식 차이점 주석으로 명확히 설명**

**사용 예시 포함:**
```typescript
// ✅ 서버 컴포넌트에서 사용
import { createServerSupabaseClient } from '@/lib/supabase-server';

async function ServerComponent() {
  const supabase = await createServerSupabaseClient(); // auth() 함수 기반
  const { data } = await supabase.from('posts').select('*'); // RLS 자동 적용
}

// ✅ API 라우트에서 사용
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  // ... API 로직
}
```

**관리자 클라이언트 주의사항:**
```typescript
// ⚡ 관리자 권한 클라이언트 (신중하게 사용)
export function createAdminSupabaseClient(): SupabaseClient<Database> {
  if (!config.serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다.');
  }
  
  // RLS 정책을 우회하므로 신중하게 사용
  // 서버 사이드에서만 사용 (절대 클라이언트에 노출 금지)
}
```

**완료 기준:**
- **서버 컴포넌트 및 API 라우트에서만 사용 가능**
- **'use client' 지시어 없음**
- **클라이언트 관련 코드 완전 제외**
- **새로운 Third-Party Auth 방식 완전 적용**
- **RLS 정책에서 auth.jwt()->>'sub' 정상 인식**
- TypeScript 컴파일 오류 없음
- **관리자 클라이언트 안전성 확보**

요청사항만 실행한다.
```

### 3.5. 블로그 특화 RLS 정책 (최신 Third-Party Auth 적용)

2025년 새로운 방식에 맞는 효율적인  Row Level Security(RLS) 정책을 설정한다:

**프롬프트:**

```
2025년 새로운 Clerk Third-Party Auth 방식에 최적화된 테이블 RLS 정책을 설정해 주세요.**

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
- **Storage 정책은 별도로 Supabase Dashboard에서 수동 설정 예정**

**구현 대상:**
- 파일 경로: `docs/modern-rls-policies.sql`
- 파일 역할: 테이블 전용 최신 방식 RLS 정책

**주요 요구사항:**
1. **최신 RLS 패턴 적용 (테이블만)**
   ```sql
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
   ```

2. **블로그 테이블 정책**
   - **posts**: 새로운 패턴 적용, 작성자만 수정/삭제 가능
   - **comments**: auth.jwt()->>'sub' 사용, 작성자만 수정/삭제 가능
   - **likes**: 중복 방지 로직 포함, 본인만 삭제 가능
   - **categories**: 기본 authenticated 정책, 로그인 사용자만 관리

3. **정책 이름 규칙**
   - 테이블: "[테이블명]_[동작]_policy"

**기술적 요구사항:**
- **기존 테이블 정책 완전 삭제** (DROP POLICY IF EXISTS)
- **RLS 활성화** (ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
- **TO authenticated 역할 명시적 사용**
- **auth.jwt()->>'sub' 직접 활용**
- 한글 주석으로 각 정책 설명
- **Storage 관련 코드 제외** (별도 Dashboard 설정)

**호환성 참고:**
```sql
-- 🟡 기존 방식 (여전히 작동하지만 권장하지 않음)
-- requesting_user_id() = user_id

-- ✅ 새 방식 (권장)
-- auth.jwt()->>'sub' = user_id
```

**완료 기준:**
- **4개 테이블 RLS 정책 모두 포함**
- **모든 정책이 최신 Third-Party Auth 방식으로 작성됨**
- **성능 및 보안 최적화된 정책**
- **JWT 토큰 전달 시 모든 테이블 RLS 정책 정상 작동**
- **Storage 정책은 별도 설정 안내 포함**

**후속 작업:**
- 테이블 RLS 정책 적용 후 Storage 정책을 `docs/storage-policies-guide.md` 가이드로 생성해주세요. 
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

## 잠깐! "나의 블로그 보호 지침" 프롬프트

위의 RLS 실행 이후 아래의 프롬프트를 대화창에 넣어서 실행해주시기 바랍니다: 본인 파일을 사용할 경우 

```
**모든 프롬프트 실행 전 자동 체크 지침**

앞으로 내가 가이드에서 복사한 프롬프트를 보내면, 실행하기 전에 다음을 자동으로 체크해 주세요:

**1단계: 현실 vs 프롬프트 비교**
"이 프롬프트에서 요구하는 파일/폴더 구조와 님의 실제 구조를 먼저 비교해보겠습니다."

**2단계: 차이점 확인**
차이점 발견 시:
"⚠️ 발견된 차이점:
- 프롬프트 요구: [가이드에서 제시한 구조]  
- 님의 실제: [사용자 실제 구조]
어떻게 진행하시겠어요? 
1) 님의 기존 구조 유지하며 적응
2) 가이드 구조로 새로 생성  
3) 다른 방법"

**3단계: 확인 후 진행**
차이점이 없을 때만:
"님의 구조와 일치합니다. 바로 진행하겠습니다."

**4단계: 실행 결과 검증**
구현 후:
"님의 기존 [관련기능]에 영향을 주지 않았는지 확인해 주세요."

이 체크 프로세스를 이해했다면 "자동 체크 지침을 설정했습니다"라고 답해주세요.
```

## 4. 이미지 업로드 기능 구현

### 4.1. Supabase Storage 설정

```jsx
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
```

**Supabase Storage  정책 설정**

앞에서 생성한 Supabase Storage 정책 설정 가이드에 따라 직접 설정해야 합니다. 

```jsx
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
Target Roles: anon, authenticated.  : 두 개를 설정한다. 
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
2. **"For full customization"** 선택

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
```

### 4.2. 이미지 업로드 유틸리티 함수 작성

AI에게 이미지 업로드를 위한 헬퍼 함수 작성을 요청한다: 동영상과 조금 다릅니다. 

```markdown
# 1. 클라이언트 전용 이미지 업로드 유틸리티 (React Hook)

Supabase Storage를 사용하여 **클라이언트 컴포넌트**에서 이미지를 업로드하는 TypeScript 유틸리티 훅을 구현해 주세요. 이 훅은 브라우저의 `File` 객체를 받아 Supabase Storage에 업로드하고, 업로드된 파일의 공개 URL을 반환합니다.

**현재 상황:**
- Supabase Storage에 'blog-images' 공개 버킷 생성 완료
- TypeScript 기반 프로젝트에서 타입 안전성 확보 필요
- **2025년 새로운 Third-Party Auth 방식 사용**
- 클라이언트 전용 Supabase 클라이언트 훅 (`useSupabaseClient`)은 `lib/supabase.ts`에 정의되어 있음

**구현 대상:**
- 파일 경로: `lib/upload-image-client.ts`
- 파일 역할: 클라이언트 컴포넌트용 이미지 업로드 훅 및 URL 반환 유틸리티

**주요 요구사항:**
1.  **이미지 업로드 훅 기능 (`useUploadImage`):**
    *   훅은 `(file: File) => Promise<{ success: boolean; url?: string; error?: string }>` 형태의 `upload` 함수를 반환해야 합니다.
    *   `upload` 함수는 `File` 객체를 인자로 받아 처리합니다.
    *   파일 형식 검증: `jpg`, `png`, `gif`, `webp`만 허용해야 합니다.
    *   고유한 파일명 생성: 현재 시간과 랜덤 문자(`uuid`)를 조합하여 파일명 중복을 방지합니다.
    *   Supabase Storage의 'blog-images' 버킷에 파일을 업로드합니다.
    *   업로드된 파일의 공개 URL을 반환합니다.
    *   파일 크기는 제한하지 않습니다.

2.  **TypeScript 타입 정의:**
    *   훅의 반환값 타입 (`UploadResult`)을 명확하게 정의합니다.
    *   `File` 객체 타입을 활용합니다.
    *   에러 타입 정의를 포함합니다.

3.  **에러 처리:**
    *   파일 형식 오류를 명확한 메시지로 처리합니다.
    *   Supabase 업로드 실패 시 발생하는 오류를 처리하고 반환합니다.
    *   네트워크 오류 등 예상치 못한 오류를 `try-catch`로 처리합니다.

**기술적 요구사항:**
-   **'use client' 지시어를 파일 최상단에 포함해야 합니다.**
-   `@/lib/supabase`에서 `useSupabaseClient` 훅을 임포트하여 Supabase 클라이언트 인스턴스를 가져옵니다.
-   `uuid` 패키지를 활용하여 고유 파일명을 생성합니다 (필요시 설치).
-   각 단계별로 한글 주석을 추가하여 코드 이해도를 높입니다.
-   성공/실패 결과를 명확히 반환하는 기본적인 에러 처리를 구현합니다.
-   **2025년 새로운 Third-Party Auth 방식**에 맞게 `useSupabaseClient`가 Clerk JWT를 자동으로 포함하여 요청을 보내는 것을 활용합니다.

**완료 기준:**
-   `lib/upload-image-client.ts` 파일이 생성되고, 위에 명시된 모든 요구사항을 충족합니다.
-   `useUploadImage` 훅이 정상적으로 동작하며, TypeScript 컴파일 오류가 없습니다.
-   클라이언트 컴포넌트에서 이 훅을 사용하여 이미지를 성공적으로 업로드하고 테스트할 수 있습니다.
```

```markdown
# 2. 서버 전용 이미지 업로드 유틸리티 (함수)

Supabase Storage를 사용하여 **서버 컴포넌트 또는 API 라우트**에서 이미지를 업로드하는 TypeScript 함수를 구현해 주세요. 이 함수는 `Buffer` 또는 `Blob` 형태의 파일 데이터를 받아 Supabase Storage에 업로드하고, 업로드된 파일의 공개 URL을 반환합니다.

**현재 상황:**
- Supabase Storage에 'blog-images' 공개 버킷 생성 완료
- TypeScript 기반 프로젝트에서 타입 안전성 확보 필요
- **2025년 새로운 Third-Party Auth 방식 사용**
- 서버 전용 Supabase 클라이언트 함수 (`createServerSupabaseClient`)는 `lib/supabase-server.ts`에 정의되어 있음

**구현 대상:**
- 파일 경로: `lib/upload-image-server.ts`
- 파일 역할: 서버 컴포넌트/API 라우트용 이미지 업로드 함수 및 URL 반환 유틸리티

**주요 요구사항:**
1.  **이미지 업로드 함수 기능 (`uploadImageServer`):**
    *   함수 시그니처: `(fileData: Buffer | Blob, fileName: string, contentType: string) => Promise<{ success: boolean; url?: string; error?: string }>`
    *   `fileData`는 이미지 파일의 실제 이진 데이터 (Buffer 또는 Blob), `fileName`은 원본 파일명 (확장자 포함), `contentType`은 파일의 MIME 타입을 나타냅니다.
    *   파일 형식 검증: `jpg`, `png`, `gif`, `webp`만 허용해야 합니다.
    *   고유한 파일명 생성: `uuid`를 조합하여 파일명 중복을 방지합니다.
    *   Supabase Storage의 'blog-images' 버킷에 파일을 업로드합니다.
    *   업로드된 파일의 공개 URL을 반환합니다.
    *   파일 크기는 제한하지 않습니다.

2.  **TypeScript 타입 정의:**
    *   함수의 매개변수 및 반환값 타입 (`UploadResult`)을 명확하게 정의합니다.
    *   `Buffer` 및 `Blob` 타입 활용을 포함합니다.
    *   에러 타입 정의를 포함합니다.

3.  **에러 처리:**
    *   파일 형식 오류를 명확한 메시지로 처리합니다.
    *   Supabase 업로드 실패 시 발생하는 오류를 처리하고 반환합니다.
    *   네트워크 오류 등 예상치 못한 오류를 `try-catch`로 처리합니다.

**기술적 요구사항:**
-   **파일 최상단에 'use client' 지시어를 포함하지 않습니다.** (이 파일은 서버에서만 실행됩니다.)
-   `@/lib/supabase-server`에서 `createServerSupabaseClient` 함수를 임포트하여 Supabase 클라이언트 인스턴스를 가져옵니다.
-   `uuid` 패키지를 활용하여 고유 파일명을 생성합니다 (필요시 설치).
-   각 단계별로 한글 주석을 추가하여 코드 이해도를 높입니다.
-   성공/실패 결과를 명확히 반환하는 기본적인 에러 처리를 구현합니다.
-   **2025년 새로운 Third-Party Auth 방식**에 맞게 `createServerSupabaseClient`가 요청의 인증 정보를 활용하여 Clerk JWT를 포함하여 요청을 보내는 것을 활용합니다.

**완료 기준:**
-   `lib/upload-image-server.ts` 파일이 생성되고, 위에 명시된 모든 요구사항을 충족합니다.
-   `uploadImageServer` 함수가 정상적으로 동작하며, TypeScript 컴파일 오류가 없습니다.
-   API 라우트 또는 서버 컴포넌트에서 이 함수를 사용하여 이미지를 성공적으로 업로드하고 테스트할 수 있습니다.
```

---

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
- **클라이언트 컴포넌트에서는 useSupabaseClient 훅 사용**
- **import 경로**: `import { useSupabaseClient } from '@/lib/supabase';`
- **서버에서는 createServerSupabaseClient 함수 사용**
- **새로운 Third-Party Auth 방식의 클라이언트 활용**

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
- **클라이언트 컴포넌트에서는 useSupabaseClient 훅 사용**
- **import 경로**: `import { useSupabaseClient } from '@/lib/supabase';`
- **서버에서는 createServerSupabaseClient 함수 사용**
- **새로운 Third-Party Auth 방식의 클라이언트 활용**

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
- 이미지 업로드 시스템
    - Supabase Storage 'blog-images' 버킷 연동
    - 완전한 이미지 업로드 기능 (파일 검증, 고유명 생성, URL 반환)
- 게시물 작성 폼 UI
    - 제목, 슬러그, 카테고리, 커버이미지, 내용 입력
    - 폼 검증 및 에러 처리
    - 이미지 업로드 통합

```jsx
새 대화창을 열어서 시작합니다.

dev.md 에서 이 작업의 맥락을 파악하시오

프로젝트 전역 설정을 지금 한번 더 해주세요: ai의 기억력 한계
```

## 5. Supabase TypeScript 클라이언트를 활용한 CRUD 구현 및 즉시 테스트

**이 부분에서 백엔드 완성합니다.**

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

AI에게 게시물 CRUD API 구현을 요청한다.

```
사용자(브라우저) → API 라우트 → Supabase 데이터베이스
```

- **사용자**: "게시물 목록 보여줘"
- **API 라우트**: 요청을 받아서 데이터베이스에 쿼리
- **데이터베이스**: 게시물 데이터 반환
- **API 라우트**: 사용자에게 데이터 전달

**TypeScript API 라우트 구현 프롬프트**

```
블로그 게시물의 CRUD 작업을 위한 TypeScript API 라우트를 구현해 주세요.

**현재 상황:**
- Supabase 데이터베이스 및 타입 설정 완료
- `posts` 테이블 및 RLS 정책 설정 완료
- Clerk JWT가 Supabase RLS와 통합 완료
- **2025년 새로운 Third-Party Auth 방식 사용**

**구현 대상:**
- 파일 경로: `app/api/posts/route.ts` (모든 게시물 조회 및 새 게시물 생성)
- 파일 경로: `app/api/posts/[id]/route.ts` (특정 게시물 조회, 수정, 삭제)
- 파일 역할: Clerk 인증 기반 게시물 CRUD API 엔드포인트

**주요 요구사항:**

1.  **`app/api/posts/route.ts`:**
    *   **GET: 모든 게시물 조회** (페이지네이션 포함)
        *   최신순으로 게시물을 조회합니다.
        *   페이지네이션을 구현하여, 요청 시 `page` 및 `limit` 쿼리 파라미터를 처리합니다.
        *   각 게시물에 연결된 카테고리 정보도 함께 조회합니다 (JOIN 쿼리).
        *   조회된 데이터를 JSON 형식으로 반환합니다.
        *   데이터가 없을 경우 빈 배열을 반환합니다.
    *   **POST: 새 게시물 생성 (**Clerk 인증 필수**)**
        *   요청 바디에서 `title`, `content`, `slug`, **`cover_image_url` (선택 사항), `category_id` (선택 사항)** 필드들을 정확히 파싱합니다.
        *   Clerk `auth()` 함수를 사용하여 현재 로그인한 사용자 (`user_id`)를 확인합니다. 인증되지 않은 요청은 401 Unauthorized 응답을 반환합니다.
        *   확인된 `user_id`를 게시물의 `author_id`로 사용합니다.
        *   파싱된 데이터와 `author_id`를 사용하여 `posts` 테이블에 새 게시물을 삽입합니다.
        *   **[매우 중요] `cover_image_url`과 `category_id` 필드가 요청에 포함된 경우, Supabase `insert` 쿼리에 반드시 포함시켜 DB에 저장되도록 합니다. 이들이 `NULL`로 저장되지 않도록 철저히 확인합니다.**
        *   삽입 성공 시 생성된 게시물 정보를 JSON 형식으로 반환하고, 201 Created 상태 코드를 사용합니다.
        *   데이터 유효성 검사 (필수 필드 누락, 슬러그 중복 등)를 수행하고, 유효성 검사 실패 시 400 Bad Request 응답을 반환합니다.

2.  **`app/api/posts/[id]/route.ts`:**
    *   **GET: 특정 게시물 조회**
        *   URL의 동적 세그먼트 `[id]`를 사용하여 게시물 ID를 가져옵니다.
        *   해당 ID의 게시물을 조회하고, 연결된 카테고리 정보도 함께 조회합니다.
        *   게시물이 존재하지 않으면 404 Not Found 응답을 반환합니다.
        *   조회된 데이터를 JSON 형식으로 반환합니다.
    *   **PUT: 게시물 수정 (**작성자 본인만 가능**)**
        *   URL의 `[id]`를 사용하여 게시물 ID를 가져옵니다.
        *   요청 바디에서 수정될 필드들(`title`, `content`, `slug`, **`cover_image_url` (선택 사항), `category_id` (선택 사항)** 등)을 파싱합니다.
        *   Clerk `auth()` 함수로 현재 로그인한 사용자 (`user_id`)를 확인합니다.
        *   조회된 게시물의 `author_id`와 현재 로그인한 `user_id`가 일치하는지 확인하여 작성자만 수정 가능하도록 합니다. 권한이 없는 요청은 403 Forbidden 응답을 반환합니다.
        *   게시물이 존재하지 않으면 404 Not Found 응답을 반환합니다.
        *   데이터베이스에 해당 게시물을 업데이트하고, 업데이트된 게시물 정보를 JSON 형식으로 반환합니다.
        *   **[매우 중요] `cover_image_url`과 `category_id` 필드가 요청에 포함된 경우, Supabase `update` 쿼리에 반드시 포함시켜 DB에 저장되도록 합니다. 이들이 `NULL`로 저장되지 않도록 철저히 확인합니다.**
    *   **DELETE: 게시물 삭제 (**작성자 본인만 가능**)**
        *   URL의 `[id]`를 사용하여 게시물 ID를 가져옵니다.
        *   Clerk `auth()` 함수로 현재 로그인한 사용자 (`user_id`)를 확인합니다.
        *   조회된 게시물의 `author_id`와 현재 로그인한 `user_id`가 일치하는지 확인하여 작성자만 삭제 가능하도록 합니다. 권한이 없는 요청은 403 Forbidden 응답을 반환합니다.
        *   게시물이 존재하지 않으면 404 Not Found 응답을 반환합니다.
        *   데이터베이스에서 해당 게시물을 삭제하고, 204 No Content 상태 코드를 반환합니다.

**Clerk 인증 로직 요구사항:**
*   `@clerk/nextjs`의 `auth()` 함수를 사용하여 Clerk 사용자 정보(`userId`)를 확인합니다.
*   인증되지 않은 요청에 대해서는 `NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });`를 반환합니다.
*   권한 없는 요청(작성자 불일치 등)에 대해서는 `NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });`를 반환합니다.

**[중요] 데이터 필드명 통일 지침:**
-   **프론트엔드, API 요청/응답, DB 컬럼명 모두에서 게시물의 커버 이미지 URL 필드는 반드시 `cover_image_url` (snake_case)로 통일하여 사용합니다.**
-   **프론트엔드, API 요청/응답, DB 컬럼명 모두에서 카테고리 ID 필드는 반드시 `category_id` (snake_case)로 통일하여 사용합니다.**
-   `camelCase`와 `snake_case`의 혼용을 금지합니다.
-   TypeScript 인터페이스, API 요청/응답, DB 컬럼명까지 일관성 있게 유지합니다.
-   예시 JSON: `{"title": "제목", "content": "내용", "cover_image_url": "https://...", "category_id": "tech"}`

**기술적 요구사항:**
-   `lib/supabase-server.ts`에서 생성한 서버 전용 Supabase 클라이언트 (`createServerSupabaseClient`)를 활용합니다. `import { createServerSupabaseClient } from '@/lib/supabase-server';` 경로를 준수합니다.
-   복잡한 ORM 없이 `supabase.from().select()`, `.insert()`, `.update()`, `.delete()` 메소드를 직접 사용하여 데이터베이스 작업을 수행합니다.
-   Clerk `auth()` 함수를 사용하여 사용자 인증 및 `author_id` 확인을 구현합니다.
-   RLS 정책과 API 레벨 인증을 연동하여 이중 보안을 확보합니다.
-   기본적인 `try-catch` 문을 사용하여 모든 API 요청에 대한 에러 처리를 구현합니다.
-   적절한 HTTP 상태 코드 (200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found)를 반환합니다.
-   TypeScript 컴파일 오류가 없도록 데이터베이스 스키마와 일치하는 타입을 사용하고, 요청/응답 데이터 타입을 명확히 정의합니다.
-   **클라이언트 컴포넌트 관련 코드를 절대 포함하지 않습니다.**

**완료 기준:**
-   모든 CRUD 작업 (`GET` 게시물 목록, `POST` 게시물 생성, `GET` 특정 게시물, `PUT` 게시물 수정, `DELETE` 게시물 삭제)이 TypeScript로 안전하게 구현됩니다.
-   Clerk 인증 및 권한 확인 로직 (`author_id` 일치 여부)이 완벽하게 구현됩니다.
-   RLS 정책과 API 레벨 인증이 모두 정상 작동하여 데이터 무결성과 보안이 확보됩니다.
-   **`cover_image_url`과 `category_id` 필드가 게시물 생성 및 수정 시 DB에 정확히 저장되고, 조회 시에도 올바르게 반환됩니다.** (NULL 문제 해결)
-   에러 처리 및 응답 형식이 일관됩니다.
-   실제 API 호출 테스트 시 예상대로 동작합니다.

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
- **lib/supabase-server.ts의 createServerSupabaseClient 사용**
- **import 경로**: `import { createServerSupabaseClient } from '@/lib/supabase-server';`
- **클라이언트 컴포넌트에서는 절대 사용 금지**

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
- **lib/supabase-server.ts의 createServerSupabaseClient 사용**
- **import 경로**: `import { createServerSupabaseClient } from '@/lib/supabase-server';`
- **클라이언트 컴포넌트에서는 절대 사용 금지**

**완료 기준:**

- slug로 게시물 정확히 조회
- 카테고리 정보 포함
- 404 처리 정상 작동

요청사항만 실행한다.

```

## 6. 블로그 페이지 데이터베이스 연동

**프런트엔드 구현**

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
1.  **게시물 작성 폼 구성 요소:**
    *   **제목 입력 필드:** 게시물의 제목을 입력합니다.
    *   **커버 이미지 업로드:** 기존 `ImageUpload` 컴포넌트를 활용하여 이미지를 업로드하고, **업로드 완료 시 `onImageUploaded` 콜백을 통해 반환되는 `coverImageUrl`을 폼의 상태에 정확히 저장합니다.**
    *   **카테고리 선택 드롭다운:** 실제 데이터베이스 (`/api/categories`)에서 카테고리 목록을 조회하여 드롭다운을 구성하고, **사용자가 선택한 `category_id` 값을 폼의 상태에 정확히 저장합니다.** (카테고리가 없을 경우 "none"과 같은 특정 값으로 처리)
    *   **게시물 내용 입력:** `Textarea`를 사용하여 게시물 내용을 입력합니다.
    *   **저장/취소 버튼:** 폼 데이터를 저장하거나 작성을 취소합니다.

2.  **데이터베이스 연동:**
    *   **카테고리 목록 실제 API에서 조회:** `GET /api/categories` 엔드포인트를 호출하여 드롭다운에 사용할 카테고리 목록을 가져옵니다.
    *   **게시물 저장 시 실제 API 호출:** 폼 제출 시 `POST /api/posts` 엔드포인트로 API 요청을 보냅니다.
    *   **성공 시 게시물 상세 페이지로 이동:** 게시물 저장이 성공하면 해당 게시물의 상세 페이지 (`/posts/[slug]`)로 사용자를 리다이렉트합니다.
    *   **실패 시 에러 메시지 표시:** 게시물 저장에 실패하면 사용자에게 명확한 에러 메시지를 표시합니다.

3.  **인증 확인:**
    *   Clerk 인증 상태를 확인합니다.
    *   미인증 사용자가 이 페이지에 접근하는 것을 차단하고, 적절한 처리 (예: 로그인 페이지로 리다이렉트)를 수행합니다.

**기술적 요구사항:**
-   **'use client' 컴포넌트로 구현해야 합니다.**
-   실제 API 엔드포인트 (`/api/posts`, `/api/categories`)를 사용합니다.
-   **폼 상태 관리:** `useState` 훅을 사용하여 `title`, `content`, `slug`, **`coverImageUrl`**, **`categoryId`** 등의 폼 필드 상태를 효율적으로 관리합니다.
-   **데이터 변환 및 전달:**
    *   `ImageUpload` 컴포넌트의 `onImageUploaded` 콜백을 통해 받은 `coverImageUrl`을 폼 상태에 반영하고, 폼 제출 시 API 요청 페이로드에 `cover_image_url` 필드로 포함해야 합니다.
    *   카테고리 드롭다운에서 선택된 `categoryId`를 폼 상태에 반영하고, 폼 제출 시 API 요청 페이로드에 `category_id` 필드로 포함해야 합니다.
    *   `title` 입력 시 `slug`를 자동으로 생성하는 함수를 포함합니다 (영문 소문자, 숫자, 한글, 하이픈만 허용, 공백 하이픈 변환, 연속 하이픈 제거, 앞뒤 하이픈 제거).
-   TypeScript 타입 정의를 활용하여 폼 데이터 구조와 API 요청/응답의 타입 안전성을 확보합니다.
-   ShadCN UI 컴포넌트(`Button`, `Input`, `Textarea`, `Select`)를 적극적으로 활용합니다.
-   Select 컴포넌트 사용 시 주의사항: `SelectItem`에 빈 문자열("")을 value로 사용하지 않으며, 카테고리가 없는 경우 "none"과 같은 특정 값을 사용하여 내부적으로 처리합니다 (`<SelectItem value="none">카테고리 없음</SelectItem>` 예시).
-   로딩 상태와 에러 처리 UI를 적절하게 구현합니다.
-   **클라이언트 컴포넌트에서는 `@/lib/supabase`의 `useSupabaseClient` 훅을 사용하며, `import { useSupabaseClient } from '@/lib/supabase';` 경로를 준수합니다.**
-   **서버에서는 `createServerSupabaseClient` 함수를 사용하지만, 이 파일은 클라이언트 컴포넌트이므로 직접 사용하지 않고 API 라우트 호출을 통해 간접적으로 사용됩니다.**
-   **새로운 Third-Party Auth 방식**과 호환되도록 구현합니다.

**완료 기준:**
-   관리자가 실제로 게시물을 작성하고 저장할 수 있습니다.
-   저장된 게시물이 데이터베이스에 성공적으로 저장됩니다.
-   **이미지 업로드 기능이 정상 작동하며, `cover_image_url`이 DB에 정확히 저장되고 나중에 렌더링됩니다.**
-   **카테고리 선택 기능이 실제 데이터 기반으로 작동하며, `category_id`가 DB에 정확히 저장되고 나중에 필터링에 사용됩니다.**
-   폼의 모든 필드 (제목, 내용, 슬러그, 커버 이미지, 카테고리)가 정상적으로 동작하고 유효성 검사가 적용됩니다.
-   저장 성공 시 상세 페이지로 리다이렉트되며, 실패 시 에러 메시지가 표시됩니다.

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
   - **서버 컴포넌트이므로 createServerSupabaseClient 사용**
   - 카테고리 정보 포함
   - 존재하지 않는 게시물은 notFound() 처리

3. **빌드 타임 vs 런타임 함수 구분 (중요!)**
   - **generateStaticParams**: 공개 anon 클라이언트만 사용
   - **generateMetadata**: 공개 anon 클라이언트만 사용  
   - **페이지 컴포넌트**: createServerSupabaseClient 사용 가능

**기술적 요구사항:**
- **빌드 타임 함수 (generateStaticParams, generateMetadata):**
  ```typescript
  // ✅ 올바른 패턴: 공개 클라이언트만 사용
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  ```
- **런타임 함수 (페이지 컴포넌트):**
  ```typescript
  // ✅ 인증된 서버 클라이언트 사용 가능
  const supabase = await createServerSupabaseClient();
  const { userId } = await auth();
  ```
- **절대 금지**: generateStaticParams와 generateMetadata에서 auth() 또는 createServerSupabaseClient 사용

**완료 기준:**
- URL의 slug로 실제 게시물 조회
- 커버 이미지 정상 표시
- 404 페이지 정상 작동
- **빌드 에러 없이 정상 컴파일**

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
   - **generateStaticParams에서는 공개 anon 클라이언트만 사용**

**기술적 요구사항:**
- **빌드 타임 함수 (generateStaticParams):**
  ```typescript
  // ✅ 올바른 패턴: 공개 클라이언트만 사용
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  ```
- **런타임 함수 (페이지 컴포넌트):**
  ```typescript
  // ✅ 인증된 서버 클라이언트 사용 가능
  const supabase = await createServerSupabaseClient();
  ```
- **절대 금지**: generateStaticParams에서 auth() 또는 createServerSupabaseClient 사용

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

**현재 상황:**
- **2025년 새로운 Third-Party Auth 방식 사용**

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

# 7. 최종 검증: 10장 전체 기능 테스트

### 7.1. 데이터베이스 연동 기능 검증

1. **데이터 CRUD 테스트**
    - Supabase 대시보드에서 직접 데이터 추가
    - 웹사이트에서 데이터 표시 확인
    - API를 통한 데이터 생성/수정/삭제 테스트
2. **타입 안전성 검증**
    - TypeScript 컴파일 오류 없음 확인
    - 데이터베이스 스키마와 타입 일치 확인
    - API 응답 타입 정확성 확인

### 7.2. 이미지 업로드 시스템 검증

1. **업로드 기능 테스트**
    - 다양한 이미지 형식 업로드 테스트
    - 파일 크기 제한 테스트
    - 업로드 진행 상태 표시 확인
2. **스토리지 연동 확인**
    - Supabase Storage에 파일 저장 확인
    - 공개 URL 생성 및 접근 확인
    - RLS 정책 동작 확인

### 7.3. 전체 시스템 통합 확인

1. **8-9장 기능과의 통합**
    - 기존 인증 시스템 정상 동작
    - 댓글 시스템과 데이터베이스 연동
    - 전체 사용자 플로우 일관성
2. **성능 및 안정성**
    - 페이지 로딩 속도 적절함
    - 에러 처리 정상 동작
    - 다양한 화면 크기에서 UI 정상 표시

# 8. 진행 상황 저장 (GitHub 커밋)

Vs-Code의 Source Control을 활용한다. 

# 9. 마무리

### 9.1. 10장에서 완성한 주요 기능

- **Supabase 데이터베이스 연동**: PostgreSQL 기반의 안정적인 데이터 저장
- **TypeScript 타입 안전성**: Database 타입을 통한 완전한 타입 체크
- **이미지 업로드 시스템**: Supabase Storage를 활용한 파일 관리
- **게시물 CRUD**: 생성, 조회, 수정, 삭제 기능 완성
- **커버 이미지 지원**: 게시물에 이미지 첨부 및 표시

### 9.2. 11장 준비사항

다음 장에서 구현할 소셜 기능 및 배포를 위한 기반:

- **완전한 데이터 영속성**: 모든 사용자 데이터가 안전하게 저장됨
- **확장 가능한 API 구조**: RESTful 패턴의 견고한 API 기반
- **이미지 관리 시스템**: 사용자 생성 콘텐츠를 위한 완전한 파일 관리
- **타입 안전성**: 향후 기능 추가 시에도 안전한 개발 환경

10장을 통해 블로그가 목업 데이터 기반의 프로토타입에서 실제 데이터베이스를 활용하는 완전한 웹 애플리케이션으로 발전했다. 사용자들은 이제 실제로 게시물을 저장하고, 이미지를 업로드하며, 모든 데이터가 영구적으로 보존되는 진정한 블로그 시스템을 사용할 수 있다.

## 참고 자료

- Supabase 공식 문서: https://supabase.com/docs
- Next.js App Router 가이드: https://nextjs.org/docs/app
- TypeScript 핸드북: https://www.typescriptlang.org/docs
- PostgreSQL 문서: https://www.postgresql.org/docs

## 🚨 중요: 빌드 에러 방지 가이드

### Next.js 빌드 타임 vs 런타임 함수 구분

**2025년 새로운 Third-Party Auth 방식에서 주의사항**

#### 빌드 타임 함수들 (Clerk auth() 사용 금지)
```typescript
// ❌ 빌드 에러 발생하는 잘못된 패턴
export async function generateStaticParams() {
  const { auth } = await import('@clerk/nextjs/server'); // 빌드 에러!
  const { userId } = await auth(); // request context 없음
}

export async function generateMetadata() {
  const { auth } = await import('@clerk/nextjs/server'); // 빌드 에러!
  const supabase = await createServerSupabaseClient(); // 내부적으로 auth() 호출
}
```

#### 올바른 빌드 타임 패턴
```typescript
// ✅ 빌드 타임: 공개 anon 클라이언트만 사용
export async function generateStaticParams() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // 공개 데이터만 조회 (인증 없음)
  const { data: posts } = await supabase
    .from('posts')
    .select('slug')
    .eq('status', 'published');
    
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  // 동일한 패턴: 공개 클라이언트만 사용
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### 런타임 함수들 (Clerk auth() 사용 가능)
```typescript
// ✅ 런타임: 인증된 서버 클라이언트 사용 가능
export default async function Page({ params }) {
  const { userId } = await auth(); // 런타임에서는 가능
  const supabase = await createServerSupabaseClient(); // 내부적으로 auth() 사용
  
  // 인증된 사용자 기반 데이터 조회
  const { data } = await supabase.from('posts').select('*');
}

// API 라우트에서도 가능
export async function GET() {
  const { userId } = await auth(); // 가능
  const supabase = await createServerSupabaseClient(); // 가능
}
```

### Supabase 클라이언트 사용 패턴 정리

| 컨텍스트 | 사용할 클라이언트 | auth() 사용 | 용도 |
|---------|-----------------|------------|-----|
| 빌드 타임 함수 | 공개 anon 클라이언트 | ❌ 금지 | 정적 페이지 생성 |
| 런타임 서버 | createServerSupabaseClient | ✅ 가능 | 인증된 서버 로직 |
| 클라이언트 컴포넌트 | useSupabaseClient | N/A | 브라우저 인증 |

### 체크리스트: 빌드 에러 방지

**빌드 전 반드시 확인:**
- [ ] generateStaticParams에서 auth() 사용하지 않았는가?
- [ ] generateMetadata에서 createServerSupabaseClient 사용하지 않았는가?
- [ ] 빌드 타임 함수에서는 공개 anon 클라이언트만 사용했는가?
- [ ] 런타임 함수에서만 인증 로직을 사용했는가?

**에러 발생 시 해결 방법:**
1. 빌드 타임 함수에서 auth() 제거
2. 공개 anon 클라이언트로 교체
3. 인증이 필요한 로직은 런타임 함수로 이동

## 📝 표준 프롬프트 템플릿 (AI 실수 방지용)

### Next.js + Supabase 연동 프롬프트 작성 시 필수 포함 사항

**모든 페이지 구현 프롬프트에 반드시 포함할 내용:**

```markdown
**⚠️ 빌드 타임 vs 런타임 함수 구분 (필수):**

**빌드 타임 함수들 (auth() 사용 절대 금지):**
- generateStaticParams
- generateMetadata

**기술적 요구사항:**
- **빌드 타임 함수:**
  ```typescript
  // ✅ 반드시 이 패턴 사용
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  ```

- **런타임 함수 (페이지 컴포넌트, API 라우트):**
  ```typescript  
  // ✅ 인증 필요한 경우만 사용
  const supabase = await createServerSupabaseClient();
  const { userId } = await auth();
  ```

- **절대 금지사항:**
  - generateStaticParams에서 auth() 사용
  - generateMetadata에서 createServerSupabaseClient 사용
  - 빌드 타임 함수에서 인증 관련 로직 사용

**완료 기준에 반드시 포함:**
- [ ] 빌드 에러 없이 정상 컴파일
- [ ] generateStaticParams에서 공개 클라이언트만 사용
- [ ] 런타임에서만 인증 로직 사용
```

### 프롬프트 검토 체크리스트

**프롬프트 작성 후 반드시 확인:**
- [ ] 빌드 타임 함수에 auth() 사용 지시하지 않았는가?
- [ ] generateStaticParams/generateMetadata에 createServerSupabaseClient 사용 지시하지 않았는가?
- [ ] 빌드 타임과 런타임 구분이 명확한가?
- [ ] 올바른 Supabase 클라이언트 패턴을 제시했는가?
- [ ] "빌드 에러 없이 컴파일" 조건이 완료 기준에 포함되었는가?

이 템플릿을 사용하면 AI가 실수할 확률을 크게 줄일 수 있습니다.