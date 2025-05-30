/**
 * 댓글 API 라우트 (GET, POST)
 * - GET: 특정 게시물의 댓글 목록 조회 (모든 사용자 접근 가능)
 * - POST: 새 댓글 작성 (Clerk 인증 필수)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Database } from '@/types/database.types';

// 댓글 테이블 타입 정의
type Comment = Database['public']['Tables']['comments']['Row'];
type CommentInsert = Database['public']['Tables']['comments']['Insert'];

/**
 * GET: 특정 게시물의 댓글 목록 조회
 * Query Parameters: postId (필수)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('=== 댓글 목록 조회 API 호출 ===');
    
    // URL에서 postId 파라미터 추출
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    if (!postId) {
      console.log('❌ postId 파라미터 누락');
      return NextResponse.json(
        { error: 'postId 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }
    
    console.log('📝 댓글 조회 대상 게시물:', postId);
    
    // Supabase 클라이언트 생성 (인증 없이 공개 조회)
    const supabase = await createServerSupabaseClient();
    
    // 댓글 목록 조회 (최신순 정렬)
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('댓글 조회 중 오류:', error);
      return NextResponse.json(
        { error: '댓글을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    console.log(`✅ 댓글 ${comments?.length || 0}개 조회 완료`);
    
    // 일관된 응답 구조로 반환
    return NextResponse.json({
      comments: comments || []
    });
    
  } catch (error) {
    console.error('댓글 조회 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST: 새 댓글 작성
 * Body: { postId: string, content: string }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== 댓글 작성 API 호출 ===');
    
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ 인증되지 않은 사용자');
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    console.log('👤 댓글 작성 사용자:', userId);
    
    // 요청 본문 파싱
    const body = await request.json();
    const { postId, content } = body;
    
    // 입력값 검증
    if (!postId || !content) {
      console.log('❌ 필수 데이터 누락:', { postId: !!postId, content: !!content });
      return NextResponse.json(
        { error: 'postId와 content가 필요합니다.' },
        { status: 400 }
      );
    }
    
    if (content.trim().length < 1) {
      console.log('❌ 댓글 내용이 비어있음');
      return NextResponse.json(
        { error: '댓글 내용을 입력해주세요.' },
        { status: 400 }
      );
    }
    
    if (content.length > 1000) {
      console.log('❌ 댓글 내용이 너무 김');
      return NextResponse.json(
        { error: '댓글은 1000자 이하로 작성해주세요.' },
        { status: 400 }
      );
    }
    
    console.log('📝 댓글 작성 데이터:', { postId, contentLength: content.length });
    
    // Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient();
    
    // 새 댓글 데이터 준비
    const newComment: CommentInsert = {
      post_id: postId,
      user_id: userId,
      content: content.trim(),
      user_name: null, // Clerk에서 나중에 가져올 예정
      user_email: null, // Clerk에서 나중에 가져올 예정
      parent_id: null, // 대댓글 기능은 나중에 구현
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 댓글 저장
    const { data: comment, error } = await supabase
      .from('comments')
      .insert([newComment])
      .select('*')
      .single();
    
    if (error) {
      console.error('댓글 저장 중 오류:', error);
      return NextResponse.json(
        { error: '댓글 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    if (!comment) {
      console.error('댓글 저장 후 데이터가 반환되지 않음');
      return NextResponse.json(
        { error: '댓글 저장에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    console.log('✅ 댓글 작성 완료:', comment.id);
    
    // 일관된 응답 구조로 반환
    return NextResponse.json({
      comment: comment
    }, { status: 201 });
    
  } catch (error) {
    console.error('댓글 작성 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
