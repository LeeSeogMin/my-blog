- 자료와 동영상화면이 다를 수 있습니다. 자료가 제시하는 순서대로 진행하시면 됩니다.
- 이 강의 자료를 my_blog에 [dev.md](http://dev.md) 파일로 저장하고 시작합니다.
- cursor ai 사용도 권장합니다.

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
**프로젝트 전역 설정:**
- 터미널 명령어: Command Prompt 사용 (PowerShell 사용 금지)
- 파일 생성/수정/삭제: Command Prompt 명령어로 안내
- 대화는 한글로 진행
- TypeScript와 한글 주석 사용
- 기본적인 에러 처리 포함
- 초보자도 이해할 수 있는 수준으로 구현
- 복잡한 고급 기능은 제외하고 기본적인 것만

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

이 설정을 기준으로 앞으로 모든 구현을 진행합니다. 메모리에 저장하고 다음 요청을 대기합니다. 
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

Clerk의 인증 정보를 Supabase RLS(Row Level Security)에서 사용하려면 JWT 토큰을 통해 두 시스템을 연결해야 한다. 이 설정이 없으면 Supabase는 Clerk의 사용자 정보를 인식할 수 없어 RLS 정책이 작동하지 않는다.

 * JWT(JSON Web Token): 전자 신분증

### Clerk에서 Supabase 통합 설정

1. **Clerk Dashboard 접속**:
    - [https://dashboard.clerk.com](https://dashboard.clerk.com/) 에 로그인.
    - 블로그 프로젝트 선택.
2. **Integrations 메뉴 이동**:
    - 좌측 사이드바에서 **"Integrations"** 클릭.
    - **"Supabase"** 통합 선택.
    - **"Enable"** 버튼 클릭.
3. **Development와 Production 인스턴스 설정**:
    - **Select instance**에서 **Development**와 **Production** 인스턴스를 각각 설정:
        - **Development 환경** (테스트용):
            - Development 인스턴스 선택.
            - 통합 활성화 후 Clerk 도메인 확인 (예: [https://thorough-vulture-43.clerk.accounts.dev](https://thorough-vulture-43.clerk.accounts.dev/)).
            - JWKS URL 생성: [https://thorough-vulture-43.clerk.accounts.dev](https://thorough-vulture-43.clerk.accounts.dev/)`/.well-known/jwks.json`.
        - **Production 환경** (실제 배포용):
            - Production 인스턴스 선택.
            - 통합 활성화 후 Clerk 도메인 확인 (예: `https://prod-vulture-43.clerk.accounts.dev`).
            - JWKS URL 생성: `https://prod-vulture-43.clerk.accounts.dev/.well-known/jwks.json`.

### **Supabase에서 JWT 설정**

1. **Supabase Dashboard 접속**:
    - https://supabase.com/dashboard 에 로그인.
2. **Authentication 섹션에서 JWKS URL 설정**:
    - 각 프로젝트에서 설정:
        - **Development 프로젝트** (예: `my-blog-database`):
            1. 좌측 사이드바에서 **Authentication** 메뉴로 이동.
            2. **Sign In / Up** 또는 **Providers** 탭으로 이동.
            3. **Third-Party Auth** 또는 **External Auth Providers** 섹션을 찾음.
            4. **Clerk** 또는 **Custom Provider** 옵션을 선택.
            5. **JWKS URL** 입력란에 Development용 JWKS URL 입력:
                - URL: `https://grand-lion-58.clerk.accounts.dev/.well-known/jwks.json` (현재 Development 도메인 기반).
            6. **Save** 버튼 클릭.
        - **Production 프로젝트** (예: 별도 Production 프로젝트):
            1. 좌측 사이드바에서 **Authentication** 메뉴로 이동.
            2. **Sign In / Up** 또는 **Providers** 탭으로 이동.
            3. **Third-Party Auth** 또는 **External Auth Providers** 섹션을 찾음.
            4. **Clerk** 또는 **Custom Provider** 옵션을 선택.
            5. **JWKS URL** 입력란에 Production용 JWKS URL 입력:
                - URL: `https://prod-vulture-43.clerk.accounts.dev/.well-known/jwks.json` (Production 도메인 기반, 활성화 후 설정).
            6. **Save** 버튼 클릭.
3. **설정 확인**:
    - 각 프로젝트에서:
        - 저장 후 페이지 새로고침하여 설정이 유지되는지 확인.
        - Supabase 클라이언트를 사용해 테스트 쿼리 실행 (예: `supabase.from('tasks').select('*')`)으로 Clerk 인증 토큰이 정상적으로 검증되는지 확인.
        - 필요 시, JWKS URL을 브라우저에서 열어 JSON 응답이 반환되는지 확인 (예: `{"keys": [...]}`)

### 2.6. 환경변수 설정

**✅ 검증 단계:**

1. `.env.local` 파일 확인
2. 환경변수 로드 테스트
3. Supabase 연결 테스트

 **프롬프트:**

```
Next.js 환경변수 확인 페이지를 생성해 주세요.

**현재 상황:**
- Supabase 프로젝트 생성 및 환경변수 설정 완료
- 기본 연결 테스트 필요 (JWT 통합 전)

**구현 대상:**
- 파일 경로: `app/test-supabase/page.tsx`
- 파일 역할: 브라우저에서 Supabase 기본 연결 테스트

**주요 요구사항:**
1. 환경변수 상태 표시
   - NEXT_PUBLIC_SUPABASE_URL 로드 확인
   - NEXT_PUBLIC_SUPABASE_ANON_KEY 로드 확인
   - 마스킹된 값 표시 (보안을 위해 일부만 표시)

2. 기본 Supabase 연결 테스트
   - @supabase/supabase-js의 createClient 직접 사용
   - 버튼 클릭 시 연결 테스트 실행
   - 성공/실패 상태 표시

3. UI 구성
   - 환경변수 상태 카드
   - 연결 테스트 버튼
   - 결과 표시 영역

**기술적 요구사항:**
- 'use client' 컴포넌트로 구현
- createClient를 직접 import하여 사용
- useState로 테스트 상태 관리

**테스트 방법:**
1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 접속: `http://localhost:3000/test-supabase`
3. "연결 테스트" 버튼 클릭
4. 결과 확인

**완료 기준:**
- 환경변수 로드 상태 확인 가능
- Supabase 기본 연결 성공/실패 확인 가능
- JWT 통합은 3.4절 이후에 별도 테스트
```

**테스트 방법: 터미널(cmd)을 열고 아래와 같이 실행합니다.**

1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 접속: `http://localhost:3000/test-supabase`
3. "연결 테스트" 버튼 클릭
4. 결과 확인

## 3. 데이터베이스 테이블 설계 및 생성

### 3.1. 블로그 데이터베이스 스키마 설계

블로그에 필요한 주요 테이블을 설계해보자.

AI에게 간단한 데이터베이스 스키마 설계를 요청한다:

**프롬프트:**

```
간단한 블로그 데이터베이스 스키마를 설계해 주세요.

**현재 상황:**
- Supabase 프로젝트 설정 완료
- PostgreSQL 기반 관계형 데이터베이스 사용
- **Clerk을 통한 사용자 인증 사용 (중요: Supabase 자체 인증이 아님)**

**중요한 제약사항:**
- **auth.uid(), auth.role() 등 Supabase 기본 인증 함수 사용 금지**
- **RLS 정책은 이 파일에 포함하지 않음 (별도 파일에서 관리)**
- **Storage 정책도 포함하지 않음 (별도 파일에서 관리)**
- **사용자 ID는 모두 TEXT 타입으로 설정 (Clerk ID는 문자열)**

**구현 대상:**
- 파일 경로: `docs/database-schema.sql`
- 파일 역할: 블로그에 필요한 테이블 생성 SQL 스크립트

**주요 요구사항:**
1. 필요한 테이블 정의
   - categories: 카테고리 관리
   - posts: 블로그 게시물
   - comments: 댓글
   - likes: 좋아요

2. 각 테이블의 주요 컬럼
   - categories 테이블:
     * id (기본키, UUID)
     * name (카테고리명, 텍스트)
     * slug (URL용 카테고리명, 텍스트, 유니크)
     * description (카테고리 설명, 텍스트, 선택적)
     * created_at (생성일)
     * updated_at (수정일)

   - posts 테이블:
     * id (기본키, UUID)
     * title (제목, 텍스트)
     * content (내용, 텍스트)
     * slug (URL용 제목, 텍스트)
     * cover_image_url (커버 이미지 URL, 텍스트, 선택적)
     * author_id (작성자 ID, **Clerk 사용자 ID 형식: 문자열 타입**)
     * category_id (카테고리 참조, UUID, 선택적)
     * created_at (생성일)
     * updated_at (수정일)

   - comments 테이블:
     * id (기본키, UUID)
     * post_id (게시물 참조)
     * content (댓글 내용)
     * author_id (작성자 ID, **Clerk 사용자 ID 형식: 문자열 타입**)
     * created_at (생성일)

   - likes 테이블:
     * id (기본키, UUID)
     * post_id (게시물 참조)
     * user_id (사용자 ID, **Clerk 사용자 ID 형식: 문자열 타입**)
     * created_at (생성일)

**Clerk 인증 통합 요구사항:**
- **사용자 ID 형식**: Clerk 사용자 ID는 "user_xxxxxxxxxx" 형태의 문자열
- **데이터 타입**: author_id, user_id 컬럼은 TEXT 또는 VARCHAR 타입 사용 (UUID 아님)
- **외래키 제약**: Clerk 사용자는 외부 시스템이므로 외래키 제약조건 설정하지 않음
- **인덱스 설정**: author_id, user_id 컬럼에 인덱스 생성하여 조회 성능 최적화

**기술적 요구사항:**
- PostgreSQL UUID 함수 활용 (테이블 기본키용)
- 기본값 설정 (created_at, updated_at)
- 복잡한 외래키 제약조건은 제외하고 기본적인 구조만
- 각 테이블의 역할 주석 포함
- **Clerk 사용자 ID를 위한 적절한 데이터 타입 사용**

**완료 기준:**
- 모든 테이블이 CREATE TABLE 문으로 정의됨
- Supabase에서 바로 실행 가능한 SQL
- Clerk 인증 시스템과 호환되는 사용자 ID 구조
- 향후 확장 가능한 기본 구조
```

### 3.2. Supabase에서 테이블 생성

AI가 제공한 SQL을 사용하여 Supabase에서 테이블을 생성한다.

1. Supabase 대시보드 → SQL Editor 이동
2. AI가 제공한 CREATE TABLE 문 복사(database-schema.sql)후 붙여넣기
3. 쿼리 실행

테이블 생성 후 Table Editor에서 다음을 확인한다:

- 테이블이 올바르게 생성되었는지
- 각 컬럼의 데이터 타입이 정확한지
- 기본값이 설정되었는지 (created_at 등)

### 3.3. Supabase TypeScript 타입 생성

AI에게 TypeScript 타입 생성을 요청한다:

**프롬프트:**

```
Supabase 데이터베이스의 TypeScript 타입을 정의해 주세요.

**현재 상황:**
- 데이터베이스 테이블 생성 완료 (posts, comments, likes, categories)
- **Clerk 인증 시스템 사용 (사용자 ID는 문자열 형태)**
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
- **사용자 ID 타입**: string (UUID가 아님)
- **Clerk 사용자 타입**: 기본 사용자 정보 인터페이스 포함
- **JWT 클레임 타입**: Clerk JWT 토큰 구조 반영

**기술적 요구사항:**
- 생성된 데이터베이스 스키마와 완전 일치
- Supabase JavaScript 클라이언트와 호환
- **Clerk 타입과 호환성 확보**
- JSDoc 주석으로 각 타입 설명

**완료 기준:**
- 모든 테이블의 타입이 정확히 정의됨
- **Clerk 사용자 ID 타입이 올바르게 string으로 정의됨**
- lib/supabase.ts에서 바로 활용 가능
- TypeScript 컴파일 오류 없음

요청사항만 실행한다.
```

### 3.4. Supabase 클라이언트 설정

AI에게 TypeScript 기반 Supabase 연결 설정을 요청한다:

**프롬프트:**

```
TypeScript 기반 Supabase 클라이언트 설정을 구현해 주세요.

**현재 상황:**
- Supabase 프로젝트 생성 및 환경 변수 설정 완료
- **Clerk JWT 통합을 위한 클라이언트 설정 필요**
- TypeScript 일관성을 위한 타입 안전성 확보 필요

**구현 대상:**
- 파일 경로: `lib/supabase.ts`
- 파일 역할: Clerk JWT 통합된 Supabase 클라이언트 인스턴스

**주요 요구사항:**
1. TypeScript 클라이언트 설정
   - 클라이언트 사이드용 Supabase 인스턴스
   - 서버 사이드용 Supabase 인스턴스 (API 라우트에서 사용)
   - **Clerk JWT 토큰을 Supabase에 전달하는 클라이언트**
   - Database 타입 정의 연동

2. Clerk JWT 통합
   - **클라이언트에서 Clerk 세션 토큰을 Supabase에 자동 전달**
   - **getToken() 함수를 활용한 JWT 토큰 추출**
   - **Supabase RLS에서 Clerk 인증 상태 인식 가능**

3. 타입 안전성 확보
   - 환경 변수 타입 체크
   - Supabase 클라이언트 타입 정의
   - **Clerk 통합 타입 정의**
   - 에러 처리 기본 구조

4. 사용 용도별 인스턴스 분리
   - **Clerk 인증 정보가 포함된 클라이언트 인스턴스**
   - API 라우트에서 사용할 관리자 권한 인스턴스
   - 각 인스턴스의 사용 용도와 차이점 주석 설명

**Clerk 통합 기술 요구사항:**
- **@clerk/nextjs의 useAuth 훅 활용**
- **getToken('supabase') 메서드로 JWT 토큰 추출**
- **createClient 옵션에서 JWT 토큰 설정**
- **실시간 토큰 갱신 지원**

**기술적 요구사항:**
- TypeScript 타입 정의 완전 활용
- 환경 변수 존재 여부 확인
- **Clerk JWT 템플릿 'supabase' 사용**
- 이해하기 쉬운 한글 주석 추가

**완료 기준:**
- **Clerk 인증 상태가 Supabase RLS에서 인식됨**
- 클라이언트/서버 양쪽에서 사용 가능한 인스턴스
- **JWT 토큰 자동 갱신 및 전달**
- TypeScript 컴파일 오류 없음
- **RLS 정책에서 auth.jwt() 함수 정상 작동**

요청사항만 실행한다.
```

### 3.5. Row Level Security 기본 설정

Supabase는 기본적으로 모든 테이블에 Row Level Security(RLS)가 활성화되어 있다. 이는 보안을 위한 기능이지만, 초기 개발 단계에서는 복잡할 수 있다.

AI에게 기본적인 RLS 설정을 요청한다:

**프롬프트:**

```
블로그 테이블을 위한 Clerk 인증 통합 RLS 정책을 설정해 주세요.

**현재 상황:**
- posts, comments, likes, categories 테이블 생성 완료
- Supabase Storage에 'blog-images' 버킷 생성 예정
- **Clerk을 통한 사용자 인증 사용 (Supabase 자체 인증 아님)**
- **Clerk JWT를 Supabase에서 인식하도록 완전 통합 구현**

**중요한 구현 방법:**
- **사용자 ID 추출**: `current_setting('request.jwt.claims', true)::json->>'sub'`
- **Storage owner 필드**: 업로드한 사용자의 Clerk ID가 자동 저장됨
- **버킷 설정**: `public = true`로 설정하여 이미지 URL 직접 접근 가능
- **파일 확장자 제한**: jpg, jpeg, png, gif, webp만 허용

**구현 대상:**
- 파일 경로: `docs/rls-policies.sql`
- 파일 역할: Clerk 인증 기반 Row Level Security 정책 SQL 스크립트

**주요 요구사항:**
1. 데이터베이스 테이블 RLS 정책 (Clerk 인증 기반)
   - 모든 사용자가 게시물, 댓글, 좋아요 목록을 읽을 수 있음 (SELECT)
   - **Clerk 인증된 사용자만** 게시물을 작성할 수 있음 (INSERT)
   - **Clerk 인증된 사용자만** 댓글을 작성할 수 있음 (INSERT)
   - **Clerk 인증된 사용자만** 좋아요를 누를 수 있음 (INSERT)
   - **게시물 작성자만** 자신의 게시물을 수정/삭제 가능 (UPDATE, DELETE)
   - **댓글 작성자만** 자신의 댓글을 수정/삭제 가능 (UPDATE, DELETE)
   - **좋아요를 누른 사용자만** 자신의 좋아요를 삭제 가능 (DELETE)
   - 모든 사용자가 카테고리 목록을 읽을 수 있음 (SELECT)
   - **Clerk 인증된 사용자만** 카테고리를 생성할 수 있음 (INSERT)

2. Storage 버킷 RLS 정책 (blog-images 버킷)
   - **Clerk 인증된 사용자만** 'blog-images' 버킷에 파일을 업로드할 수 있음 (INSERT)
   - 'blog-images' 버킷에 업로드되는 파일 형식을 jpg, jpeg, png, gif, webp로 제한
   - **모든 사용자가** 'blog-images' 버킷의 파일을 읽을 수 있음 (SELECT)
   - **파일 업로드한 사용자만** 자신의 파일을 삭제할 수 있음 (DELETE)

**Clerk JWT 인증 조건:**
- **JWT 토큰 검증**: `auth.jwt() ->> 'sub' IS NOT NULL`
- **사용자 ID 매칭**: `auth.jwt() ->> 'sub' = author_id`
- **인증 역할 확인**: `auth.jwt() ->> 'role' = 'authenticated'`
- **이메일 검증**: `auth.jwt() ->> 'email_verified' = 'true'` (선택적)

**기술적 요구사항:**
- **Clerk JWT 클레임 활용**: `auth.jwt()` 함수로 토큰 정보 추출
- **사용자 ID 형식**: Clerk 사용자 ID는 문자열 형태 ("user_xxxxxxxxxx")
- **보안 우선**: 인증되지 않은 사용자는 읽기만 가능
- **소유권 검증**: 작성자만 자신의 콘텐츠 수정/삭제 가능
- 각 정책의 역할을 설명하는 **한글 주석** 포함

**RLS 정책 예시:**
```sql
-- Clerk 인증된 사용자만 게시물 작성 가능
CREATE POLICY "Clerk 인증 사용자 게시물 작성" ON posts
FOR INSERT WITH CHECK (
    auth.jwt() ->> 'sub' IS NOT NULL AND
    auth.jwt() ->> 'role' = 'authenticated' AND
    auth.jwt() ->> 'sub' = author_id
);

-- 게시물 작성자만 자신의 게시물 수정 가능
CREATE POLICY "게시물 작성자만 수정 가능" ON posts
FOR UPDATE USING (
    auth.jwt() ->> 'sub' = author_id
) WITH CHECK (
    auth.jwt() ->> 'sub' = author_id
);

-- Clerk 인증된 사용자만 이미지 업로드 가능
CREATE POLICY "Clerk 인증 사용자 이미지 업로드" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'blog-images' AND
    auth.jwt() ->> 'sub' IS NOT NULL AND
    auth.jwt() ->> 'role' = 'authenticated' AND
    (storage.extension(name) = 'jpg' OR
     storage.extension(name) = 'jpeg' OR
     storage.extension(name) = 'png' OR
     storage.extension(name) = 'gif' OR
     storage.extension(name) = 'webp')
);
```

**완료 기준:**
- **완전한 Clerk 인증 통합**: JWT 토큰 기반 권한 제어
- **프로덕션 준비**: 실제 운영 환경에서 사용 가능한 보안 수준
- **소유권 기반 권한**: 사용자는 자신의 콘텐츠만 관리 가능
- **파일 보안**: 인증된 사용자만 파일 업로드, 형식 제한 적용
- Supabase SQL Editor에서 바로 실행 가능
- **Clerk JWT 설정 완료 후** 모든 기능 정상 작동
```

AI가 제공한 RLS 정책을 Supabase에서 실행한다:

1. **Supabase 대시보드 접속:** Supabase 계정으로 로그인하고 해당 프로젝트 선택
2. **SQL Editor 이동:** 좌측 사이드바에서 **"SQL Editor"** 아이콘을 클릭
3. **SQL 쿼리 실행:**
    - AI가 docs/rls-policies.sql 파일에 제공한 CREATE POLICY SQL 쿼리들을 복사하여 SQL Editor의 텍스트 영역에 붙여넣기
    - 모든 쿼리를 붙여 넣은 후, **"Run"** 또는 **"RUN"** 버튼을 클릭하여 쿼리를 실행

**RLS 정책 적용 확인:**

- 좌측 사이드바에서 **"Authentication"** (인증) 섹션으로 이동
- 하위 메뉴에서 **"Policies"** (정책) 클릭
- 여기서 posts, comments, likes 각 테이블에 대해 방금 적용한 RLS 정책들이 올바르게 추가되었는지 확인

## 잠깐! “나의 블로그 보호 지침" 프롬프트

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
   - 제목 입력 시 slug 자동 생성
   - 폼 검증 (필수 필드 체크)
   - 저장 시 데이터 콜솔 출력 (실제 저장은 다음 단계)

**기술적 요구사항:**
- 'use client' 컴포넌트로 구현
- useState로 폼 상태 관리
- TypeScript 타입 정의 활용
- ShadCN UI 컴포넌트 활용 (Button, Input, Textarea, Select)
- Select 컴포넌트 사용 시 주의사항:
  * SelectItem에 빈 문자열("")을 value로 사용하면 안 됨
  * 카테고리가 없는 경우 "none"과 같은 특정 값을 사용하고, 내부적으로 처리
  * 예: `<SelectItem value="none">카테고리 없음</SelectItem>`

4. 폼 데이터 처리
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

### **현재 구현 완료된 기능들**

**✅ 완전히 작동 가능한 기능들**

1. **Supabase 연결 및 설정**
- 환경변수 설정 완료
- 데이터베이스 연결 테스트 가능
- 접속: http://localhost:3000/test-supabase

1. **이미지 업로드 시스템**
- Supabase Storage 'blog-images' 버킷 연동
- 완전한 이미지 업로드 기능 (파일 검증, 고유명 생성, URL 반환)
- 테스트 페이지: http://localhost:3000/test-upload

1. **게시물 작성 폼 UI**
- 제목, 슬러그, 카테고리, 커버이미지, 내용 입력
- 폼 검증 및 에러 처리
- 이미지 업로드 통합
- 테스트 페이지: http://localhost:3000/admin/post/new

```jsx
가끔씩 브라우저와 vscode를 새로 시작해주세요. 
프로젝트 전역 설정을 지금 한번 더 해주세요: ai의 기억력 한계
```

# 5. Supabase TypeScript 클라이언트를 활용한 CRUD 구현 및 즉시 테스트

이 부분에서 백엔드 완성합니다.

**CRUD**는 데이터베이스 기본 작업 4가지를 나타내는 약어

| 약어 | 영어 | 한국어 | 데이터베이스 | HTTP 메서드 |
| --- | --- | --- | --- | --- |
| **C** | Create | 생성 | INSERT | POST |
| **R** | Read | 읽기/조회 | SELECT | GET |
| **U** | Update | 수정 | UPDATE | PUT |
| **D** | Delete | 삭제 | DELETE | DELETE |

### 5.1. 게시물 API 라우트 구현

이제 Supabase TypeScript 클라이언트를 직접 사용하여 데이터베이스 작업을 수행한다.

AI에게 게시물 CRUD API 구현을 요청한다:

```
사용자(브라우저) → API 라우트 → Supabase 데이터베이스

```

- **사용자**: "게시물 목록 보여줘"
- **API 라우트**: 요청을 받아서 데이터베이스에 쿼리
- **데이터베이스**: 게시물 데이터 반환
- **API 라우트**: 사용자에게 데이터 전달

**주의 사항 프롬프트**

```jsx
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
```

**기술적 요구사항:**
- lib/supabase.ts에서 생성한 클라이언트 사용
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

**확인 사항:**

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
- 카테고리 JOIN 쿼리
- TypeScript 타입 안전성

**완료 기준:**

- slug로 게시물 정확히 조회
- 카테고리 정보 포함
- 404 처리 정상 작동

요청사항만 실행한다. 
```

## 6. 블로그 페이지 데이터베이스 연동

### 6.1. 관리자 게시물 작성 페이지 구현

AI에게 관리자 페이지 구현을 요청한다:

**프롬프트:**

```
관리자가 게시물을 작성할 수 있는 페이지를 구현해 주세요.

**현재 상황:**
- 게시물 CRUD API 구현 완료
- 이미지 업로드 컴포넌트 구현 완료
- 카테고리 API 구현 완료

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

**구현 대상:**
- 파일 경로: `app/page.tsx` (기존 파일 수정)
- 파일 역할: 데이터베이스 기반 홈페이지

**주요 요구사항:**
1. MOCK 데이터 완전 제거
   - mockData.ts import 제거
   - 모든 mock 함수 호출 제거

2. 실제 데이터베이스 연동
   - Supabase 클라이언트 직접 사용
   - 최신 게시물 3개 조회
   - 카테고리 목록 조회

3. 빈 상태 처리
   - 게시물이 없을 때 안내 메시지
   - 관리자 페이지로 유도 버튼

**기술적 요구사항:**
- 서버 컴포넌트에서 직접 Supabase 쿼리
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

요청사항만 실행한다. 
```

### 6.3. 게시물 목록 페이지 실제 API 연동

**프롬프트:**

```
게시물 목록 페이지를 실제 데이터베이스와 연동해 주세요.

**현재 상황:**
- 게시물 목록 페이지가 mockData 사용 중
- 게시물 API 구현 완료

**구현 대상:**
- 파일 경로: `app/posts/page.tsx` (기존 파일 수정)
- 파일 역할: 데이터베이스 기반 게시물 목록

**주요 요구사항:**
1. MOCK 데이터 제거
   - mockData import 및 사용 코드 제거

2. 실제 데이터베이스 연동
   - Supabase에서 모든 게시물 조회
   - 카테고리 정보 포함 (join)
   - 최신순 정렬

3. 기존 PostCard 컴포넌트 활용
   - 데이터 구조 맞춤 변환
   - 타입 안전성 확보

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

**구현 대상:**
- 파일 경로: `app/posts/[slug]/page.tsx` (기존 파일 수정)
- 파일 역할: 데이터베이스 기반 게시물 상세 페이지

**주요 요구사항:**
1. MOCK 데이터 제거
   - mockData 관련 코드 완전 제거

2. 실제 데이터베이스 연동
   - slug로 게시물 조회
   - 카테고리 정보 포함
   - 존재하지 않는 게시물은 notFound() 처리

3. 동적 기능
   - generateStaticParams로 정적 페이지 생성
   - 메타데이터 동적 생성

**완료 기준:**
- URL의 slug로 실제 게시물 조회
- 커버 이미지 정상 표시
- 404 페이지 정상 작동

요청사항만 실행한다. 

```

### 6.5. 카테고리 페이지들 실제 API 연동

**프롬프트:**

```
카테고리 관련 페이지들을 실제 데이터베이스와 연동해 주세요.

**구현 대상:**
1. `app/categories/page.tsx` - 카테고리 목록
2. `app/categories/[slug]/page.tsx` - 카테고리별 게시물

**주요 요구사항:**
1. 카테고리 목록 페이지
   - MOCK 데이터 제거
   - 실제 카테고리 목록 조회
   - 각 카테고리의 게시물 개수 표시

2. 카테고리별 게시물 페이지
   - slug로 카테고리 조회
   - 해당 카테고리의 게시물만 필터링
   - generateStaticParams 구현

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

## 7. 최종 검증: 10장 전체 기능 테스트

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

## 8. 진행 상황 저장 (GitHub 커밋)

Vs-Code의 Source Control을 활용한다. 

## 9. 마무리

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
- PostgreSQL 문서: https://www.postgresql.org/docs</parameter>