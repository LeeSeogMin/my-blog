/**
 * 카테고리 목록 페이지 (실제 데이터베이스 연동)
 * 
 * 특징:
 * - 서버 컴포넌트로 구현
 * - 실제 Supabase 데이터베이스에서 카테고리 조회
 * - 각 카테고리의 게시물 개수 표시
 */

import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Metadata } from 'next';
import { Database } from '@/types/database.types';

// 타입 정의
type Category = Database['public']['Tables']['categories']['Row'];

// 페이지 메타데이터
export const metadata: Metadata = {
  title: '카테고리 | My Blog',
  description: '블로그의 모든 카테고리를 확인하고 관심 있는 주제의 글을 찾아보세요.',
  openGraph: {
    title: '카테고리 | My Blog',
    description: '블로그의 모든 카테고리를 확인하고 관심 있는 주제의 글을 찾아보세요.',
  },
};

export default async function CategoriesPage() {
  try {
    console.log('=== 카테고리 목록 페이지: 데이터 조회 시작 ===');
    
    // 실제 Supabase 데이터베이스와 연동
    const supabase = await createServerSupabaseClient();

    // 카테고리 목록 조회
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesError) {
      console.error('카테고리 조회 오류:', categoriesError);
      throw categoriesError;
    }

    console.log(`✅ 카테고리 ${categories?.length || 0}개 조회 성공`);

    // 각 카테고리별 게시물 수 조회
    const categoriesWithCount = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published')
          .eq('category_id', category.id);

        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description || `${category.name} 관련 글들을 모아놓은 카테고리입니다.`,
          postCount: count || 0,
          color: category.color || '#3b82f6' // 데이터베이스의 color 컬럼 사용
        };
      })
    );

    console.log('✅ 카테고리별 게시물 수 조회 완료');

    return (
      <div className="py-16">
        {/* 페이지 헤더 */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            카테고리
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            관심 있는 주제별로 글을 찾아보세요. 각 카테고리마다 엄선된 고품질 콘텐츠를 제공합니다.
          </p>
        </section>

        {/* 카테고리 통계 */}
        <section className="mb-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-muted text-muted-foreground text-sm">
              <span>📚</span>
              <span>총 {categoriesWithCount.length}개의 카테고리</span>
              <span>•</span>
              <span>{categoriesWithCount.reduce((sum, cat) => sum + cat.postCount, 0)}개의 글</span>
            </div>
          </div>
        </section>

        {/* 카테고리 그리드 */}
        <section>
          {categoriesWithCount.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoriesWithCount.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group block"
                >
                  <article className="relative rounded-xl border bg-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                    {/* 카테고리 색상 인디케이터 */}
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
                        {category.postCount}개의 글
                      </div>
                    </div>
                    
                    {/* 카테고리 정보 */}
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {category.name}
                      </h2>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {category.description}
                      </p>
                    </div>

                    {/* 호버 시 더 보기 표시 */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1 text-xs text-primary font-medium">
                        <span>더 보기</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </div>

                    {/* 호버 효과 보더 */}
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary/20 transition-colors" />
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            /* 카테고리가 없는 경우 */
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-2xl font-bold mb-4">카테고리가 없습니다</h3>
              <p className="text-muted-foreground mb-8">
                아직 등록된 카테고리가 없습니다. 곧 다양한 주제의 글들이 업데이트될 예정입니다.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                홈으로 돌아가기
              </Link>
            </div>
          )}
        </section>

        {/* 추가 안내 */}
        {categoriesWithCount.length > 0 && (
          <section className="mt-16 text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">원하는 카테고리를 찾지 못하셨나요?</h3>
              <p className="text-muted-foreground mb-6">
                더 많은 주제와 카테고리가 지속적으로 추가되고 있습니다. 
                특정 주제에 대한 글을 원하신다면 언제든 요청해주세요.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/posts"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  모든 글 보기
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  홈으로 돌아가기
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error('카테고리 데이터 조회 중 오류 발생:', error);
    
    // 에러 발생 시 빈 상태 표시
    return (
      <div className="py-16">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            카테고리
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            관심 있는 주제별로 글을 찾아보세요. 각 카테고리마다 엄선된 고품질 콘텐츠를 제공합니다.
          </p>
        </section>

        <section>
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold mb-4">카테고리를 불러올 수 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </section>
      </div>
    );
  }
} 