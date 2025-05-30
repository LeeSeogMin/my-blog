/**
 * 게시물 수정 페이지 (2025년 새로운 Third-Party Auth 방식)
 * 기존 게시물 데이터를 불러와서 수정할 수 있는 폼을 제공
 */

import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PostEditForm from '@/components/admin/post-edit-form';
import { Database } from '@/types/database.types';

// 타입 정의
type Post = Database['public']['Tables']['posts']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

type PostWithCategory = Post & {
  categories?: Category | null;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

// 메타데이터
export const metadata = {
  title: '게시물 수정 | My Blog',
  description: '게시물을 수정합니다.',
};

export default async function PostEditPage({ params }: PageProps) {
  const { id } = await params;

  try {
    console.log('=== 게시물 수정 페이지 접근 ===', id);

    // Clerk 인증 확인
    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ 인증되지 않은 사용자');
      redirect('/sign-in');
    }

    console.log('현재 사용자 ID:', userId);

    // Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient();

    // 기존 게시물 조회
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          color
        )
      `)
      .eq('id', id)
      .single();

    if (postError) {
      console.error('게시물 조회 오류:', postError);
      if (postError.code === 'PGRST116') {
        console.log('❌ 게시물을 찾을 수 없음:', id);
        notFound();
      }
      throw postError;
    }

    if (!post) {
      console.log('❌ 게시물이 존재하지 않음');
      notFound();
    }

    // 작성자 권한 확인
    if (post.author_id !== userId) {
      console.log('❌ 권한 없음: 작성자가 아님');
      redirect('/posts');
    }

    console.log('✅ 게시물 수정 권한 확인 완료:', post.title);

    // 카테고리 목록 조회
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (categoriesError) {
      console.error('카테고리 조회 오류:', categoriesError);
      // 카테고리 조회 실패는 페이지 렌더링을 중단하지 않음
    }

    console.log('✅ 카테고리 목록 조회 완료:', categories?.length || 0);

    // 폼에 전달할 데이터 형식으로 변환
    const formData = {
      id: post.id,
      title: post.title,
      content: post.content || '',
      slug: post.slug,
      coverImageUrl: post.cover_image_url || '',
      categoryId: post.category_id || '',
      status: post.status || 'draft',
    };

    const transformedCategories = (categories || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      color: cat.color || '#6366f1',
    }));

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✏️</span>
                <h1 className="text-3xl font-bold text-gray-900">게시물 수정</h1>
              </div>
            </div>
            <p className="text-gray-600">
              게시물 정보를 수정하고 저장하세요.
            </p>
          </div>

          {/* 수정 폼 */}
          <div className="bg-white shadow-sm rounded-lg">
            <PostEditForm 
              initialData={formData}
              categories={transformedCategories}
            />
          </div>
        </div>
      </div>
    );

  } catch (error) {
    console.error('게시물 수정 페이지 오류:', error);
    notFound();
  }
} 