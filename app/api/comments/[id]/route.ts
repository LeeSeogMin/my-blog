import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Database } from '@/types/database.types';

// 댓글 수정 (PUT)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '댓글을 수정하려면 로그인이 필요합니다' }, { status: 401 });
    }
    const commentId = params.id;
    const body = await request.json();
    const { content } = body;
    if (!content) {
      return NextResponse.json({ error: '내용은 필수입니다' }, { status: 400 });
    }
    const supabase = await createServerSupabaseClient();
    // 댓글 존재 및 권한 확인
    const { data: comment, error: getError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .single();
    if (getError || !comment) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다' }, { status: 404 });
    }
    if (comment.user_id !== userId) {
      return NextResponse.json({ error: '자신의 댓글만 수정할 수 있습니다' }, { status: 403 });
    }
    // 댓글 내용 수정
    const { data: updated, error: updateError } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select('*')
      .single();
    if (updateError) {
      return NextResponse.json({ error: '댓글 수정 중 오류가 발생했습니다' }, { status: 500 });
    }
    return NextResponse.json({ success: true, comment: updated });
  } catch (error) {
    console.error('댓글 수정 오류:', error);
    return NextResponse.json({ error: '댓글 수정 중 오류가 발생했습니다' }, { status: 500 });
  }
}

// 댓글 삭제 (DELETE)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '댓글을 삭제하려면 로그인이 필요합니다' }, { status: 401 });
    }
    const commentId = params.id;
    const supabase = await createServerSupabaseClient();
    // 댓글 존재 및 권한 확인
    const { data: comment, error: getError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .single();
    if (getError || !comment) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다' }, { status: 404 });
    }
    if (comment.user_id !== userId) {
      return NextResponse.json({ error: '자신의 댓글만 삭제할 수 있습니다' }, { status: 403 });
    }
    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    if (deleteError) {
      return NextResponse.json({ error: '댓글 삭제 중 오류가 발생했습니다' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    return NextResponse.json({ error: '댓글 삭제 중 오류가 발생했습니다' }, { status: 500 });
  }
} 