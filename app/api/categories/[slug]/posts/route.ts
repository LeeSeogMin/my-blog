npm/**
 * 카테고리별 게시물 조회 API 라우트 (2025년 새로운 Third-Party Auth 방식)
 * 
 * 특징:
 * - 카테고리 슬러그로 게시물 필터링
 * - createServerSupabaseClient로 RLS 정책 자동 연동
 * - 카테고리 정보 포함한 게시물 데이터 반환
 * - TypeScript 타입 안전성 확보
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Database, ApiResponse, PaginatedResponse } from '@/types/database.types';

// 타입 정의
type Post = Database['public']['Tables']['posts']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

// ========================================
// GET: 특정 카테고리의 게시물 조회
// ========================================
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  try {
    console.log('=== 카테고리별 게시물 조회 API 호출 ===');
    const { slug } = params;
    console.log('카테고리 슬러그:', slug);

    // URL 파라미터 추출
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'published';

    // 페이지네이션 계산
    const offset = (page - 1) * limit;

    // 서버 Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient();

    // 먼저 카테고리 존재 여부 확인
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (categoryError) {
      if (categoryError.code === 'PGRST116') {
        console.log('❌ 카테고리를 찾을 수 없음:', slug);
        return NextResponse.json(
          { 
            success: false, 
            error: '카테고리를 찾을 수 없습니다' 
          } as ApiResponse,
          { status: 404 }
        );
      }
      console.error('카테고리 조회 오류:', categoryError);
      return NextResponse.json(
        { 
          success: false, 
          error: '카테고리를 불러오는데 실패했습니다' 
        } as ApiResponse,
        { status: 500 }
      );
    }

    console.log('✅ 카테고리 확인:', category.name);

    // 해당 카테고리의 게시물 조회
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        status,
        cover_image_url,
        view_count,
        author_id,
        created_at,
        updated_at,
        categories (
          id,
          name,
          slug,
          color
        )
      `)
      .eq('category_id', category.id)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error('게시물 조회 오류:', postsError);
      return NextResponse.json(
        { 
          success: false, 
          error: '게시물을 불러오는데 실패했습니다' 
        } as ApiResponse,
        { status: 500 }
      );
    }

    // 해당 카테고리의 전체 게시물 수 조회
    const { count, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)
      .eq('status', status);

    if (countError) {
      console.error('게시물 수 조회 오류:', countError);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    console.log(`✅ 카테고리 "${category.name}"의 게시물 ${posts?.length || 0}개 조회 성공`);

    // Post 타입에 맞게 posts 변환
    const normalizedPosts = (posts || []).map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      status: post.status,
      cover_image_url: post.cover_image_url,
      view_count: post.view_count,
      author_id: post.author_id,
      created_at: post.created_at,
      updated_at: post.updated_at,
      content: (post as any).content ?? '',
      category_id: (post as any).category_id ?? (Array.isArray((post as any).categories) && (post as any).categories[0] ? (post as any).categories[0].id : (post as any).categories?.id ?? null),
      categories: Array.isArray((post as any).categories)
        ? ((post as any).categories[0] || null)
        : (post as any).categories ?? null,
    }));

    const response: PaginatedResponse<Post> & { category: Category } = {
      success: true,
      data: normalizedPosts,
      category: category,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('카테고리별 게시물 조회 중 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '서버 오류가 발생했습니다' 
      } as ApiResponse,
      { status: 500 }
    );
  }
} 