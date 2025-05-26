import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase-server';
import { Database } from '@/types/database.types';

type Post = Database['public']['Tables']['posts']['Row'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];

// GET: 특정 게시물 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabase = createServerClient();

    // 게시물 조회 (카테고리 정보 포함)
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
      .eq('id', id)
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

// PUT: 게시물 수정 (작성자 본인만 가능)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { title, content, slug, cover_image_url, category_id } = body;

    const supabase = createServerClient();

    // 기존 게시물 조회 및 작성자 확인
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: '게시물을 찾을 수 없습니다' },
          { status: 404 }
        );
      }
      console.error('게시물 조회 오류:', fetchError);
      return NextResponse.json(
        { error: '게시물을 불러오는데 실패했습니다' },
        { status: 500 }
      );
    }

    // 작성자 권한 확인
    if (existingPost.author_id !== userId) {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    // 슬러그 중복 확인 (자신 제외)
    if (slug) {
      const { data: duplicatePost } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (duplicatePost) {
        return NextResponse.json(
          { error: '이미 사용 중인 슬러그입니다' },
          { status: 400 }
        );
      }
    }

    // 게시물 업데이트
    const updateData: PostUpdate = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (slug !== undefined) updateData.slug = slug;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
    if (category_id !== undefined) updateData.category_id = category_id;
    updateData.updated_at = new Date().toISOString();

    const { data: post, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .single();

    if (error) {
      console.error('게시물 수정 오류:', error);
      return NextResponse.json(
        { error: '게시물 수정에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      post,
      message: '게시물이 성공적으로 수정되었습니다'
    });

  } catch (error) {
    console.error('게시물 수정 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// DELETE: 게시물 삭제 (작성자 본인만 가능)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { id } = params;
    const supabase = createServerClient();

    // 기존 게시물 조회 및 작성자 확인
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: '게시물을 찾을 수 없습니다' },
          { status: 404 }
        );
      }
      console.error('게시물 조회 오류:', fetchError);
      return NextResponse.json(
        { error: '게시물을 불러오는데 실패했습니다' },
        { status: 500 }
      );
    }

    // 작성자 권한 확인
    if (existingPost.author_id !== userId) {
      return NextResponse.json(
        { error: '권한이 없습니다' },
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
        { error: '게시물 삭제에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '게시물이 성공적으로 삭제되었습니다'
    });

  } catch (error) {
    console.error('게시물 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 