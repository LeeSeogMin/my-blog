import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    console.log('=== Supabase 연결 테스트 시작 ===');
    
    // Clerk 인증 확인
    const { userId } = await auth();
    console.log('Clerk 사용자 ID:', userId);
    
    // Supabase 클라이언트 생성
    const supabase = createServerClient();
    console.log('Supabase 클라이언트 생성 완료');
    
    // 간단한 쿼리 테스트
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title')
      .limit(1);
    
    if (error) {
      console.error('Supabase 쿼리 오류:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }
    
    console.log('Supabase 쿼리 성공:', posts);
    
    return NextResponse.json({
      success: true,
      message: 'Supabase 연결 성공',
      userId: userId,
      postsCount: posts?.length || 0,
      samplePost: posts?.[0] || null
    });
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 