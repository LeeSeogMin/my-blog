import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { Database } from '@/types/database.types';

type Post = Database['public']['Tables']['posts']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

// GET: 특정 카테고리의 게시물 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const supabase = createServerClient();

    // 먼저 카테고리 존재 확인
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (categoryError) {
      if (categoryError.code === 'PGRST116') {
        return NextResponse.json(
          { error: '카테고리를 찾을 수 없습니다' },
          { status: 404 }
        );
      }
      console.error('카테고리 조회 오류:', categoryError);
      return NextResponse.json(
        { error: '카테고리를 불러오는데 실패했습니다' },
        { status: 500 }
      );
    }

    // 해당 카테고리의 게시물 조회
    const { data: posts, error: postsError, count } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `, { count: 'exact' })
      .eq('category_id', category.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error('게시물 조회 오류:', postsError);
      return NextResponse.json(
        { error: '게시물을 불러오는데 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      category,
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('카테고리별 게시물 조회 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 