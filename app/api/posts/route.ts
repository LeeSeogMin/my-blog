/**
 * 블로그 게시물 CRUD API 라우트 (2025년 새로운 Third-Party Auth 방식)
 * 
 * 특징:
 * - Clerk Third-Party Auth 통합 사용
 * - createServerSupabaseClient로 자동 토큰 처리
 * - TypeScript 타입 안전성 확보
 * - 기본적인 에러 처리 포함
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Database, PostCreateRequest, ApiResponse, PaginatedResponse } from '@/types/database.types';

// 타입 정의
type Post = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];

/**
 * GET /api/posts - 모든 게시물 조회 (페이지네이션 포함)
 * 공개 접근 가능
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const supabase = await createServerSupabaseClient();

    // 게시물 조회 (카테고리 정보 포함)
    const { data: posts, error: postsError } = await supabase
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
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error('❌ 게시물 조회 오류:', postsError);
      return NextResponse.json({
        success: false,
        error: '게시물을 조회할 수 없습니다.'
      } as ApiResponse, { status: 500 });
    }

    // 전체 게시물 수 조회
    const { count, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    if (countError) {
      console.error('❌ 게시물 수 조회 오류:', countError);
      return NextResponse.json({
        success: false,
        error: '게시물 수를 조회할 수 없습니다.'
      } as ApiResponse, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    } as PaginatedResponse<Post>);

  } catch (error) {
    console.error('❌ GET /api/posts 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    } as ApiResponse, { status: 500 });
  }
}

/**
 * POST /api/posts - 새 게시물 생성
 * 인증된 사용자만 접근 가능
 */
export async function POST(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다.'
      } as ApiResponse, { status: 401 });
    }

    console.log(`🔑 인증된 사용자 ID: ${userId}`);

    const body: PostCreateRequest = await request.json();
    const { title, content, excerpt, category_id, status = 'published', featured_image } = body;

    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json({
        success: false,
        error: '제목과 내용은 필수입니다.'
      } as ApiResponse, { status: 400 });
    }

    // slug 생성 (제목 기반)
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9가-힣\s\-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const supabase = await createServerSupabaseClient();

    // 게시물 생성 데이터 준비
    const postData: PostInsert = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      slug,
      author_id: userId,
      category_id: category_id || null,
      status,
      cover_image_url: featured_image || null,
      view_count: 0
    };

    console.log('📝 게시물 생성 데이터:', postData);

    const { data: post, error } = await supabase
      .from('posts')
      .insert(postData)
      .select('*')
      .single();

    if (error) {
      console.error('❌ 게시물 생성 오류:', error);
      return NextResponse.json({
        success: false,
        error: '게시물 생성에 실패했습니다: ' + error.message
      } as ApiResponse, { status: 500 });
    }

    console.log('✅ 게시물 생성 성공:', post);

    return NextResponse.json({
      success: true,
      data: post,
      message: '게시물이 성공적으로 생성되었습니다.'
    } as ApiResponse<Post>, { status: 201 });

  } catch (error) {
    console.error('❌ POST /api/posts 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    } as ApiResponse, { status: 500 });
  }
}
