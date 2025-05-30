# 11장 AI 주도 웹 프로그래밍: 댓글 완성 및 배포

10장 완성을 실패하신 분에게는

**두 가지 방법이 있습니다.** 

1. 지금까지 성공한 수강생은 본인의 코드로 계속합니다. 
2. 실패한 분들은 아래와 같이 실행하여 코드를 다운받아 실습을 계속합니다:   이 코드는 DB 연결이 완성된 파일입니다. 

```
# 1. 현재 위치 확인 (웹 폴더로 이동)
cd C:\web

# 2. 기존 my_blog 폴더가 있다면 삭제(직접 삭제 가능): 단. env.local 파일은 별도 복사해놓으세요.
C:\web>rmdir /s /q my_blog

# 3. GitHub에서 클론하여 my_blog 폴더에 저장
git clone -b feature/blog-system-with-auth https://github.com/LeeSeogMin/my-blog.git my_blog

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

# 1. 댓글 시스템 데이터베이스 통합 완성

## 1.1. 현재 상황 분석

10장에서 게시물과 카테고리의 데이터베이스 연동을 완료했지만, 8-9장에서 구현한 댓글 시스템은 여전히 로컬 스토리지를 사용하고 있다. 11장에서는 댓글 시스템을 완전히 데이터베이스와 통합하여 다음과 같은 기능을 완성한다:

- **영구 데이터 저장**: 댓글이 데이터베이스에 안전하게 저장됨
- **사용자 간 공유**: 모든 사용자가 동일한 댓글을 확인 가능
- **인증 통합**: Clerk 사용자 정보와 댓글 작성자 연동
- **권한 관리**: 본인이 작성한 댓글만 수정/삭제 가능

## 1.2. 프로젝트 전역 설정

새로운 대화 세션에서 11장을 시작할 때 다음 설정을 적용한다:

[**dev.md](http://dev.md/) 프롬프트:**  "11장 AI 주도 웹 프로그래밍: 소셜 기능 완성 및 배포" 자료에서 4절까지 복사하여 붙여 넣는다.

```jsx
현재 프로젝트 파일을 검토하고 검토한다.
dev.md 파일을 검토하고 이제 시작해야 할 작업의 성격을 검토한다.
다음 요청을 받을때까지 대기한다.
```

**프롬프트 전역설정:**

```
프로젝트 전역 설정:
- 터미널 명령어: Command Prompt 사용 (PowerShell 사용 금지)
- 파일 생성/수정/삭제: Command Prompt 명령어로 안내
- 대화는 한글로 진행
- TypeScript와 한글 주석 사용
- 기본적인 에러 처리 포함
- 초보자도 이해할 수 있는 수준으로 구현
- 복잡한 고급 기능은 제외하고 기본적인 것만

AI 실수 방지 체크리스트:
✓ Next.js App Router 경로 구조 정확히 사용 (app/ 디렉토리 기준)
✓ 'use client' 지시문 필요한 컴포넌트에만 추가
✓ import 경로는 절대경로(@/) 또는 상대경로 일관성 유지
✓ TypeScript 타입 정의 누락 없이 구현
✓ 존재하지 않는 라이브러리나 컴포넌트 사용 금지
✓ 복잡한 상태 관리나 최적화 기법 사용 금지

프로젝트 맥락 정보:
- 8장 완료: 기본 블로그 구조, 댓글 시스템(로컬 스토리지), 좋아요 기능(로컬)
- 9장 완료: Clerk 인증 시스템 통합, 권한 기반 댓글 관리
- 10장 완료: Supabase 데이터베이스 연동, 게시물 CRUD, 이미지 업로드
- 현재 사용 중: Next.js 15, TypeScript, TailwindCSS, ShadCN UI, Clerk, Supabase
- 11장 목표: 댓글/좋아요 데이터베이스 통합, 소셜 기능 완성, Vercel 배포

이 설정을 기준으로 앞으로 모든 구현을 진행합니다. 대기합니다.

```

## 1.3. 댓글 컴포넌트 렌더링 사전 점검

데이터베이스 연동 작업을 시작하기 전에 기존 댓글 UI가 실제로 화면에 표시되는지 확인하는 단계다. 종종 댓글 컴포넌트가 게시물 상세 페이지에 import되지 않았거나 렌더링되지 않아서 "댓글 시스템은 곧 추가될 예정입니다" 같은 안내 문구만 보이는 경우가 있다. 이를 미리 점검하여 댓글 입력폼과 목록이 정상적으로 보이도록 수정한다.

**댓글 컴포넌트 렌더링 사전 점검 및 수정 요청:**

```
댓글 컴포넌트 렌더링 사전 점검 및 수정 요청

목적:
- 댓글 시스템을 데이터베이스에 연동하기 전에,
  댓글 컴포넌트(CommentSection 등)가 실제로 게시물 상세 페이지(예: app/posts/[slug]/page.tsx)에 정상적으로 렌더링되고 있는지를 반드시 점검해 주세요.
- 만약 렌더링되지 않거나 안내 문구만 보인다면,
  댓글 컴포넌트를 올바른 위치에 import 및 렌더링하도록 코드를 수정해 주세요.

점검 및 수정 기준:
1. 점검 대상
   - 게시물 상세 페이지(app/posts/[slug]/page.tsx) 하단에
     댓글 입력 폼, 댓글 목록 등 댓글 UI가 실제로 보이는지 확인
2. 정상 동작 기준
   - 로그인 시 댓글 입력 폼이 보이고,
   - 댓글 목록(더미 데이터 또는 로컬/DB 연동 전 데이터)이 정상적으로 렌더링되어야 함
3. 이상 현상
   - "댓글 시스템은 곧 추가될 예정입니다" 등 안내 문구만 보이고,
   - 댓글 입력 폼/목록이 전혀 보이지 않는 경우
4. 수정 방법
   - 댓글 컴포넌트(CommentSection 등)가 import되어 있는지 확인
   - 실제로 JSX 내에 `<CommentSection postId={post.id} postTitle={post.title} />` 등으로 렌더링되어 있는지 확인
   - 누락되어 있다면, 적절한 위치(예: 포스트 본문 하단)에 추가

완료 기준:
- 댓글 컴포넌트가 게시물 상세 페이지에서 정상적으로 렌더링됨을 직접 확인
- 이상이 있다면 즉시 코드 수정 후, 정상 렌더링을 확인

```

## 1.4. 댓글 API 라우트 구현

로컬 스토리지 대신 Supabase 데이터베이스와 통신할 수 있는 서버 API 엔드포인트를 구축한다. 댓글 조회(GET), 작성(POST), 수정(PUT), 삭제(DELETE)를 위한 RESTful API를 구현하며, Clerk 인증과 연동하여 권한 관리를 포함한다. 특히 API 응답 구조를 일관되게 유지하고, 데이터베이스 필드명(snake_case)과 프론트엔드 간의 변환을 고려한다.

```jsx
RESTful API는 웹에서 데이터를 요청하는 약속된 방법이다.

4가지 기본 동작:
GET = "보여줘" (데이터 가져오기)
POST = "만들어줘" (새 데이터 추가)
PUT = "고쳐줘" (기존 데이터 수정)
DELETE = "지워줘" (데이터 삭제)

쉬운 예시:
GET /api/comments     → "댓글들 보여줘"
POST /api/comments    → "새 댓글 만들어줘"  
PUT /api/comments/5   → "5번 댓글 고쳐줘"
DELETE /api/comments/5 → "5번 댓글 지워줘"
마치 식당에서 "메뉴 보여줘", "피자 만들어줘", "피자 매운맛으로 바꿔줘", "주문 취소해줘" 하는 것과 같다.
```

**댓글 API 라우트 구현 프롬프트:**

```
댓글 시스템을 위한 TypeScript API 라우트를 구현해 주세요.

현재 상황:
- 10장에서 Supabase comments 테이블 생성 완료
- 9장에서 Clerk 인증 시스템 통합 완료
- 8장에서 구현한 로컬 스토리지 댓글 시스템을 데이터베이스로 전환 필요

구현 대상:
- 파일 경로: `app/api/comments/route.ts`
- 파일 경로: `app/api/comments/[id]/route.ts`
- 파일 역할: 댓글 CRUD 작업을 위한 API 엔드포인트

주요 요구사항:
1. app/api/comments/route.ts
   - GET: 특정 게시물의 댓글 목록 조회 (모든 사용자 접근 가능)
     * 응답 형식: `{ comments: Comment[] }` (일관된 구조)
     * 최신순 정렬, 작성자 정보 포함
   - POST: 새 댓글 작성 (Clerk 인증 필수)
     * 응답 형식: `{ comment: Comment }` (일관된 구조)
     * 작성자 ID는 Clerk에서 자동 추출

2. app/api/comments/[id]/route.ts
   - PUT: 댓글 수정 (작성자 본인만 가능)
     * 권한 확인: 댓글 작성자 === 현재 사용자
   - DELETE: 댓글 삭제 (작성자 본인만 가능)
     * 권한 확인: 댓글 작성자 === 현재 사용자

3. 데이터 일관성 및 변환
   - API는 snake_case 필드명 사용 (DB와 일치)
   - 날짜는 ISO 문자열로 응답
   - 프론트엔드에서 camelCase 변환은 별도 처리

4. Clerk 인증 통합
   - auth() 함수를 통한 사용자 인증 확인
   - 사용자 ID와 프로필 정보 연동
   - 인증 실패 시 적절한 오류 응답

기술적 요구사항:
- lib/supabase-server.ts에서 생성한 클라이언트 사용
- Database 타입을 활용한 타입 안전성 확보
- Clerk의 auth() 함수로 인증 처리
- 기본적인 try-catch 에러 처리

완료 기준:
- GET /api/comments?postId=... 로 댓글 조회 가능
- POST /api/comments 로 댓글 작성 가능 (인증 필요)
- PUT/DELETE 작성자 권한 확인 정상 동작
- 모든 응답이 일관된 구조로 반환
- TypeScript 컴파일 오류 없음

요청사항만 실행하고 수정한다.

```

## 1.5. 댓글 컴포넌트 데이터베이스 연동

8-9장에서 구현한 로컬 스토리지 기반 댓글 컴포넌트를 API 기반으로 전환한다. 로컬 스토리지 대신 fetch API를 사용하여 서버와 통신하며, 데이터 변환 함수를 통해 API 응답을 프론트엔드 타입으로 변환한다. Clerk 인증 상태에 따른 UI 분기와 본인 댓글 판별 로직을 강화하고, 에러 처리 및 로딩 상태 표시를 개선한다.

**댓글 컴포넌트 데이터베이스 연동 프롬프트:**

```
기존 댓글 컴포넌트를 데이터베이스 연동으로 업그레이드해 주세요.

현재 상황:
- 댓글 API 라우트 구현 완료
- 8-9장에서 구현한 로컬 스토리지 기반 댓글 컴포넌트 존재
- Clerk 인증 상태 관리 기능 존재

구현 대상:
- 파일 경로: `components/blog/comment-section.tsx` (기존 파일 수정)
- 파일 역할: 데이터베이스 기반 댓글 표시 및 작성

주요 요구사항:
1. 데이터 소스 변경
   - 로컬 스토리지에서 API 호출로 변경
   - 댓글 조회, 작성, 수정, 삭제를 모두 API 통해 처리
   - 실시간 데이터 동기화

2. 데이터 변환 및 타입 일치
   - API 응답(snake_case, ISO 날짜)을 프론트엔드 타입으로 변환
   - 변환 함수: `convertCommentFromApi(data)` 구현 및 사용
   - 타입 안전성 확보

3. API 호출 일관성
   - 댓글 목록: GET `/api/comments?postId=...`
   - 댓글 작성: POST `/api/comments`
   - 댓글 수정: PUT `/api/comments/[id]` (단일 댓글)
   - 댓글 삭제: DELETE `/api/comments/[id]` (단일 댓글)
   - 배열 전체를 POST로 보내는 방식 금지

4. 본인 댓글 판별 및 권한 관리
   - Clerk userId와 댓글 userId 비교
   - 본인 댓글에만 수정/삭제 버튼 표시
   - 권한 없는 사용자의 접근 차단

5. 기존 UI 구조 유지
   - 9장에서 구현한 인증 기반 UI 구조 보존
   - SignedIn/SignedOut 컴포넌트 활용 유지
   - 작성자 정보 표시 로직 유지

6. 에러/로딩/UX 처리 강화
   - API 요청 실패 시 구체적인 한글 에러 메시지
   - 로딩 상태 명확 표시
   - 빈 댓글 목록에 대한 안내 메시지
   - 네트워크 오류 등 예외 상황 처리

기술적 요구사항:
- 'use client' 컴포넌트로 구현
- useState, useEffect로 상태 관리
- Clerk의 useUser() 훅 활용
- fetch API로 서버와 통신
- 데이터 변환 함수 반드시 사용

완료 기준:
- 댓글 목록이 데이터베이스에서 정상 로드
- 댓글 작성 시 데이터베이스에 저장
- 본인 댓글에만 수정/삭제 버튼 표시
- 모든 CRUD 작업 정상 동작
- API와 프론트엔드 타입 일치
- 에러/로딩 상태 명확한 사용자 안내

요청사항만 실행하고 수정한다.

```

## 1.6. 댓글 수정 기능 구현

사용자가 자신의 댓글을 인라인으로 수정할 수 있는 기능을 추가한다. 수정 버튼 클릭 시 댓글 내용이 텍스트 영역으로 변경되고, 저장/취소 버튼이 나타나는 인라인 편집 UI를 구현한다. PUT API를 정확히 사용하여 단일 댓글을 수정하며, 작성자 권한 확인과 적절한 에러 처리를 포함한다.

**댓글 수정 기능 구현 프롬프트:**

```
댓글 수정 기능을 구현해 주세요.

현재 상황:
- 댓글 컴포넌트 데이터베이스 연동 완료
- 댓글 수정을 위한 UI 및 API 통합 필요

구현 대상:
- 파일 경로: `components/blog/comment-edit-form.tsx` (새로 생성)
- 파일 역할: 댓글 인라인 수정 폼

주요 요구사항:
1. 인라인 편집 UI
   - 수정 버튼 클릭 시 댓글 내용이 텍스트 영역으로 변경
   - 저장/취소 버튼 표시
   - 수정 중 다른 댓글은 일반 표시 유지

2. API 호출 방식 정확성
   - PUT `/api/comments/[id]` 엔드포인트 사용
   - 단일 댓글 ID로 요청
   - 배열이나 다른 방식 사용 금지

3. 수정 처리 로직
   - API를 통한 댓글 업데이트
   - 성공 시 수정된 내용으로 즉시 업데이트
   - 실패 시 원본 내용으로 복원
   - 구체적인 에러 메시지 표시

4. 사용자 경험 개선
   - 수정 중 로딩 상태 표시
   - 수정 취소 시 원본 내용 복원
   - 키보드 단축키 지원 (ESC: 취소, Ctrl+Enter: 저장)

기술적 요구사항:
- 기존 CommentItem 컴포넌트와 통합
- 조건부 렌더링으로 편집 모드/일반 모드 전환
- 기본적인 폼 검증 (빈 내용 방지)
- 데이터 변환 함수 사용

완료 기준:
- 본인 댓글에서 수정 기능 정상 동작
- PUT API 호출 방식 정확 구현
- 수정 중/후 UI 상태 변화 자연스러움
- 다른 사용자는 수정 기능 접근 불가
- 에러 상황 적절한 처리

요청사항만 실행하고 수정한다.

```

## 1.7. 통합 작업 및 최종 검증

개별적으로 구현된 댓글 관련 기능들을 하나의 완성된 시스템으로 통합한다. 한 번에 하나의 댓글만 편집 가능하도록 상태를 관리하고, 수정 성공 시 목록에 즉시 반영되는 실시간 동기화를 구현한다. 모든 상태 변화(저장/취소/에러)가 자연스럽게 처리되도록 UI 분기 로직을 완성한다.

**댓글 수정 기능 통합 작업 프롬프트:**

```
댓글 수정 기능 통합 작업을 진행해 주세요.

현재 상황:
- 댓글 API 라우트, 댓글 컴포넌트(fetch 기반), 인라인 수정 폼(comment-edit-form.tsx)까지 구현 완료
- 하지만, 댓글 수정 기능이 실제로 UI에 자연스럽게 통합되어 있지 않음
- 본인 댓글에서만 인라인 수정이 자연스럽게 동작하고, 저장/취소/동기화가 완벽하게 구현되어야 함

구현 대상:
- 파일 경로: `components/blog/comment-section.tsx` (기존 파일 수정)
- 파일 경로: `components/blog/comment-item.tsx` (기존 파일 수정, 필요시)
- 파일 역할: 댓글 인라인 수정 기능의 UI/상태/동기화 통합

주요 요구사항:
1. 상태 관리
   - 한 번에 하나의 댓글만 편집 가능(편집 중인 댓글 id 상태 관리)
   - 저장/취소 시 편집 모드 해제 및 목록 동기화

2. UI 분기
   - 본인 댓글에서만 수정 버튼 노출
   - 수정 버튼 클릭 시 해당 댓글이 인라인 편집 폼(comment-edit-form.tsx)으로 전환
   - 저장/취소 시 원래 댓글 UI로 자연스럽게 복귀

3. 동기화 및 UX
   - 수정 성공 시 목록에 즉시 반영(실시간 동기화)
   - 수정 실패 시 에러 메시지 표시 및 원본 내용 복원
   - 수정 중 로딩 상태 표시, ESC/단축키 등 UX 반영

4. 기타
   - 기존 UI/로직 최대한 유지
   - TypeScript 타입 안전성, 한글 주석, 기본 에러 처리

완료 기준:
- 본인 댓글에서만 수정 기능이 자연스럽게 동작
- 저장/취소/에러 등 모든 상태 변화가 자연스럽고 실시간으로 반영
- 댓글 수정 기능 요구사항을 100% 충족

요청사항만 실행하고 수정한다.

```

## 1.8. 정적 생성 함수 인증/클라이언트 사용 사전 점검

Next.js 빌드 에러를 방지하기 위한 코드 점검 단계다. `generateStaticParams`, `generateMetadata` 등의 정적 생성 함수에서 Clerk의 `auth()` 함수나 인증이 필요한 Supabase 클라이언트를 사용하면 "headers was called outside a request scope" 에러가 발생한다. 이러한 문제를 미연에 방지하기 위해 전체 코드를 점검하고 필요시 수정한다.

```jsx
정적 생성 함수는 웹사이트를 만들 때 미리 실행되는 코드다.

비유로 설명:
웹사이트 = 책
정적 생성 함수 = 책을 인쇄하기 전에 목차를 만드는 작업
사용자 = 책을 읽는 사람

핵심:
책을 인쇄할 때 목차가 만들어짐 (빌드할 때 실행)
독자가 읽을 때가 아님 (사용자 접속할 때가 아님)
따라서 "독자가 누구인지" 알 수 없음 (로그인 정보 없음)
```

**정적 생성 함수 점검 프롬프트:**

```
아래의 기준에 따라 코드 전체를 점검해 주세요.

점검 목적:
- Next.js App Router 프로젝트에서 정적 생성 함수(`generateStaticParams`, `generateMetadata`, `getStaticProps` 등)에서 Clerk의 `auth()` 함수 또는 인증이 필요한 Supabase 클라이언트(`createServerSupabaseClient`)가 사용되고 있는지 사전에 점검하여,
  "headers was called outside a request scope"와 같은 런타임 오류를 미연에 방지하고자 합니다.

점검 기준:
1. 정적 생성 함수 내부에서 아래 코드가 사용되고 있으면 안 됩니다.
   - `auth()` (Clerk 인증 함수)
   - `createServerSupabaseClient()` (Clerk 인증이 필요한 Supabase 클라이언트)
   - 기타 request context가 필요한 인증/세션 관련 함수

2. 정적 생성 함수에서는 반드시 아래 방식만 사용해야 합니다.
   - 인증이 필요 없는 공개 Supabase 클라이언트(`createClient<Database>(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)`)
   - 인증/사용자 정보가 필요한 코드는 서버 컴포넌트/라우트에서만 사용

점검 요청:
- app 디렉토리 전체에서
  - `generateStaticParams`
  - `generateMetadata`
  - `getStaticProps`
  - `getServerSideProps`
  - 기타 정적 생성 함수
- 내부에서 Clerk의 `auth()` 또는 `createServerSupabaseClient()`가 사용되고 있는지 모두 점검해 주세요.
- 만약 사용되고 있다면, 인증이 필요 없는 공개 클라이언트로 대체하거나, 인증이 필요한 코드는 서버 컴포넌트/라우트로 옮겨주세요.

완료 기준:
- 정적 생성 함수에서 인증/세션이 필요한 코드가 전혀 사용되지 않음
- 빌드 및 런타임에서 "headers was called outside a request scope" 오류가 발생하지 않음

```

## 1.9. 간단한 확인: 댓글 시스템

브라우저에서 다음 2가지만 확인한다:

1. **데이터베이스 연동 확인**
    - 댓글 작성 후 페이지 새로 고침해도 댓글이 유지되는가?
    - 다른 브라우저에서 접속해도 댓글이 보이는가?
2. **권한 관리 확인**
    - 로그인한 사용자만 댓글 작성 가능한가?
    - 본인이 작성한 댓글에만 수정/삭제 버튼이 나타나는가?

## 2. “좋아요” 기능 데이터베이스 통합

- 현재 게시물에만 좋아요 기능이 가능하고 댓글에는 기능이 제한된다.

### 2.1. 좋아요 API 라우트 구현

8장에서 구현한 로컬 스토리지 기반 좋아요 기능을 데이터베이스 기반으로 전환하기 위한 서버 API를 구축한다. 좋아요 상태 조회와 토글(추가/제거) 기능을 제공하는 엔드포인트를 구현하며, 중복 좋아요 방지와 동시 접근 시 데이터 일관성을 보장한다. 인증된 사용자만 좋아요를 누를 수 있지만, 전체 좋아요 수는 모든 사용자가 조회할 수 있도록 권한을 설정한다.

**프롬프트:**

```
좋아요 기능을 위한 TypeScript API 라우트를 구현해 주세요.

현재 상황:
- 10장에서 Supabase likes 테이블 생성 완료
- 8장에서 구현한 로컬 스토리지 기반 좋아요 기능을 데이터베이스로 전환 필요

구현 대상:
- 파일 경로: `app/api/likes/route.ts`
- 파일 역할: 좋아요 토글 및 상태 조회 API

주요 요구사항:
1. 좋아요 상태 조회 (GET)
   - 특정 게시물의 전체 좋아요 수 반환
   - 현재 사용자의 좋아요 여부 반환 (인증된 경우)
   - 미인증 사용자도 좋아요 수는 조회 가능

2. 좋아요 토글 (POST)
   - 인증된 사용자만 접근 가능
   - 이미 좋아요가 있으면 제거, 없으면 추가
   - 중복 좋아요 방지 (unique constraint 활용)

3. 응답 형식 통일
   - { liked: boolean, totalLikes: number } 형태
   - 에러 시 적절한 HTTP 상태 코드와 메시지

기술적 요구사항:
- Supabase의 upsert 또는 insert/delete 조합 사용
- Clerk auth() 함수로 사용자 인증 확인
- 트랜잭션 처리로 데이터 일관성 보장

완료 기준:
- GET /api/likes?postId=... 로 좋아요 상태 조회 가능
- POST /api/likes 로 좋아요 토글 가능 (인증 필요)
- 동시 접근 시에도 좋아요 수 정확성 유지

요청사항만 실행하고 수정한다.
```

### 2.2. 좋아요 버튼 컴포넌트 업그레이드

기존 로컬 스토리지 기반 좋아요 버튼을 API 기반으로 업그레이드한다. 컴포넌트 마운트 시 서버에서 실제 좋아요 상태를 가져오고, 클릭 시 서버로 토글 요청을 보낸다. 낙관적 업데이트를 통해 사용자 경험을 개선하되, API 실패 시 원래 상태로 롤백하는 안전장치를 포함한다. 미인증 사용자에게는 로그인 안내를 제공한다.

**프롬프트:**

```
기존 좋아요 버튼 컴포넌트를 데이터베이스 연동으로 업그레이드해 주세요.

현재 상황:
- 좋아요 API 라우트 구현 완료
- 8장에서 구현한 로컬 스토리지 기반 좋아요 버튼 존재
- 게시물 목록과 상세 페이지에서 사용 중

구현 대상:
- 파일 경로: `components/blog/like-button.tsx` (기존 파일 수정)
- 파일 역할: 데이터베이스 기반 좋아요 기능 제공

주요 요구사항:
1. 데이터 소스 변경
   - 로컬 스토리지에서 API 호출로 변경
   - 컴포넌트 마운트 시 서버에서 좋아요 상태 조회
   - 좋아요 클릭 시 서버로 토글 요청

2. 인증 상태 통합
   - Clerk useUser() 훅으로 인증 상태 확인
   - 미인증 사용자에게 로그인 안내 (SignInButton 활용)
   - 인증된 사용자만 좋아요 기능 활성화

3. 사용자 경험 개선
   - 낙관적 업데이트: 클릭 즉시 UI 변경
   - API 실패 시 원래 상태로 롤백
   - 로딩 상태 표시 및 중복 클릭 방지

기술적 요구사항:
- 'use client' 컴포넌트로 구현
- useState, useEffect로 상태 관리
- 기존 UI 디자인 유지 (하트 아이콘, 애니메이션)

완료 기준:
- 페이지 로드 시 실제 좋아요 상태 표시
- 좋아요 클릭 시 데이터베이스에 반영
- 미인증 사용자에게 적절한 안내 제공
- 모든 화면에서 일관된 동작

요청사항만 실행하고 수정한다.
```

### 2.3. 게시물 목록/상세 페이지 좋아요 통합

업그레이드된 좋아요 버튼을 기존 페이지들에 통합한다. 서버에서 게시물 데이터를 조회할 때 좋아요 수도 함께 가져와 초기 로딩 성능을 최적화한다. 클라이언트에서 좋아요 상태가 변경되면 관련된 모든 컴포넌트에 실시간으로 반영되도록 하여, 목록 페이지와 상세 페이지 간 데이터 일관성을 유지한다.

**프롬프트:**

```
게시물 목록과 상세 페이지에 업그레이드된 좋아요 기능을 통합해 주세요.

현재 상황:
- 좋아요 버튼 컴포넌트 데이터베이스 연동 완료
- 10장에서 구현한 게시물 목록/상세 페이지 존재

구현 대상:
- 파일 경로: `app/posts/page.tsx` (기존 파일 수정)
- 파일 경로: `app/posts/[slug]/page.tsx` (기존 파일 수정)
- 파일 역할: 좋아요 기능이 통합된 게시물 표시

주요 요구사항:
1. 서버 사이드 데이터 통합
   - 게시물 조회 시 좋아요 수도 함께 조회
   - 초기 로딩 성능 최적화
   - SEO를 위한 좋아요 수 서버 렌더링

2. 클라이언트 컴포넌트 연동
   - 업그레이드된 LikeButton 컴포넌트 활용
   - 서버에서 가져온 초기 데이터를 LikeButton에 전달
   - 클라이언트 사이드 상태 관리와 서버 데이터 동기화

3. 성능 고려사항
   - 불필요한 API 호출 최소화
   - 좋아요 상태 변경 시 관련 컴포넌트만 리렌더링
   - 기본적인 캐싱 전략 적용

기술적 요구사항:
- 기존 페이지 구조 및 디자인 유지
- TypeScript 타입 안전성 확보
- 서버 컴포넌트와 클라이언트 컴포넌트 적절한 분리

완료 기준:
- 목록 페이지에서 각 게시물의 좋아요 수 정확 표시
- 상세 페이지에서 좋아요 기능 정상 동작
- 좋아요 상태 변경 시 다른 페이지에도 반영

요청사항만 실행하고 수정한다.

```

### 확인: 좋아요 시스템

브라우저에서 다음 2가지만 확인한다:

1. **데이터베이스 연동 확인**
    - 좋아요 클릭 후 페이지 새로고침해도 상태가 유지되는가?
    - 목록 페이지와 상세 페이지에서 좋아요 수가 일치하는가?
2. **권한 관리 확인**
    - 로그인하지 않은 상태에서 좋아요 클릭 시 로그인 안내가 나타나는가?
    - 로그인 후 좋아요 기능이 정상 작동하는가?

## 3. SEO 최적화 및 메타데이터 개선

### 3.1. 동적 메타데이터 개선

기존 게시물 페이지들의 SEO 최적화를 강화한다.

**프롬프트:**

```
게시물 페이지들의 SEO 최적화를 위한 동적 메타데이터를 구현해 주세요.

현재 상황:
- 10장에서 기본적인 메타데이터 구현 완료
- Open Graph 메타데이터의 중요성 증가

구현 대상:
- 파일 경로: `app/posts/[slug]/page.tsx` (기존 파일 수정)
- 파일 경로: `lib/metadata.ts` (새로 생성)
- 파일 역할: 게시물별 최적화된 메타데이터 생성

주요 요구사항:
1. 메타데이터 항목 확장
   - 기본 title, description
   - Open Graph (og:title, og:description, og:image, og:url)
   - Twitter Cards (twitter:card, twitter:title, twitter:description)
   - JSON-LD 구조화 데이터 (기본적인 수준)

2. 동적 데이터 활용
   - 게시물 제목을 페이지 제목으로 사용
   - 게시물 요약을 description으로 사용
   - 커버 이미지를 소셜 미디어 이미지로 사용
   - 작성일, 수정일 등 추가 정보 포함

3. 메타데이터 유틸리티 함수
   - 재사용 가능한 메타데이터 생성 함수
   - 기본값 설정 및 fallback 처리
   - 소셜 미디어별 최적 길이 고려

기술적 요구사항:
- Next.js App Router의 generateMetadata 함수 활용
- TypeScript 타입 정의 포함
- 복잡한 SEO 도구 사용 금지

완료 기준:
- 각 게시물마다 고유한 메타데이터 생성
- URL 공유 시 적절한 미리보기 표시
- 검색 엔진 최적화 기본 요소 충족

요청사항만 실행하고 수정한다.
```

### 3.2. 사이트맵 생성

**프롬프트:**

```
검색 엔진을 위한 사이트맵을 생성해 주세요.

현재 상황:
- 모든 주요 페이지 구현 완료 (홈, 게시물, 카테고리, 검색)
- 검색 엔진이 사이트 구조를 이해할 수 있도록 사이트맵 필요

구현 대상:
- 파일 경로: `app/sitemap.ts`
- 파일 역할: 동적 사이트맵 생성

주요 요구사항:
1. 포함할 페이지들
   - 홈페이지 (/)
   - 모든 게시물 페이지 (/posts/[slug])
   - 게시물 목록 페이지 (/posts)
   - 모든 카테고리 페이지 (/categories/[slug])
   - 카테고리 목록 페이지 (/categories)

2. 메타데이터 정보
   - lastModified: 각 페이지의 마지막 수정일
   - changeFrequency: 페이지 유형별 변경 빈도
   - priority: 페이지 중요도 (홈 > 게시물 > 카테고리)

3. 동적 데이터 연동
   - 데이터베이스에서 실제 게시물 목록 조회
   - 카테고리 목록 조회
   - 게시물 수정일 정보 활용

기술적 요구사항:
- Next.js App Router의 sitemap.ts 파일 규격 준수
- Supabase에서 필요한 데이터만 효율적으로 조회
- 정적 페이지와 동적 페이지 구분하여 처리

완료 기준:
- /sitemap.xml 접근 시 올바른 XML 형식 출력
- 모든 공개 페이지 포함
- 검색 엔진에서 사이트맵 인식 가능

요청사항만 실행하고 수정한다.
```

### 확인: SEO 최적화

브라우저에서 다음 2가지만 확인한다:

1. **메타데이터 확인**
    - 게시물 페이지에서 F12 → Elements → head 태그 내 메타데이터가 정확한가?
    - 소셜 미디어 공유 시 게시물 이미지와 설명이 올바르게 표시되는가?
2. **사이트맵 확인**
    - 브라우저에서 /sitemap.xml 접근 시 XML이 정상 출력되는가?
    - 사이트맵에 모든 게시물과 카테고리가 포함되어 있는가?

## 4. Vercel 배포 준비 및 실행

### 4.1. 배포 전 환경 설정 정리

### **필수 환경 변수 목록**

### Clerk 인증 시스템

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key
CLERK_SECRET_KEY=sk_test_your-secret-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Supabase 데이터베이스

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 환경 변수 설정 원칙

### 클라이언트 vs 서버 환경 변수

- `NEXT_PUBLIC_` 접두사: 브라우저에서 접근 가능 (공개 정보만)
- 접두사 없음: 서버에서만 접근 가능 (민감한 정보)

### Production 환경 준비사항

### 1. Clerk Production 인스턴스 설정

- Clerk Dashboard에서 Production 인스턴스 생성
- Production용 도메인 URL 확인
- OAuth 제공자 자체 자격 증명 설정 필요

### 2. Supabase Production 프로젝트

- 별도 Production 프로젝트 생성 권장
- RLS 정책 재검토 및 적용
- Third-Party Auth 설정에 Production Clerk 도메인 등록

### 배포 전 체크리스트

### 로컬 환경 확인

- [ ]  `.env.local` 파일에 모든 필수 환경 변수 설정
- [ ]  환경 변수 값들이 올바른지 확인
- [ ]  `.env.local.example` 파일 생성하여 구조 문서화

### 코드 검증

- [ ]  TypeScript 컴파일 에러 없음
- [ ]  ESLint 경고 해결
- [ ]  모든 import 경로 정확성 확인
- [ ]  존재하지 않는 컴포넌트 참조 제거

### 데이터베이스 및 외부 서비스

- [ ]  Supabase 테이블 및 RLS 정책 적용 완료
- [ ]  Supabase Storage 정책 설정 완료
- [ ]  Clerk 인증 플로우 정상 동작 확인

### Vercel 환경 변수 설정 방법

### 1. 프로젝트 생성 시 설정

- GitHub 저장소 연결 후 Configure Project 단계에서 설정
- Environment Variables 섹션에서 추가

### 2. 배포 후 설정

- Vercel Dashboard → Project Settings → Environment Variables
- Add New를 통해 환경 변수 추가
- 환경별 설정 가능 (Production, Preview, Development)

### 3. 환경 변수 업데이트 후 재배포

- 환경 변수 변경 시 자동 재배포되지 않음
- Deployments 탭에서 수동 Redeploy 필요

## 보안 고려사항

### 민감한 정보 처리

- `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출 금지
- API 키는 프로덕션용 별도 발급 권장
- `.env.local` 파일은 절대 Git에 커밋하지 않음

### 환경별 분리

- Development, Staging, Production 환경별 별도 키 사용
- 각 환경에 맞는 데이터베이스 및 서비스 연결

### 자주 발생하는 설정 오류

### 1. 환경 변수 접근 실패

**증상**: `process.env.VARIABLE_NAME`이 undefined
**해결**: NEXT_PUBLIC_ 접두사 확인 또는 서버 컴포넌트에서 사용

### 2. Supabase 연결 실패

**증상**: Database connection 오류
**해결**: URL과 키 값 정확성 확인, RLS 정책 검토

### 3. Clerk 인증 실패

**증상**: 로그인 페이지 무한 리다이렉트
**해결**: Clerk Dashboard의 도메인 설정 확인

### Production 환경에서의 추가 과정

1. **Clerk 인스턴스 전환**:
    - Development에서는 "Development" 인스턴스를 사용했으나, Production으로 이동할 때는 "Production" 인스턴스를 선택해야 합니다. Clerk 대시보드에서 **Integrations > Supabase**로 이동하여 Production 인스턴스를 선택하고 통합을 활성화해야 합니다.
    - 이때 제공되는 **Clerk 도메인**이 Development와 다를 수 있으므로, 새로운 Production 도메인(`https://[your-production-domain].clerk.accounts.dev`)을 확인하고 복사합니다.
2. **Supabase에서 Third-Party Auth 설정 갱신**:
    - Supabase 대시보드에서 **Authentication > Sign In / Up > Third Party Auth**로 이동합니다.
    - 기존 Clerk 통합을 편집하거나 새로 추가하며, Production용 Clerk 도메인(`https://[your-production-domain].clerk.accounts.dev`)을 입력합니다.
    - JWKS URL은 도메인에 `/.well-known/jwks.json`을 추가하여 생성합니다(예: `https://[your-production-domain].clerk.accounts.dev/.well-known/jwks.json`). 이 URL을 Supabase의 **JWT Settings**에 업데이트합니다.
3. **환경 변수 업데이트**:
    - 클라이언트 코드(예: Next.js)에서 사용되는 환경 변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY`)를 Production용 Supabase 프로젝트 값으로 변경합니다.
    - Clerk의 Frontend API 키도 Production 인스턴스에 맞게 갱신해야 합니다.
4. **RLS 정책 검토**:
    - Production 환경에서는 데이터 접근 제어가 더 엄격할 수 있으므로, Supabase의 RLS 정책을 다시 검토하고 필요에 따라 조정합니다. 예를 들어, `requesting_user_id()` 함수가 Production 환경에서 올바르게 Clerk의 `sub` 클레임을 파싱하는지 확인하세요.
5. **보안 강화**:
    - Production에서는 민감한 데이터(예: Supabase `service_role` 키)를 클라이언트 코드에 절대 노출하지 않도록 서버 측에서만 사용하세요.
    - OAuth 제공자(Google, GitHub 등) 설정을 Production용 자격 증명으로 갱신해야 합니다. Development에서는 Clerk가 테스트용 자격 증명을 제공하지만, Production에서는 자체 자격 증명이 필요합니다.
6. **테스트 및 배포**:
    - Production 환경에서 통합이 정상 작동하는지 테스트 쿼리를 실행하여 확인합니다(예: 인증된 사용자만 접근 가능한 데이터 조회).
    - 배포 후 도메인 변경(예: `app.yourcompany.com`)이 필요할 경우, Clerk 대시보드에서 도메인을 추가하고 Supabase에 반영해야 합니다.

### 4.2. 로컬 프로덕션 빌드 테스트

배포 전에 로컬 환경에서 프로덕션 빌드를 테스트한다.

### 1. 개발 서버 종료

현재 실행 중인 개발 서버를 종료한다.

```bash
# Ctrl+C로 개발 서버 종료

```

### 2. 프로덕션 빌드 실행

```bash
# 프로덕션 빌드 생성
npm run build
```

### 3. 빌드 결과 확인

빌드 과정에서 다음 정보를 확인한다:

- 빌드 완료 시간
- 번들 크기 정보
- 정적/동적 페이지 구분
- 에러 또는 경고 메시지

### 4. 프로덕션 모드 실행

```bash
# 프로덕션 서버 시작
npm run start
```

### 5. 브라우저에서 확인

`http://localhost:3000`에서 애플리케이션 동작 확인

## 주요 확인 항목

### 페이지 로딩 및 라우팅

- [ ]  홈페이지 정상 로드
- [ ]  게시물 목록 페이지 (/posts)
- [ ]  게시물 상세 페이지 (/posts/[slug])
- [ ]  카테고리 페이지 (/categories)
- [ ]  검색 페이지 (/search)
- [ ]  로그인/회원가입 페이지

### 인증 시스템

- [ ]  로그인 기능 정상 동작
- [ ]  회원가입 기능 정상 동작
- [ ]  로그아웃 기능 정상 동작
- [ ]  인증 상태에 따른 UI 변화

### 데이터베이스 연동

- [ ]  게시물 목록 정상 표시
- [ ]  게시물 상세 내용 표시
- [ ]  댓글 작성 및 표시
- [ ]  좋아요 기능 동작

### 이미지 및 미디어

- [ ]  커버 이미지 정상 표시
- [ ]  이미지 업로드 기능 동작
- [ ]  Supabase Storage 연동 확인

### 검색 및 필터링

- [ ]  실시간 검색 기능
- [ ]  검색 결과 페이지
- [ ]  카테고리별 필터링

### 자주 발생하는 빌드 문제

### 1. TypeScript 타입 에러

**증상**: 빌드 중 타입 관련 에러 발생

```bash
Type error: Property 'xxx' does not exist on type 'yyy'
```

**해결방법**:

- 타입 정의 파일 확인
- import 경로 정확성 검토
- 사용하지 않는 import 제거

### 2. 환경 변수 누락

**증상**: 빌드는 성공하지만 런타임에서 undefined 에러
**해결방법**:

- `.env.local` 파일 존재 확인
- 환경 변수명 오타 확인
- NEXT_PUBLIC_ 접두사 확인

### 3. 이미지 최적화 오류

**증상**: Image 컴포넌트 관련 에러

```bash
Error: Invalid src prop on `next/image`
```

**해결방법**:

- next.config.js에 이미지 도메인 추가
- 이미지 경로 정확성 확인

### 4. 서버 컴포넌트/클라이언트 컴포넌트 혼용 에러

**증상**: 'use client' 관련 에러
**해결방법**:

- useState, useEffect 사용 컴포넌트에 'use client' 추가
- 서버 전용 함수를 클라이언트에서 사용하지 않도록 수정

### 성능 최적화 확인

### 번들 분석

빌드 완료 후 출력되는 번들 크기 정보를 확인한다:

- First Load JS: 초기 로딩 시 다운로드되는 JS 크기
- Route별 크기: 각 페이지별 추가 JS 크기

### 권장 크기 기준

- First Load JS: 100KB 이하
- 개별 페이지: 50KB 이하

### 크기 초과 시 대응방안

- 사용하지 않는 라이브러리 제거
- 동적 import 활용
- 이미지 최적화

### 배포 준비 완료 확인

### 필수 체크리스트

- [ ]  `npm run build` 성공
- [ ]  `npm run start` 정상 실행
- [ ]  모든 핵심 기능 동작 확인
- [ ]  콘솔 에러 없음
- [ ]  네트워크 요청 정상 처리

### 추가 확인사항

- [ ]  모바일 반응형 확인
- [ ]  브라우저별 호환성 확인
- [ ]  외부 서비스 연동 정상 동작

### 문제 해결 명령어

### 캐시 및 의존성 문제 해결

```bash
# node_modules 및 .next 폴더 삭제
rmdir /s /q node_modules
rmdir /s /q .next

# 패키지 재설치
npm install

# 다시 빌드
npm run build
```

### 자세한 빌드 로그 확인

```bash
# 디버그 모드로 빌드
npm run build --verbose
```

프로덕션 빌드 테스트가 성공적으로 완료되면 Vercel 배포를 진행할 준비가 완료된다.

### 4.3. Vercel 배포 실행

### 1. Vercel 계정 설정

### 가입 및 로그인

1. https://vercel.com 접속
2. GitHub 계정으로 로그인 (권장)
3. 팀 생성 또는 개인 계정으로 시작

### GitHub 저장소 연결 권한 설정

- Vercel이 GitHub 저장소에 접근할 수 있도록 권한 부여
- 전체 저장소 또는 선택된 저장소만 접근 허용 선택 가능

### 2. 새 프로젝트 생성

### 저장소 선택

1. Vercel 대시보드에서 "Add New..." → "Project" 선택
2. GitHub 저장소 목록에서 블로그 프로젝트 선택
3. "Import" 클릭

### 프로젝트 설정 구성

**Configure Project** 화면에서 다음 설정 확인:

### 기본 설정

- **Project Name**: 자동 생성된 이름 또는 원하는 이름으로 변경
- **Framework Preset**: Next.js 자동 감지 확인
- **Root Directory**: `./` (기본값 유지)

### 빌드 설정

- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (자동 설정)
- **Install Command**: `npm install` (자동 설정)

### 3. 환경 변수 설정

### Environment Variables 섹션에서 추가

다음 환경 변수들을 순서대로 추가:

### Clerk 인증 설정

```
Name: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Value: [Clerk Dashboard에서 복사한 Publishable Key]
Environment: Production, Preview, Development (모두 선택)

Name: CLERK_SECRET_KEY
Value: [Clerk Dashboard에서 복사한 Secret Key]
Environment: Production, Preview, Development (모두 선택)
```

### Supabase 데이터베이스 설정

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [Supabase Project URL]
Environment: Production, Preview, Development (모두 선택)

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Supabase Anon Key]
Environment: Production, Preview, Development (모두 선택)

Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Supabase Service Role Key]
Environment: Production (Production만 선택)
```

### 추가 환경 변수

```
Name: NEXT_PUBLIC_CLERK_SIGN_IN_URL
Value: /sign-in

Name: NEXT_PUBLIC_CLERK_SIGN_UP_URL
Value: /sign-up

Name: NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
Value: /

Name: NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
Value: /
```

### 4. 첫 배포 실행

### 배포 시작

1. 모든 설정 완료 후 "Deploy" 버튼 클릭
2. 빌드 과정 실시간 모니터링
3. 빌드 로그에서 에러 확인

### 빌드 과정 모니터링

다음 단계들이 순차적으로 진행됨:

- **Queued**: 빌드 대기열에서 대기
- **Building**: 실제 빌드 과정 진행
    - Installing dependencies
    - Running build command
    - Collecting build outputs
- **Deploying**: 빌드된 결과물 배포
- **Ready**: 배포 완료

### 5. 배포 완료 및 URL 확인

### 성공적인 배포

- 초록색 "Success" 상태 표시
- 자동 생성된 URL 확인 (예: your-project-name.vercel.app)
- "Visit" 버튼을 통해 배포된 사이트 접속

### 도메인 설정 (선택사항)

1. Project Settings → Domains
2. 커스텀 도메인 추가 가능
3. DNS 설정 안내에 따라 도메인 연결

### 6. 자동 배포 설정 확인

### Git 기반 자동 배포

- main 브랜치에 코드 푸시 시 자동 배포
- Pull Request 생성 시 Preview 배포 자동 생성
- 커밋별 배포 히스토리 확인 가능

### 배포 설정 조정

- Project Settings → Git
- 자동 배포 브랜치 변경 가능
- Preview 배포 설정 조정 가능

### 배포 실패 시 문제 해결

### 빌드 에러 확인

1. Deployments 탭에서 실패한 배포 클릭
2. Build Logs에서 상세 에러 메시지 확인
3. 에러 유형별 대응:

### TypeScript 에러

```
Type error: Cannot find module 'xxx'
```

**해결**: import 경로 수정, 타입 정의 추가

### 환경 변수 에러

```
ReferenceError: process is not defined
```

**해결**: 환경 변수 설정 확인, NEXT_PUBLIC_ 접두사 확인

### 의존성 에러

```
Module not found: Can't resolve 'xxx'
```

**해결**: package.json 의존성 확인, npm install 재실행

### 재배포 방법

1. 문제 해결 후 GitHub에 수정 사항 푸시
2. 또는 Vercel에서 "Redeploy" 버튼 클릭
3. 빌드 로그 재확인

### 성공적인 배포 확인 지표

### 빌드 성공

- Build time: 일반적으로 1-3분 내 완료
- Bundle size: 합리적인 크기 (First Load JS < 100KB)
- 에러 또는 경고 없음

### 기능 정상 동작

- 모든 페이지 접근 가능
- 인증 시스템 정상 동작
- 데이터베이스 연동 확인
- 이미지 로딩 정상

### 성능 지표

- Core Web Vitals 점수 확인
- 페이지 로딩 속도 3초 이내
- 모바일 반응형 정상 동작

배포가 성공적으로 완료되면 실제 사용자들이 접근할 수 있는 블로그가 완성된다.

### 4.4. 배포 후 검증 및 문제 해결

### 기본 기능 검증 체크리스트

### 페이지 접근성 확인

- [ ]  홈페이지 (/) 정상 로드
- [ ]  게시물 목록 (/posts) 정상 표시
- [ ]  게시물 상세 페이지 (/posts/[slug]) 접근 가능
- [ ]  카테고리 페이지 (/categories) 정상 동작
- [ ]  검색 페이지 (/search) 기능 확인
- [ ]  404 페이지 적절한 표시

### 인증 시스템 검증

- [ ]  로그인 페이지 (/sign-in) 정상 표시
- [ ]  회원가입 페이지 (/sign-up) 정상 표시
- [ ]  소셜 로그인 (Google, GitHub) 동작 확인
- [ ]  로그아웃 기능 정상 동작
- [ ]  인증 상태에 따른 UI 변화 확인

### 데이터베이스 연동 확인

- [ ]  게시물 목록이 실제 데이터로 표시
- [ ]  게시물 상세 내용 정상 로드
- [ ]  댓글 작성 및 표시 기능
- [ ]  좋아요 기능 동작 확인
- [ ]  검색 결과가 실제 데이터 기반으로 표시

### 이미지 및 미디어 확인

- [ ]  커버 이미지 정상 표시
- [ ]  이미지 업로드 기능 동작 (관리자)
- [ ]  Supabase Storage 이미지 로딩
- [ ]  Next.js Image 최적화 적용 확인

### 성능 및 사용자 경험 검증

### 로딩 성능

- 페이지 초기 로딩: 3초 이내
- 페이지 간 네비게이션: 1초 이내
- 이미지 로딩: 지연 로딩 적용 확인

### 반응형 디자인

- [ ]  모바일 (320px-767px) 레이아웃 확인
- [ ]  태블릿 (768px-1023px) 레이아웃 확인
- [ ]  데스크톱 (1024px+) 레이아웃 확인
- [ ]  터치 인터페이스 정상 동작

### SEO 및 메타데이터

- [ ]  페이지별 적절한 title 태그
- [ ]  메타 description 설정 확인
- [ ]  Open Graph 메타데이터 확인
- [ ]  사이트맵 (/sitemap.xml) 접근 가능

### 자주 발생하는 문제 및 해결방법

### 1. 환경 변수 관련 문제

### 증상: API 키가 undefined로 표시

```jsx
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL); // undefined

```

**해결방법**:

1. Vercel Dashboard → Project Settings → Environment Variables 확인
2. 환경 변수명 오타 확인
3. 환경 변수 추가 후 재배포 실행

```bash
# Vercel CLI를 통한 환경 변수 확인 (선택적)
vercel env ls

```

### 2. Supabase 연결 실패

### 증상: Database connection 에러 또는 빈 데이터

```
Error: Invalid API key or unauthorized access

```

**해결방법**:

1. Supabase URL과 키 값 정확성 재확인
2. RLS 정책 활성화 상태 확인
3. Third-Party Auth 설정에서 Clerk 도메인 확인
4. Supabase Dashboard에서 연결 테스트:
    - SQL Editor에서 `SELECT * FROM posts LIMIT 1;` 실행
    - Authentication → Users에서 사용자 존재 확인

### 3. Clerk 인증 실패

### 증상: 로그인 페이지 무한 리다이렉트 또는 401 에러

```
Clerk: Invalid publishable key

```

**해결방법**:

1. Clerk Dashboard에서 도메인 설정 확인
    - Allowed domains에 Vercel 도메인 추가
    - Production 환경에서는 커스텀 도메인도 추가 필요
2. 환경 변수에서 Clerk 키 값 재확인
3. Clerk와 Supabase Third-Party Auth 연동 재확인

### 4. 이미지 로딩 문제

### 증상: 이미지가 표시되지 않거나 최적화되지 않음

```
Error: Invalid src prop on next/image
```

**해결방법**:

1. `next.config.js`에 이미지 도메인 추가:

```jsx
/ @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-supabase-project.supabase.co',
        pathname: '/storage/v1/object/public/',
      },
    ],
  },
}

module.exports = nextConfig
```

1. Supabase Storage 정책 확인:
    - Storage → Policies에서 READ 정책 활성화 확인

### 5. API 라우트 502/500 에러

### 증상: API 호출 시 서버 에러 발생

```
502 Bad Gateway
500 Internal Server Error
```

**해결방법**:

1. Vercel Functions 로그 확인:
    - Vercel Dashboard → Functions 탭
    - 실시간 로그에서 에러 메시지 확인
2. 서버리스 함수 제한사항 확인:
    - 실행 시간: 10초 이내 (Hobby 플랜)
    - 메모리 사용량: 1024MB 이내
3. 에러 처리 개선:

```jsx
// API 라우트에 적절한 에러 처리 추가
export async function GET() {
  try {
    // API 로직
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 6. CORS 에러

### 증상: 클라이언트에서 API 호출 시 CORS 에러

```
Access to fetch at 'xxx' from origin 'xxx' has been blocked by CORS policy
```

**해결방법**:

1. API 라우트에 CORS 헤더 추가:

```jsx
export async function GET() {
  const response = NextResponse.json(data);
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}

```

1. 외부 API 호출 시 프록시 사용:
    - 클라이언트에서 직접 호출 대신 API 라우트 경유

### 모니터링 및 디버깅 도구

### Vercel Analytics 활용

- Real-time analytics 확인
- 페이지별 성능 지표 모니터링
- Core Web Vitals 점수 추적

### 브라우저 개발자 도구 활용

1. **Console 탭**: 자바스크립트 에러 확인
2. **Network 탭**: API 호출 상태 및 응답 시간 확인
3. **Application 탭**: localStorage, sessionStorage 상태 확인
4. **Lighthouse**: 성능, 접근성, SEO 점수 측정

### 로그 모니터링

```jsx
// 프로덕션 환경에서도 중요한 로그는 유지
console.log('Production log:', { userId, action, timestamp });
```

### 지속적인 모니터링 체크리스트

### 주간 점검사항

- [ ]  사이트 접근성 및 로딩 속도 확인
- [ ]  새로운 게시물 작성 및 표시 테스트
- [ ]  댓글 및 좋아요 기능 동작 확인
- [ ]  검색 기능 정확성 확인

### 월간 점검사항

- [ ]  Vercel Analytics 성능 지표 검토
- [ ]  Supabase 사용량 및 제한 확인
- [ ]  Clerk 사용자 통계 검토
- [ ]  백업 및 보안 상태 점검

성공적인 배포 검증이 완료되면 안정적으로 운영되는 블로그 시스템을 확보하게 된다.

### 간단한 확인: 배포 완료

배포된 사이트에서 다음 2가지만 확인한다:

1. **핵심 기능 확인**
    - 게시물 목록과 상세 페이지가 정상적으로 로드되는가?
    - 로그인 후 댓글 작성과 좋아요 기능이 동작하는가?
2. **성능 확인**
    - 페이지 로딩 속도가 적절한가?
    - 이미지들이 제대로 표시되는가?