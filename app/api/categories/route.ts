/**
 * 카테고리 API 라우트 (2025년 새로운 Third-Party Auth 방식)
 * 
 * GET: 모든 카테고리 조회
 * POST: 새 카테고리 생성 (인증된 사용자만)
 * 
 * 특징:
 * - Clerk auth() 함수로 사용자 인증
 * - 카테고리별 게시물 수 집계 옵션
 * - TypeScript 타입 안전성
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Database, ApiResponse } from '@/types/database.types';

// 타입 정의
type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

// ========================================
// GET: 모든 카테고리 조회
// ========================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('=== 카테고리 목록 조회 API 호출 ===');

    // URL 파라미터 추출
    const { searchParams } = new URL(request.url);
    const includePostCount = searchParams.get('includePostCount') === 'true';

    // 서버 Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient();

    // 카테고리 조회
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('카테고리 조회 오류:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: '카테고리를 불러오는데 실패했습니다' 
        } as ApiResponse,
        { status: 500 }
      );
    }

    let result = categories || [];

    // 게시물 수 포함 요청 시
    if (includePostCount && categories) {
      console.log('게시물 수 포함하여 조회');
      
      // 각 카테고리별 게시물 수 조회
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const { count } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('status', 'published');

          return {
            ...category,
            post_count: count || 0
          };
        })
      );

      result = categoriesWithCount;
    }

    console.log(`✅ 카테고리 ${result.length}개 조회 성공`);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('카테고리 목록 조회 중 오류:', error);
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
// POST: 새 카테고리 생성 (인증된 사용자만)
// ========================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('=== 카테고리 생성 API 호출 ===');

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

    // 요청 데이터 파싱
    const body = await request.json();
    console.log('요청 데이터:', body);

    const { name, slug, description, color } = body;

    // 필수 필드 검증
    if (!name || !slug) {
      console.log('❌ 필수 필드 누락:', {
        name: !!name,
        slug: !!slug,
      });
      return NextResponse.json(
        { 
          success: false, 
          error: '카테고리 이름과 슬러그는 필수입니다' 
        } as ApiResponse,
        { status: 400 }
      );
    }

    // 서버 Supabase 클라이언트 생성 (Clerk 토큰 포함)
    const supabase = await createServerSupabaseClient();

    // 슬러그 중복 확인
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingCategory) {
      return NextResponse.json(
        { 
          success: false, 
          error: '이미 사용 중인 슬러그입니다' 
        } as ApiResponse,
        { status: 400 }
      );
    }

    // 이름 중복 확인
    const { data: existingName } = await supabase
      .from('categories')
      .select('id')
      .eq('name', name)
      .single();

    if (existingName) {
      return NextResponse.json(
        { 
          success: false, 
          error: '이미 사용 중인 카테고리 이름입니다' 
        } as ApiResponse,
        { status: 400 }
      );
    }

    // 새 카테고리 데이터 준비
    const newCategory: CategoryInsert = {
      name,
      slug,
      description: description || null,
      color: color || '#6366f1' // 기본 색상
    };

    console.log('💾 Supabase에 카테고리 삽입 시도:', newCategory);

    // 카테고리 생성
    const { data: category, error } = await supabase
      .from('categories')
      .insert(newCategory)
      .select('*')
      .single();

    if (error) {
      console.error('카테고리 생성 오류:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: `카테고리 생성에 실패했습니다: ${error.message}` 
        } as ApiResponse,
        { status: 500 }
      );
    }

    console.log('✅ 카테고리 생성 성공:', category);

    const response: ApiResponse<Category> = {
      success: true,
      data: category,
      message: '카테고리가 성공적으로 생성되었습니다'
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('카테고리 생성 중 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '서버 오류가 발생했습니다' 
      } as ApiResponse,
      { status: 500 }
    );
  }
} 