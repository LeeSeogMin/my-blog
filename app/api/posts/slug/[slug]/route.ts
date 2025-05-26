import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { Database } from '@/types/database.types';

type Post = Database['public']['Tables']['posts']['Row'];

// GET: slug로 게시물 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const supabase = createServerClient();

    // slug로 게시물 조회 (카테고리 정보 포함)
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '게시물을 찾을 수 없습니다' },
          { status: 404 }
        );
      }
      console.error('게시물 조회 오류:', error);
      return NextResponse.json(
        { error: '게시물을 불러오는데 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ post });

  } catch (error) {
    console.error('게시물 조회 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 