/**
 * 게시물 Slug 조회 API 라우트 (2025년 새로운 Third-Party Auth 방식)
 * 
 * GET: slug로 게시물 조회 (SEO 친화적 URL)
 * 
 * 특징:
 * - URL slug 기반 게시물 조회
 * - 카테고리 정보 포함 (JOIN)
 * - 존재하지 않으면 404 응답
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Database, ApiResponse } from '@/types/database.types';

// 타입 정의
type Post = Database['public']['Tables']['posts']['Row'];
type PostWithCategory = Post & {
  categories?: Database['public']['Tables']['categories']['Row'] | null;
};

// ========================================
// GET: slug로 게시물 조회
// ========================================
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  try {
    console.log('=== slug로 게시물 조회 API 호출 ===');
    const { slug } = params;
    console.log('게시물 slug:', slug);

    // 서버 Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient();

    // slug로 게시물 조회 (카테고리 정보 포함)
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        status,
        cover_image_url,
        view_count,
        author_id,
        category_id,
        created_at,
        updated_at,
        categories (
          id,
          name,
          slug,
          description,
          color
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published') // 발행된 게시물만 조회
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ 게시물을 찾을 수 없음:', slug);
        return NextResponse.json(
          { 
            success: false, 
            error: '게시물을 찾을 수 없습니다' 
          } as ApiResponse,
          { status: 404 }
        );
      }
      console.error('게시물 조회 오류:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: '게시물을 불러오는데 실패했습니다' 
        } as ApiResponse,
        { status: 500 }
      );
    }

    console.log('✅ 게시물 조회 성공:', post.title);

    // 조회수 증가 (별도 트랜잭션으로 처리, 실패해도 게시물 조회는 성공)
    try {
      await supabase
        .from('posts')
        .update({ view_count: (post.view_count || 0) + 1 })
        .eq('id', post.id);
      console.log('✅ 조회수 증가 완료');
    } catch (viewError) {
      console.warn('⚠️ 조회수 증가 실패 (무시):', viewError);
    }

    // categories가 배열일 수 있으므로 첫 번째 값 또는 null로 변환
    const normalizedPost: PostWithCategory = {
      ...post,
      categories: Array.isArray(post.categories)
        ? ((post.categories[0] as any)
            ? {
                id: (post.categories[0] as any).id,
                name: (post.categories[0] as any).name,
                slug: (post.categories[0] as any).slug,
                description: (post.categories[0] as any).description ?? null,
                color: (post.categories[0] as any).color,
                created_at: (post.categories[0] as any).created_at ?? '',
                updated_at: (post.categories[0] as any).updated_at ?? '',
              }
            : null)
        : post.categories
        ? {
            id: (post.categories as any).id,
            name: (post.categories as any).name,
            slug: (post.categories as any).slug,
            description: (post.categories as any).description ?? null,
            color: (post.categories as any).color,
            created_at: (post.categories as any).created_at ?? '',
            updated_at: (post.categories as any).updated_at ?? '',
          }
        : null,
    };

    const response: ApiResponse<PostWithCategory> = {
      success: true,
      data: normalizedPost
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('게시물 slug 조회 중 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '서버 오류가 발생했습니다' 
      } as ApiResponse,
      { status: 500 }
    );
  }
} 