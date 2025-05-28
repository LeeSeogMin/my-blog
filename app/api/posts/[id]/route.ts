/**
 * 개별 게시물 API 라우트 (2025년 새로운 Third-Party Auth 방식)
 * 
 * GET: 특정 게시물 조회
 * PUT: 게시물 수정 (작성자 본인만 가능)
 * DELETE: 게시물 삭제 (작성자 본인만 가능)
 * 
 * 특징:
 * - Clerk auth() 함수로 사용자 인증
 * - 작성자 권한 확인 (author_id === userId)
 * - Supabase RLS 정책과 이중 보안
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Database, PostCreateRequest, ApiResponse, PaginatedResponse, PostWithCategory } from '@/types/database.types';

// 타입 정의
type Post = Database['public']['Tables']['posts']['Row'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];

// ========================================
// GET: 특정 게시물 조회
// ========================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    console.log('=== 게시물 상세 조회 API 호출 ===');
    const { id } = params;
    console.log('게시물 ID:', id);

    // 서버 Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient();

    // 게시물 조회 (카테고리 정보 포함)
    const { data: post, error } = await supabase
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

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ 게시물을 찾을 수 없음:', id);
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

    const response: ApiResponse<PostWithCategory | null> = {
      success: true,
      data: post ? (post as PostWithCategory) : null
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('게시물 조회 중 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '서버 오류가 발생했습니다' 
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// ========================================
// PUT: 게시물 수정 (작성자 본인만 가능)
// ========================================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    console.log('=== 게시물 수정 API 호출 ===');

    // Clerk 인증 확인
    const { userId } = await auth();
    console.log('Clerk 사용자 ID:', userId);

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다.'
      } as ApiResponse, { status: 401 });
    }

    const postId = params.id;
    // 타입 명시적으로 지정
    const body: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at' | 'author_id'>> = await request.json();
    // updated_at 필드 수동 추가
    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    const supabase = await createServerSupabaseClient();

    // 기존 게시물 조회 및 작성자 확인
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id, title')
      .eq('id', postId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.log('❌ 게시물을 찾을 수 없음:', postId);
        return NextResponse.json(
          { 
            success: false, 
            error: '게시물을 찾을 수 없습니다' 
          } as ApiResponse,
          { status: 404 }
        );
      }
      console.error('게시물 조회 오류:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: '게시물을 불러오는데 실패했습니다' 
        } as ApiResponse,
        { status: 500 }
      );
    }

    // 작성자 권한 확인
    if (existingPost.author_id !== userId) {
      console.log('❌ 권한 없음: 작성자가 아님');
      return NextResponse.json(
        { 
          success: false, 
          error: '권한이 없습니다' 
        } as ApiResponse,
        { status: 403 }
      );
    }

    // 슬러그 중복 확인 (자신 제외)
    if (updateData.slug) {
      const { data: duplicatePost } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', postId)
        .single();

      if (duplicatePost) {
        return NextResponse.json(
          { 
            success: false, 
            error: '이미 사용 중인 슬러그입니다' 
          } as ApiResponse,
          { status: 400 }
        );
      }
    }

    console.log('💾 게시물 업데이트 시도:', updateData);

    // 게시물 업데이트
    const { data: post, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          color
        )
      `)
      .single();

    if (error) {
      console.error('게시물 수정 오류:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: '게시물 수정에 실패했습니다' 
        } as ApiResponse,
        { status: 500 }
      );
    }

    console.log('✅ 게시물 수정 성공:', post.title);

    const response: ApiResponse<PostWithCategory | null> = {
      success: true,
      data: post ? (post as PostWithCategory) : null,
      message: '게시물이 성공적으로 수정되었습니다'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('게시물 수정 중 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '서버 오류가 발생했습니다' 
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// ========================================
// DELETE: 게시물 삭제 (작성자 본인만 가능)
// ========================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    console.log('=== 게시물 삭제 API 호출 ===');

    // Clerk 인증 확인
    const { userId } = await auth();
    console.log('Clerk 사용자 ID:', userId);

    if (!userId) {
      console.log('❌ 인증 실패: 사용자 ID가 없음');
      return NextResponse.json(
        { 
          success: false, 
          error: '인증이 필요합니다' 
        } as ApiResponse,
        { status: 401 }
      );
    }

    const { id } = params;
    console.log('삭제할 게시물 ID:', id);

    // 서버 Supabase 클라이언트 생성 (Clerk 토큰 포함)
    const supabase = await createServerSupabaseClient();

    // 기존 게시물 조회 및 작성자 확인
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id, title')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.log('❌ 게시물을 찾을 수 없음:', id);
        return NextResponse.json(
          { 
            success: false, 
            error: '게시물을 찾을 수 없습니다' 
          } as ApiResponse,
          { status: 404 }
        );
      }
      console.error('게시물 조회 오류:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: '게시물을 불러오는데 실패했습니다' 
        } as ApiResponse,
        { status: 500 }
      );
    }

    // 작성자 권한 확인
    if (existingPost.author_id !== userId) {
      console.log('❌ 권한 없음: 작성자가 아님');
      return NextResponse.json(
        { 
          success: false, 
          error: '권한이 없습니다' 
        } as ApiResponse,
        { status: 403 }
      );
    }

    // 게시물 삭제
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('게시물 삭제 오류:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: '게시물 삭제에 실패했습니다' 
        } as ApiResponse,
        { status: 500 }
      );
    }

    console.log('✅ 게시물 삭제 성공:', existingPost.title);

    const response: ApiResponse = {
      success: true,
      message: '게시물이 성공적으로 삭제되었습니다'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('게시물 삭제 중 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '서버 오류가 발생했습니다' 
      } as ApiResponse,
      { status: 500 }
    );
  }
} 