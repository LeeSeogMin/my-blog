import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase-server';
import { Database } from '@/types/database.types';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

// GET: 모든 카테고리 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // 카테고리 조회 (게시물 개수 포함)
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        *,
        posts (count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('카테고리 조회 오류:', error);
      return NextResponse.json(
        { error: '카테고리를 불러오는데 실패했습니다' },
        { status: 500 }
      );
    }

    // 게시물 개수를 포함한 카테고리 데이터 변환
    const categoriesWithCount = categories?.map(category => ({
      ...category,
      postCount: category.posts?.[0]?.count || 0
    })) || [];

    return NextResponse.json({
      categories: categoriesWithCount
    });

  } catch (error) {
    console.error('카테고리 조회 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// POST: 새 카테고리 생성 (인증된 사용자만)
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, slug, description } = body;

    // 필수 필드 검증
    if (!name || !slug) {
      return NextResponse.json(
        { error: '카테고리명과 슬러그는 필수입니다' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // 슬러그 중복 확인
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingCategory) {
      return NextResponse.json(
        { error: '이미 사용 중인 슬러그입니다' },
        { status: 400 }
      );
    }

    // 새 카테고리 생성
    const newCategory: CategoryInsert = {
      name,
      slug,
      description: description || null
    };

    const { data: category, error } = await supabase
      .from('categories')
      .insert(newCategory)
      .select()
      .single();

    if (error) {
      console.error('카테고리 생성 오류:', error);
      return NextResponse.json(
        { error: '카테고리 생성에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { category, message: '카테고리가 성공적으로 생성되었습니다' },
      { status: 201 }
    );

  } catch (error) {
    console.error('카테고리 생성 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 