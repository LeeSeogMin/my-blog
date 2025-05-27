/**
 * 관련 포스트 컴포넌트 데모 페이지
 * 다양한 관련 포스트 추천 시나리오를 테스트하기 위한 페이지
 */

import { mockPosts } from '@/data/mockData';
import RelatedPosts, { CompactRelatedPosts, InlineRelatedPosts } from '@/components/blog/related-posts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Related Posts Demo | My Blog',
  description: 'RelatedPosts 컴포넌트의 다양한 기능을 테스트하는 데모 페이지입니다.',
};

export default function RelatedPostsDemoPage() {
  // 테스트용 포스트 선택 (첫 번째 포스트)
  const currentPost = mockPosts[0];
  
  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto">
        {/* 페이지 헤더 */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">관련 포스트 컴포넌트 데모</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            RelatedPosts 컴포넌트의 다양한 변형과 추천 알고리즘을 확인할 수 있는 데모 페이지입니다.
            동일 카테고리와 공통 태그를 기반으로 한 스마트 추천 시스템을 체험해보세요.
          </p>
        </header>

        {/* 현재 포스트 정보 */}
        <section className="mb-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-bold mb-4">🎯 기준 포스트 (추천 대상에서 제외)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">{currentPost.title}</h3>
              <p className="text-muted-foreground text-sm mb-3">{currentPost.excerpt}</p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">카테고리:</span>{' '}
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium ml-1"
                    style={{ 
                      backgroundColor: currentPost.category.color + '15',
                      color: currentPost.category.color 
                    }}
                  >
                    {currentPost.category.name}
                  </span>
                </div>
                <div>
                  <span className="font-medium">태그:</span>{' '}
                  <span className="text-muted-foreground">
                    {currentPost.tags.join(', ')}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="font-medium">읽기 시간:</span> {currentPost.readingTime}분</div>
              <div><span className="font-medium">조회수:</span> {(currentPost.viewCount || 0).toLocaleString()}</div>
              <div><span className="font-medium">좋아요:</span> {(currentPost.likeCount || 0).toLocaleString()}</div>
              <div><span className="font-medium">추천 포스트:</span> {currentPost.featured ? '✅' : '❌'}</div>
            </div>
          </div>
        </section>

        {/* 1. 기본 관련 포스트 컴포넌트 */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">1. 기본 관련 포스트 컴포넌트</h2>
            <p className="text-muted-foreground">
              표준 크기의 카드로 최대 3개의 관련 포스트를 표시합니다. 동일 카테고리와 공통 태그를 기준으로 추천합니다.
            </p>
          </div>
          <div className="border rounded-lg bg-card">
            <RelatedPosts currentPost={currentPost} />
          </div>
        </section>

        {/* 2. 컴팩트 관련 포스트 */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">2. 컴팩트 관련 포스트</h2>
            <p className="text-muted-foreground">
              사이드바나 작은 공간에 적합한 축약된 형태의 관련 포스트입니다.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="border rounded-lg bg-card p-6">
              <h3 className="font-semibold mb-4">사이드바용 (CompactRelatedPosts)</h3>
              <CompactRelatedPosts currentPost={currentPost} limit={3} />
            </div>
            <div className="border rounded-lg bg-card p-6">
              <h3 className="font-semibold mb-4">일반 컴팩트 모드</h3>
              <RelatedPosts 
                currentPost={currentPost} 
                compact={true}
                title="작은 크기 관련 글"
                limit={2}
              />
            </div>
          </div>
        </section>

        {/* 3. 인라인 관련 포스트 */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">3. 인라인 관련 포스트</h2>
            <p className="text-muted-foreground">
              본문 중간에 삽입할 수 있는 단일 포스트 추천 컴포넌트입니다.
            </p>
          </div>
          <div className="border rounded-lg bg-card p-6">
            <p className="text-muted-foreground mb-4">
              이 부분은 일반적인 본문 텍스트이고, 아래에 인라인 관련 포스트가 나타납니다:
            </p>
            <InlineRelatedPosts currentPost={currentPost} />
            <p className="text-muted-foreground mt-4">
              그리고 이어서 본문이 계속됩니다. 자연스럽게 본문 흐름에 맞게 관련 포스트를 추천할 수 있습니다.
            </p>
          </div>
        </section>

        {/* 4. 다양한 옵션 테스트 */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">4. 다양한 옵션 테스트</h2>
            <p className="text-muted-foreground">
              RelatedPosts 컴포넌트의 다양한 설정 옵션들을 테스트합니다.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 많은 포스트 표시 */}
            <div className="border rounded-lg bg-card">
              <RelatedPosts 
                currentPost={currentPost} 
                limit={6}
                title="더 많은 관련 글 (6개)"
                fallbackToLatest={true}
              />
            </div>
            
            {/* Fallback 비활성화 */}
            <div className="border rounded-lg bg-card">
              <RelatedPosts 
                currentPost={currentPost} 
                limit={5}
                title="엄격한 관련성 (Fallback 없음)"
                fallbackToLatest={false}
              />
            </div>
          </div>
        </section>

        {/* 5. 추천 알고리즘 설명 */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">5. 추천 알고리즘 작동 원리</h2>
            <p className="text-muted-foreground">
              현재 구현된 관련 포스트 추천 시스템의 작동 방식을 설명합니다.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                🎯 점수 계산 방식
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>동일 카테고리</span>
                  <span className="font-mono bg-muted px-2 py-1 rounded">+10점</span>
                </div>
                <div className="flex justify-between">
                  <span>공통 태그 (개당)</span>
                  <span className="font-mono bg-muted px-2 py-1 rounded">+2점</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="text-muted-foreground">
                    점수가 높은 순으로 정렬하여 추천합니다.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                🔄 Fallback 로직
              </h3>
              <div className="space-y-2 text-sm">
                <div>1. 관련 포스트 우선 선택</div>
                <div>2. 부족한 경우 최신 포스트로 보완</div>
                <div>3. 현재 포스트는 항상 제외</div>
                <div>4. 중복 제거 처리</div>
                <div className="pt-3 border-t text-muted-foreground">
                  사용자가 항상 관련 콘텐츠를 볼 수 있도록 보장합니다.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 네비게이션 */}
        <footer className="mt-16 pt-8 border-t text-center">
          <div className="flex justify-center gap-4">
            <a
              href="/demo/markdown"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              📝 마크다운 데모 보기
            </a>
            <a
              href="/posts"
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              📚 포스트 목록 보기
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              🏠 홈으로 돌아가기
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
} 