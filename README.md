# My Blog 🚀

Next.js, Clerk, Supabase를 사용한 개인 블로그 프로젝트입니다.

## 📖 프로젝트 소개

웹 개발, JavaScript, React, Next.js에 관한 기술 블로그입니다. 최신 개발 트렌드와 실무 경험을 공유합니다.

## 🚀 기술 스택

-   **Frontend**: Next.js 14, TypeScript, Tailwind CSS
-   **Authentication**: Clerk
-   **Database**: Supabase (PostgreSQL)
-   **Styling**: Tailwind CSS, shadcn/ui
-   **Markdown**: react-markdown, rehype, remark

## 📋 주요 기능

-   ✅ 블로그 포스트 작성/수정/삭제
-   ✅ 카테고리 관리
-   ✅ 마크다운 지원
-   ✅ 반응형 디자인
-   ✅ SEO 최적화
-   ✅ 이미지 업로드 및 최적화
-   ✅ 사용자 인증 (Clerk)
-   🔄 댓글 시스템 (예정)
-   🔄 태그 시스템 (예정)

## ✨ 주요 기능

### 📱 반응형 디자인

-   모바일, 태블릿, 데스크톱 완벽 대응
-   Tailwind CSS를 활용한 현대적 UI/UX

### 🔍 검색 기능

-   실시간 검색 다이얼로그 (`Ctrl+K`)
-   제목, 내용, 태그 전체 검색
-   검색어 하이라이팅
-   고급 필터링 및 정렬

### ❤️ 좋아요 시스템

-   포스트별 좋아요 기능
-   로컬 스토리지 기반 사용자 상태 관리
-   부드러운 애니메이션 효과
-   접근성 지원

### 💬 댓글 시스템

-   댓글 작성 및 답글 기능
-   실시간 업데이트
-   폼 유효성 검사

### 📝 포스트 관리

-   마크다운 기반 콘텐츠
-   코드 하이라이팅
-   카테고리 및 태그 분류
-   관련 포스트 추천

### 🎨 컴포넌트 시스템

-   재사용 가능한 PostCard 컴포넌트
-   다양한 변형 (Featured, Compact, Related)
-   shadcn/ui 기반 디자인 시스템

## 🛠️ 설치 및 실행

1. **저장소 클론**

```bash
git clone <repository-url>
cd my-blog
```

2. **의존성 설치**

```bash
npm install
```

3. **환경 변수 설정**
   `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

4. **데이터베이스 설정**
   Supabase 대시보드에서 `docs/database-schema.sql` 스크립트를 실행하세요.

5. **개발 서버 실행**

```bash
npm run dev
```

## 🔧 트러블슈팅

### 404 에러 해결

페이지 로드 시 404 에러가 발생하는 경우:

#### 1. 이미지 404 에러

-   존재하지 않는 이미지 URL로 인한 에러
-   자동으로 placeholder 이미지로 대체됨
-   필요시 `scripts/clean-database.sql` 실행하여 잘못된 이미지 URL 정리

#### 2. site.webmanifest 404 에러

-   ✅ 이미 해결됨: `public/site.webmanifest` 파일 생성 완료

#### 3. 잘못된 게시물 데이터

데이터베이스에 테스트 데이터가 남아있는 경우, Supabase SQL Editor에서 다음 스크립트 실행:

```sql
-- 현재 게시물 확인
SELECT id, title, slug, cover_image_url FROM posts ORDER BY created_at DESC;

-- 잘못된 게시물 제거
DELETE FROM posts
WHERE
  title LIKE '%새 게시물 작성%'
  OR title LIKE '%test%'
  OR title LIKE '%가이드%';

-- 잘못된 이미지 URL 정리
UPDATE posts
SET cover_image_url = NULL
WHERE
  cover_image_url IS NOT NULL
  AND (
    cover_image_url LIKE '%example.com%'
    OR cover_image_url LIKE '%placeholder%'
    OR cover_image_url LIKE '%localhost%'
  );
```

#### 4. 개발 중 캐시 문제

```bash
# Next.js 캐시 정리
rm -rf .next
npm run dev

# 브라우저 캐시도 강제 새로고침 (Cmd+Shift+R)
```

## 📁 프로젝트 구조

```
├── app/                 # Next.js App Router
│   ├── (auth)/         # 인증 관련 페이지
│   ├── admin/          # 관리자 페이지
│   ├── api/            # API 라우트
│   ├── posts/          # 블로그 포스트 페이지
│   └── categories/     # 카테고리 페이지
├── components/         # 재사용 가능한 컴포넌트
│   ├── blog/          # 블로그 관련 컴포넌트
│   ├── ui/            # UI 컴포넌트 (shadcn/ui)
│   └── admin/         # 관리자 컴포넌트
├── lib/               # 유틸리티 함수 및 설정
├── types/             # TypeScript 타입 정의
├── docs/              # 문서 및 스키마
├── scripts/           # 데이터베이스 관리 스크립트
└── public/            # 정적 파일
```

## 🔐 인증 시스템

Clerk를 사용한 사용자 인증:

-   이메일/비밀번호 로그인
-   소셜 로그인 (Google, GitHub 등)
-   보호된 관리자 페이지
-   Supabase RLS와 연동

## 📝 포스트 작성

1. `/admin/post/new`에서 새 포스트 작성
2. 마크다운 문법 지원
3. 카테고리 선택
4. 커버 이미지 업로드 (선택사항)
5. 미리보기 기능

## 🎨 커스터마이징

### 테마 색상

`tailwind.config.ts`에서 색상 팔레트 수정 가능

### 컴포넌트 스타일

`components/` 폴더의 각 컴포넌트에서 스타일 커스터마이징

## 📚 참고 자료

-   [Next.js 문서](https://nextjs.org/docs)
-   [Clerk 문서](https://clerk.com/docs)
-   [Supabase 문서](https://supabase.com/docs)
-   [Tailwind CSS](https://tailwindcss.com/docs)
-   [shadcn/ui](https://ui.shadcn.com/)

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📄 라이선스

MIT License - 자세한 내용은 `LICENSE` 파일을 확인하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/LeeSeogMin/my-blog](https://github.com/LeeSeogMin/my-blog)

---

⭐ 이 프로젝트가 도움이 되셨다면 스타를 눌러주세요!
