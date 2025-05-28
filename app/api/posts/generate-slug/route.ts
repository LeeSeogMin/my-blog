import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generateSlug, generateUniqueSlug, isValidSlug } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: '제목이 필요합니다' },
        { status: 400 }
      );
    }

    // 기본 슬러그 생성
    const baseSlug = generateSlug(title);

    if (!isValidSlug(baseSlug)) {
      return NextResponse.json(
        { error: '유효한 슬러그를 생성할 수 없습니다' },
        { status: 400 }
      );
    }

    // 기존 슬러그 목록 조회
    const supabase = await createServerSupabaseClient();
    const { data: existingPosts, error } = await supabase
      .from('posts')
      .select('slug')
      .like('slug', `${baseSlug}%`);

    if (error) {
      console.error('기존 슬러그 조회 오류:', error);
      return NextResponse.json(
        { error: '슬러그 중복 확인 실패' },
        { status: 500 }
      );
    }

    const existingSlugs = existingPosts?.map(post => post.slug) || [];
    
    // 고유한 슬러그 생성
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

    return NextResponse.json({
      slug: uniqueSlug,
      isUnique: !existingSlugs.includes(uniqueSlug)
    });

  } catch (error) {
    console.error('슬러그 생성 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 